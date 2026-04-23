/**
 * Typed API client — all calls go through /api/* which Vite proxies to :8000.
 */

const BASE = "/api";

// ── Types (mirroring src/lib/types.ts + server additions) ─────────────────────

export interface FuelReceiptIn {
  stationName: string;
  addressLine1: string;
  addressLine2: string;
  gstNo: string;
  telNo: string;
  receiptNo: string;
  product: "Petrol" | "Diesel";
  rate: number;
  volume: number;
  total: number;
  dateTime: string;
  paymentMode: "Online" | "Cash" | "Card";
  vehicleType: string;
  vehicleNo: string;
  customerName: string;
}

export interface FuelBillRecord extends FuelReceiptIn {
  id: number;
  created_at: string; // ISO UTC
}

export interface DriverSalaryIn {
  employerName: string;
  driverName: string;
  vehicleNo: string;
  salaryMonth: string;
  salaryYear: string;
  paymentDate: string;
  amount: number;
  signatureDataUrl?: string;
}

export interface DriverBillRecord extends DriverSalaryIn {
  id: number;
  created_at: string;
}

export interface SaveResponse {
  id: number;
  created_at: string;
}

// ── Fuel ───────────────────────────────────────────────────────────────────────

export async function saveFuelBill(data: FuelReceiptIn): Promise<SaveResponse> {
  const res = await fetch(`${BASE}/fuel`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to save fuel bill: ${res.statusText}`);
  return res.json();
}

export async function listFuelBills(): Promise<FuelBillRecord[]> {
  const res = await fetch(`${BASE}/fuel`);
  if (!res.ok) throw new Error(`Failed to fetch fuel bills: ${res.statusText}`);
  return res.json();
}

export async function deleteFuelBill(id: number): Promise<void> {
  const res = await fetch(`${BASE}/fuel/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete fuel bill: ${res.statusText}`);
}

/**
 * Download a fuel PDF from the backend. Opens the file as a browser download.
 */
export function downloadFuelPdf(id: number, receiptNo: string): void {
  const a = document.createElement("a");
  a.href = `${BASE}/fuel/${id}/pdf`;
  a.download = `Fuel_Receipt_${receiptNo}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ── Driver ─────────────────────────────────────────────────────────────────────

export async function saveDriverBill(data: DriverSalaryIn): Promise<SaveResponse> {
  const res = await fetch(`${BASE}/driver`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to save driver bill: ${res.statusText}`);
  return res.json();
}

export async function listDriverBills(): Promise<DriverBillRecord[]> {
  const res = await fetch(`${BASE}/driver`);
  if (!res.ok) throw new Error(`Failed to fetch driver bills: ${res.statusText}`);
  return res.json();
}

export async function deleteDriverBill(id: number): Promise<void> {
  const res = await fetch(`${BASE}/driver/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete driver bill: ${res.statusText}`);
}

/**
 * Download a driver salary PDF from the backend.
 */
export function downloadDriverPdf(id: number, month: string, year: string): void {
  const a = document.createElement("a");
  a.href = `${BASE}/driver/${id}/pdf`;
  a.download = `Driver_Salary_${month}_${year}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
