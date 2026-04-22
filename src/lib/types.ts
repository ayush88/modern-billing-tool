export interface FuelReceipt {
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
  dateTime: string; // ISO local
  paymentMode: "Online" | "Cash" | "Card";
  vehicleType: string;
  vehicleNo: string;
  customerName: string;
}

export interface DriverSalary {
  employerName: string;
  driverName: string;
  vehicleNo: string;
  salaryMonth: string; // "April"
  salaryYear: string; // "2026"
  paymentDate: string; // ISO date yyyy-mm-dd
  amount: number;
}
