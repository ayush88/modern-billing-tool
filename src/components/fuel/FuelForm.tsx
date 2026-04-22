import { FuelReceipt } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  value: FuelReceipt;
  onChange: (next: FuelReceipt) => void;
}

export function FuelForm({ value, onChange }: Props) {
  const set = <K extends keyof FuelReceipt>(k: K, v: FuelReceipt[K]) =>
    onChange({ ...value, [k]: v });

  const setRate = (rate: number) => {
    const volume = rate > 0 ? +(value.total / rate).toFixed(2) : 0;
    onChange({ ...value, rate, volume });
  };
  const setTotal = (total: number) => {
    const volume = value.rate > 0 ? +(total / value.rate).toFixed(2) : 0;
    onChange({ ...value, total, volume });
  };
  const setVolume = (volume: number) => {
    const total = +(volume * value.rate).toFixed(2);
    onChange({ ...value, volume, total });
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Station Name" className="sm:col-span-2">
        <Input value={value.stationName} onChange={(e) => set("stationName", e.target.value)} />
      </Field>
      <Field label="Address Line 1">
        <Input value={value.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} />
      </Field>
      <Field label="Address Line 2">
        <Input value={value.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} />
      </Field>
      <Field label="GST No">
        <Input value={value.gstNo} onChange={(e) => set("gstNo", e.target.value)} />
      </Field>
      <Field label="Tel No">
        <Input value={value.telNo} onChange={(e) => set("telNo", e.target.value)} />
      </Field>
      <Field label="Receipt No">
        <Input value={value.receiptNo} onChange={(e) => set("receiptNo", e.target.value)} />
      </Field>
      <Field label="Date & Time">
        <Input
          type="datetime-local"
          value={value.dateTime}
          onChange={(e) => set("dateTime", e.target.value)}
        />
      </Field>
      <Field label="Product">
        <Select value={value.product} onValueChange={(v) => set("product", v as "Petrol" | "Diesel")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Petrol">Petrol</SelectItem>
            <SelectItem value="Diesel">Diesel</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Payment Mode">
        <Select value={value.paymentMode} onValueChange={(v) => set("paymentMode", v as FuelReceipt["paymentMode"]) }>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Online">Online</SelectItem>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Card">Card</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Rate / Litre (₹)">
        <Input type="number" step="0.01" value={value.rate} onChange={(e) => setRate(+e.target.value)} />
      </Field>
      <Field label="Total Amount (₹)">
        <Input type="number" step="0.01" value={value.total} onChange={(e) => setTotal(+e.target.value)} />
      </Field>
      <Field label="Volume (L)">
        <Input type="number" step="0.01" value={value.volume} onChange={(e) => setVolume(+e.target.value)} />
      </Field>
      <Field label="Vehicle Type">
        <Input value={value.vehicleType} onChange={(e) => set("vehicleType", e.target.value)} />
      </Field>
      <Field label="Vehicle No">
        <Input value={value.vehicleNo} onChange={(e) => set("vehicleNo", e.target.value)} />
      </Field>
      <Field label="Customer Name" className="sm:col-span-2">
        <Input value={value.customerName} onChange={(e) => set("customerName", e.target.value)} />
      </Field>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
