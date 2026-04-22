import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export interface PdfOptions {
  filename: string;
  format: "a4" | "thermal";
}

export async function exportElementToPdf(node: HTMLElement, opts: PdfOptions) {
  const canvas = await html2canvas(node, {
    scale: 3,
    backgroundColor: "#ffffff",
    useCORS: true,
  });
  const imgData = canvas.toDataURL("image/png");

  let pdf: jsPDF;
  let pageW: number;
  let pageH: number;

  if (opts.format === "thermal") {
    // 80mm wide thermal strip; height proportional to canvas
    pageW = 80;
    pageH = (canvas.height * pageW) / canvas.width;
    pdf = new jsPDF({ unit: "mm", format: [pageW, pageH], orientation: "portrait" });
  } else {
    pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    pageW = 210;
    pageH = 297;
  }

  if (opts.format === "thermal") {
    pdf.addImage(imgData, "PNG", 0, 0, pageW, pageH);
  } else {
    // fit width with margin
    const margin = 10;
    const w = pageW - margin * 2;
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(imgData, "PNG", margin, margin, w, Math.min(h, pageH - margin * 2));
  }

  pdf.save(opts.filename);
}
