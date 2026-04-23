import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";

export interface A4PlacementOptions {
  filename: string;
  /** placement on the A4 page, in cm */
  xCm: number;
  yCm: number;
  widthCm: number;
  heightCm: number;
  /** rasterization scale — higher = sharper but larger file. 2 is a good balance. */
  pixelRatio?: number;
  /** JPEG quality 0..1 — 0.85 keeps it crisp while staying small */
  quality?: number;
}

/**
 * Capture a DOM node and place it on an A4 PDF at exact cm coordinates.
 * Uses JPEG to keep file sizes small (PNG of the same content can be 10–20×).
 */
export async function exportElementToA4Pdf(
  node: HTMLElement,
  opts: A4PlacementOptions,
) {
  const pixelRatio = opts.pixelRatio ?? 2;
  const quality = opts.quality ?? 0.85;

  // Wait for fonts and any pending images so the capture matches the live preview.
  if (document.fonts && (document.fonts as any).ready) {
    try {
      await (document.fonts as any).ready;
    } catch {
      /* noop */
    }
  }
  await Promise.all(
    Array.from(node.querySelectorAll("img")).map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );

  const dataUrl = await toJpeg(node, {
    pixelRatio,
    quality,
    backgroundColor: "#ffffff",
    cacheBust: true,
  });

  const pdf = new jsPDF({ unit: "cm", format: "a4", orientation: "portrait" });
  pdf.addImage(
    dataUrl,
    "JPEG",
    opts.xCm,
    opts.yCm,
    opts.widthCm,
    opts.heightCm,
    undefined,
    "FAST",
  );
  pdf.save(opts.filename);
}
