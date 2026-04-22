import { toPng } from "html-to-image";
import jsPDF from "jspdf";

export interface PdfOptions {
  filename: string;
  format: "a4" | "thermal";
}

export async function exportElementToPdf(node: HTMLElement, opts: PdfOptions) {
  // html-to-image handles modern CSS (oklch, etc.) by rasterizing via SVG <foreignObject>
  const dataUrl = await toPng(node, {
    pixelRatio: 3,
    backgroundColor: "#ffffff",
    cacheBust: true,
  });

  // Get pixel dimensions of the captured image
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  let pdf: jsPDF;
  let pageW: number;
  let pageH: number;

  if (opts.format === "thermal") {
    pageW = 80;
    pageH = (img.height * pageW) / img.width;
    pdf = new jsPDF({ unit: "mm", format: [pageW, pageH], orientation: "portrait" });
    pdf.addImage(dataUrl, "PNG", 0, 0, pageW, pageH);
  } else {
    pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    pageW = 210;
    pageH = 297;
    const margin = 10;
    const w = pageW - margin * 2;
    const h = (img.height * w) / img.width;
    pdf.addImage(dataUrl, "PNG", margin, margin, w, Math.min(h, pageH - margin * 2));
  }

  pdf.save(opts.filename);
}
