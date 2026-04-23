"""
FPDF2-based fuel receipt PDF generator.
Produces an 80mm-wide thermal-printer-style receipt using Courier font
to match the VT323 monospace look of the FuelPreview component.
"""
from __future__ import annotations

import io
from pathlib import Path
from fpdf import FPDF
from schemas import FuelReceiptIn

ASSETS_DIR = Path(__file__).parent / "assets"
PAGE_W = 80  # mm — standard thermal roll width


def _fmt_date(iso: str) -> str:
    """Convert '2026-04-22T14:30' → '2026-04-22 14:30'."""
    if not iso:
        return ""
    return iso.replace("T", " ")


def generate_fuel_pdf(data: FuelReceiptIn) -> bytes:
    """Return PDF bytes for the given fuel receipt."""

    # ── Layout constants ──────────────────────────────────────────────────────
    MARGIN_L = 4   # mm left margin
    MARGIN_R = 6   # mm right margin (smaller — leaves space for HDFC strip)
    FONT_SM = 7    # small font size (GST, tel etc.)
    FONT_MD = 8    # standard line font
    FONT_LG = 10   # station name / header

    TEXT_W = PAGE_W - MARGIN_L - MARGIN_R  # usable text width

    # We build content first into a list, then calculate total height
    pdf = FPDF(unit="mm", format=(PAGE_W, 200))  # height will be adjusted
    pdf.set_auto_page_break(False)
    pdf.add_page()
    pdf.set_margins(MARGIN_L, 4, MARGIN_R)
    pdf.set_font("Courier", style="B", size=FONT_MD)

    y = 6  # current y cursor

    def write_line(text: str, size: int = FONT_MD, bold: bool = True, center: bool = False) -> None:
        nonlocal y
        pdf.set_xy(MARGIN_L, y)
        pdf.set_font("Courier", style="B" if bold else "", size=size)
        if center:
            pdf.cell(TEXT_W, 4, text, align="C", new_x="LMARGIN", new_y="NEXT")
        else:
            pdf.multi_cell(TEXT_W, 4, text, align="L")
        y = pdf.get_y()

    def write_kv(key: str, value: str, size: int = FONT_MD) -> None:
        nonlocal y
        pdf.set_xy(MARGIN_L, y)
        pdf.set_font("Courier", style="B", size=size)
        line = f"{key}: {value}" if value else f"{key}:"
        pdf.multi_cell(TEXT_W, 4, line, align="L")
        y = pdf.get_y()

    def spacer(mm: float = 3) -> None:
        nonlocal y
        y += mm

    # ── HDFC decorative strip (right edge, two rows) ──────────────────────────
    hdfc_path = ASSETS_DIR / "hdfc-side.webp"
    if hdfc_path.exists():
        # Draw two thin vertical bars on the right edge
        strip_x = PAGE_W - 5
        for top in [6, 50]:
            pdf.image(str(hdfc_path), x=strip_x, y=top, w=4, h=35)

    # ── Header ────────────────────────────────────────────────────────────────
    write_line("WELCOME!!!", size=FONT_LG, center=True)
    write_line(data.stationName, size=FONT_LG, center=True)
    write_line(data.addressLine1, size=FONT_MD, center=True)
    write_line(data.addressLine2, size=FONT_MD, center=True)
    spacer(4)

    # ── Block 1: station meta ─────────────────────────────────────────────────
    write_kv("GST NO", data.gstNo)
    write_kv("TEL NO", data.telNo)
    write_kv("RECEIPT NO", data.receiptNo)
    write_kv("FCC ID", "")
    write_kv("FIP NO", "")
    write_kv("NOZZLE NO", "")
    spacer(4)

    # ── Block 2: product / amount ─────────────────────────────────────────────
    write_kv("PRODUCT", data.product)
    write_kv("RATE/LTR", f"Rs {data.rate:.2f}")
    write_kv("AMOUNT", f"Rs {data.total:.2f}")
    write_kv("VOLUME(LTR)", f"{data.volume:.2f} lt")
    spacer(4)

    # ── Block 3: vehicle ──────────────────────────────────────────────────────
    write_kv("VEH TYPE", data.vehicleType or data.product)
    write_kv("VEH NO", data.vehicleNo)
    write_kv("CUSTOMER NAME", data.customerName)
    spacer(4)

    # ── Block 4: payment meta ─────────────────────────────────────────────────
    write_kv("DATE", _fmt_date(data.dateTime))
    write_kv("MODE", data.paymentMode)
    write_kv("LST NO", "")
    write_kv("VAT NO", "")
    write_kv("ATTENDENT ID", "not available")
    spacer(6)

    # ── Footer ────────────────────────────────────────────────────────────────
    write_line("*" * 22, center=True)
    write_line("Thank You! Visit Again", center=True)
    write_line("Save Fuel, Save Money.", center=True)
    spacer(6)

    # ── Trim page to content height ───────────────────────────────────────────
    final_h = max(y + 4, 80)
    pdf2 = FPDF(unit="mm", format=(PAGE_W, final_h))
    pdf2.set_auto_page_break(False)
    pdf2.add_page()
    pdf2.set_margins(MARGIN_L, 4, MARGIN_R)

    # Re-draw on correctly sized page
    y = 6

    if hdfc_path.exists():
        strip_x = PAGE_W - 5
        for top in [6, min(50, final_h - 40)]:
            if top + 35 < final_h:
                pdf2.image(str(hdfc_path), x=strip_x, y=top, w=4, h=35)

    def w2(text: str, size: int = FONT_MD, bold: bool = True, center: bool = False):
        nonlocal y
        pdf2.set_xy(MARGIN_L, y)
        pdf2.set_font("Courier", style="B" if bold else "", size=size)
        if center:
            pdf2.cell(TEXT_W, 4, text, align="C", new_x="LMARGIN", new_y="NEXT")
        else:
            pdf2.multi_cell(TEXT_W, 4, text, align="L")
        y = pdf2.get_y()

    def kv2(key: str, value: str, size: int = FONT_MD):
        nonlocal y
        pdf2.set_xy(MARGIN_L, y)
        pdf2.set_font("Courier", style="B", size=size)
        line = f"{key}: {value}" if value else f"{key}:"
        pdf2.multi_cell(TEXT_W, 4, line, align="L")
        y = pdf2.get_y()

    def sp2(mm: float = 3):
        nonlocal y
        y += mm

    w2("WELCOME!!!", size=FONT_LG, center=True)
    w2(data.stationName, size=FONT_LG, center=True)
    w2(data.addressLine1, size=FONT_MD, center=True)
    w2(data.addressLine2, size=FONT_MD, center=True)
    sp2(4)
    kv2("GST NO", data.gstNo); kv2("TEL NO", data.telNo)
    kv2("RECEIPT NO", data.receiptNo); kv2("FCC ID", ""); kv2("FIP NO", ""); kv2("NOZZLE NO", "")
    sp2(4)
    kv2("PRODUCT", data.product); kv2("RATE/LTR", f"Rs {data.rate:.2f}")
    kv2("AMOUNT", f"Rs {data.total:.2f}"); kv2("VOLUME(LTR)", f"{data.volume:.2f} lt")
    sp2(4)
    kv2("VEH TYPE", data.vehicleType or data.product); kv2("VEH NO", data.vehicleNo)
    kv2("CUSTOMER NAME", data.customerName)
    sp2(4)
    kv2("DATE", _fmt_date(data.dateTime)); kv2("MODE", data.paymentMode)
    kv2("LST NO", ""); kv2("VAT NO", ""); kv2("ATTENDENT ID", "not available")
    sp2(6)
    w2("*" * 22, center=True); w2("Thank You! Visit Again", center=True)
    w2("Save Fuel, Save Money.", center=True)

    buf = io.BytesIO()
    pdf2.output(buf)
    return buf.getvalue()
