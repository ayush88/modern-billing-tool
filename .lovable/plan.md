
## Bill Generator — Apple-style Dashboard

A clean, minimalist React app (TanStack Start) for generating two types of bills with a pixel-accurate live preview and one-click PDF export.

### Layout
- **Left sidebar** (collapsible): App title "Bill Generator", two nav items — `Fuel Receipt` and `Driver Salary`. Subtle icons, soft shadows, rounded corners, generous whitespace.
- **Main area**: Two-column split.
  - Left column: Form card with grouped inputs.
  - Right column: Sticky live-preview card + `Download PDF` button.

### Fuel Receipt module
**Form fields** (with sensible defaults):
- Station Name → `SHAHEED DESHRAJ FILL. ST.`
- Address line 1 → `SECTOR-105 NOIDA`
- Address line 2 → `G.B. NAGAR`
- GST No → `09AEFFS6429C1ZY`
- Tel No → `9015748720`
- Receipt No (auto-random, editable)
- Product (Petrol/Diesel dropdown)
- Rate per Litre (₹)
- Volume (auto-calculated from Total/Rate, editable)
- Total Amount (₹) — editing recalculates volume
- Date & Time (datetime-local, defaults to now)
- Payment Mode (dropdown: Online, Cash, Card; default Online)
- Vehicle Type, Vehicle No, Customer Name (optional)

**Preview**: Narrow thermal-receipt card (~320px wide) with monospace dot-matrix font (e.g. VT323/Share Tech Mono), centered "WELCOME!!!" header, left-aligned key:value rows, footer with `*****` divider and "Thank You! Visit Again / Save Fuel, Save Money." Three faded "HDFC BANK" watermarks rotated 90° down the right edge with serial code `A127016` — matches the sample exactly.

### Driver Salary module
**Form fields** (with defaults):
- Employer Name → `Ayush Agrawal`
- Driver Name → `Siyasharan Jha`
- Vehicle No → `UP16EE7180`
- Salary Month (month picker → "April", "May", etc.)
- Date of payment (defaults to today, formatted DD-MM-YYYY)
- Amount Paid (₹)

**Preview**: A4-proportioned bordered document with two stacked sections:
1. **Driver Salary Receipt** — centered bold title, then Date / Salary of the Month / Vehicle No / Amount Paid as bold-label rows, descriptive paragraph mentioning month/amount/driver, right-aligned "Employee Name: …".
2. **Receipt Acknowledgment** — centered title, repeated Date/Month/Amount, acknowledgment paragraph, right-aligned "Driver Name: …", and a "Revenue Stamp" placeholder box at the bottom-left.

### PDF export
- `html2canvas` + `jsPDF` to capture the preview node and render to PDF.
- Fuel: thermal-strip page sized to receipt aspect (~80mm wide).
- Driver: A4 portrait.
- Filename auto-generated: `Fuel_Receipt_<receiptNo>.pdf`, `Driver_Salary_<Month>_<Year>.pdf`.

### Architecture (backend-ready)
- `/src/routes/index.tsx` → redirects to `/fuel`.
- `/src/routes/fuel.tsx` and `/src/routes/driver.tsx` — separate routes (proper SSR, easy to share links).
- `/src/components/fuel/` — `FuelForm.tsx`, `FuelPreview.tsx`.
- `/src/components/driver/` — `DriverForm.tsx`, `DriverPreview.tsx`.
- `/src/components/AppSidebar.tsx` — shadcn sidebar.
- `/src/lib/pdf.ts` — single `exportElementToPdf(node, opts)` helper.
- `/src/lib/types.ts` — `FuelReceipt` and `DriverSalary` interfaces (ready to swap localStorage → API later).
- State kept in route-level `useState` for now, but typed with shared interfaces so a future hook (`useFuelReceipts`) can swap to a backend cleanly.

### Design system
- Light, near-white background; soft shadows; `rounded-2xl` cards; Inter for UI; monospace font loaded only inside the fuel preview.
- Defaults pre-fill on first visit so the user sees a complete preview immediately.
