"""
FPDF2-based driver salary slip PDF generator.
Produces an A4 portrait PDF matching the DriverPreview component layout:
  - Bordered box
  - Section 1: Salary Receipt
  - Section 2: Receipt Acknowledgment with revenue stamp + optional signature
"""
from __future__ import annotations

import base64
import io
import re
from pathlib import Path

from fpdf import FPDF
from schemas import DriverSalaryIn

ASSETS_DIR = Path(__file__).parent / "assets"
PAGE_W, PAGE_H = 210, 297   # A4 mm


# ── Helpers ───────────────────────────────────────────────────────────────────

def _fmt_date(iso: str) -> str:
    """'2026-04-22' → '22-04-2026'"""
    if not iso:
        return ""
    parts = iso.split("-")
    if len(parts) == 3:
        return f"{parts[2]}-{parts[1]}-{parts[0]}"
    return iso


def _in_words(n: int) -> str:
    """Convert integer rupee amount to English words (Indian numbering)."""
    if n == 0:
        return "Zero Rupees Only"
    a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
         "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
         "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
    b = ["", "", "Twenty", "Thirty", "Forty", "Fifty",
         "Sixty", "Seventy", "Eighty", "Ninety"]

    def num(x: int) -> str:
        if x < 20:
            return a[x]
        if x < 100:
            return b[x // 10] + (" " + a[x % 10] if x % 10 else "")
        if x < 1000:
            return a[x // 100] + " Hundred" + (" " + num(x % 100) if x % 100 else "")
        return ""

    res = ""
    crore, n = divmod(n, 10_000_000)
    lakh, n = divmod(n, 100_000)
    thou, hund = divmod(n, 1000)
    if crore:
        res += num(crore) + " Crore "
    if lakh:
        res += num(lakh) + " Lakh "
    if thou:
        res += num(thou) + " Thousand "
    if hund:
        res += num(hund)
    return res.strip() + " Rupees Only"


def _extract_image_bytes(data_url: str) -> tuple[bytes, str]:
    """Extract raw bytes and extension from a base64 data URL."""
    match = re.match(r"data:image/(\w+);base64,(.+)", data_url, re.DOTALL)
    if not match:
        raise ValueError("Invalid data URL")
    ext = match.group(1).upper()
    if ext == "JPG":
        ext = "JPEG"
    raw = base64.b64decode(match.group(2))
    return raw, ext


# ── Main generator ────────────────────────────────────────────────────────────

def generate_driver_pdf(data: DriverSalaryIn) -> bytes:
    """Return PDF bytes for the given driver salary slip."""

    pdf = FPDF(unit="mm", format="A4", orientation="P")
    pdf.set_auto_page_break(False)
    pdf.add_page()

    # Outer border
    BORDER_X = 15
    BORDER_Y = 15
    BORDER_W = PAGE_W - 30
    BORDER_H = PAGE_H - 30
    pdf.set_line_width(0.6)
    pdf.rect(BORDER_X, BORDER_Y, BORDER_W, BORDER_H)

    # Content margins (inside the border)
    CX = BORDER_X + 8          # content left x
    CW = BORDER_W - 16         # content width
    FONT_BODY = 11
    FONT_HEAD = 13
    FONT_SMALL = 10

    y = BORDER_Y + 10

    def heading(text: str) -> None:
        nonlocal y
        pdf.set_font("Helvetica", style="B", size=FONT_HEAD)
        pdf.set_xy(CX, y)
        pdf.cell(CW, 6, text, align="C", new_x="LMARGIN", new_y="NEXT")
        # Underline manually
        tw = pdf.get_string_width(text)
        line_x = CX + (CW - tw) / 2
        pdf.set_line_width(0.3)
        pdf.line(line_x, y + 6, line_x + tw, y + 6)
        y = pdf.get_y() + 5

    def row(key: str, value: str) -> None:
        nonlocal y
        pdf.set_font("Helvetica", style="B", size=FONT_BODY)
        pdf.set_xy(CX, y)
        pdf.cell(55, 5.5, key, align="L")
        pdf.set_font("Helvetica", style="", size=FONT_BODY)
        pdf.cell(5, 5.5, ":", align="C")
        pdf.cell(CW - 60, 5.5, value, align="L", new_x="LMARGIN", new_y="NEXT")
        y = pdf.get_y() + 1

    def para(text: str) -> None:
        nonlocal y
        pdf.set_font("Helvetica", style="", size=FONT_BODY)
        pdf.set_xy(CX, y)
        pdf.multi_cell(CW, 5.5, text, align="L")
        y = pdf.get_y() + 4

    def bold_inline(parts: list[tuple[str, bool]]) -> None:
        """Write a paragraph with mixed bold/normal spans."""
        nonlocal y
        pdf.set_xy(CX, y)
        for text, bold in parts:
            pdf.set_font("Helvetica", style="B" if bold else "", size=FONT_BODY)
            pdf.write(5.5, text)
        y = pdf.get_y() + 6

    def dashed_rule() -> None:
        nonlocal y
        y += 4
        pdf.set_line_width(0.2)
        pdf.set_dash_pattern(dash=2, gap=2)
        pdf.line(CX, y, CX + CW, y)
        pdf.set_dash_pattern()  # reset
        y += 6

    # Prepare values
    date_str = _fmt_date(data.paymentDate)
    month_year = f"{data.salaryMonth} {data.salaryYear}"
    amount_fmt = f"Rs {int(data.amount):,}".replace(",", ",")
    amount_words = _in_words(int(data.amount))

    # ── Section 1: Salary Receipt ──────────────────────────────────────────────
    heading("Driver Salary Receipt")

    row("Date", date_str)
    row("Salary of the Month", month_year)
    row("Vehicle No", data.vehicleNo)
    row("Amount Paid", amount_fmt)
    y += 3

    bold_inline([
        ("This is to certify that an amount of ", False),
        (amount_fmt, True),
        (f" ({amount_words}) has been paid to ", False),
        (data.driverName, True),
        (" as salary for the month of ", False),
        (month_year, True),
        (" for driving services rendered on vehicle ", False),
        (data.vehicleNo, True),
        (".", False),
    ])

    y += 4
    pdf.set_font("Helvetica", style="B", size=FONT_BODY)
    pdf.set_xy(CX, y)
    pdf.cell(CW, 5.5, f"Employee Name: {data.employerName}", align="R",
             new_x="LMARGIN", new_y="NEXT")
    y = pdf.get_y() + 4

    dashed_rule()

    # ── Section 2: Acknowledgment ──────────────────────────────────────────────
    heading("Receipt Acknowledgment")

    row("Date", date_str)
    row("Salary of the Month", month_year)
    row("Amount Received", amount_fmt)
    y += 3

    bold_inline([
        ("I, ", False),
        (data.driverName, True),
        (", hereby acknowledge the receipt of ", False),
        (amount_fmt, True),
        (f" ({amount_words}) from ", False),
        (data.employerName, True),
        (" as my salary for the month of ", False),
        (month_year, True),
        (".", False),
    ])

    y += 6

    # ── Stamp + signature ──────────────────────────────────────────────────────
    stamp_path = ASSETS_DIR / "revenue-stamp.webp"
    STAMP_W = 28
    STAMP_H = 28
    STAMP_X = CX

    if stamp_path.exists():
        pdf.image(str(stamp_path), x=STAMP_X, y=y, w=STAMP_W, h=STAMP_H)

    # Signature overlay (base64 data URL)
    if data.signatureDataUrl:
        try:
            sig_bytes, sig_ext = _extract_image_bytes(data.signatureDataUrl)
            sig_buf = io.BytesIO(sig_bytes)
            # Place slightly offset for realistic look
            pdf.image(
                sig_buf,
                x=STAMP_X + 4,
                y=y - 3,
                w=STAMP_W + 8,
                h=STAMP_H + 6,
                type=sig_ext,
            )
        except Exception:
            pass  # if signature parsing fails, just skip

    # Driver name (bottom right)
    pdf.set_font("Helvetica", style="B", size=FONT_BODY)
    pdf.set_xy(CX, y + STAMP_H - 5)
    pdf.cell(CW, 5.5, f"Driver Name: {data.driverName}", align="R",
             new_x="LMARGIN", new_y="NEXT")

    buf = io.BytesIO()
    pdf.output(buf)
    return buf.getvalue()
