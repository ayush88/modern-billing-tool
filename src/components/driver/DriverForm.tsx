import { DriverSalary } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

interface Props {
  value: DriverSalary;
  onChange: (next: DriverSalary) => void;
}

export function DriverForm({ value, onChange }: Props) {
  const set = <K extends keyof DriverSalary>(k: K, v: DriverSalary[K]) =>
    onChange({ ...value, [k]: v });

  const handleSignatureUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...value, signatureDataUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Employer Name">
        <Input value={value.employerName} onChange={(e) => set("employerName", e.target.value)} />
      </Field>
      <Field label="Driver Name">
        <Input value={value.driverName} onChange={(e) => set("driverName", e.target.value)} />
      </Field>
      <Field label="Vehicle No">
        <Input value={value.vehicleNo} onChange={(e) => set("vehicleNo", e.target.value)} />
      </Field>
      <Field label="Date of Payment">
        <Input type="date" value={value.paymentDate} onChange={(e) => set("paymentDate", e.target.value)} />
      </Field>
      <Field label="Salary Month">
        <Select value={value.salaryMonth} onValueChange={(v) => set("salaryMonth", v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Year">
        <Input value={value.salaryYear} onChange={(e) => set("salaryYear", e.target.value)} />
      </Field>
      <Field label="Amount Paid (₹)" className="sm:col-span-2">
        <Input type="number" value={value.amount} onChange={(e) => set("amount", +e.target.value)} />
      </Field>

      <Field label="Signature (overlays revenue stamp)" className="sm:col-span-2">
        <div className="flex items-center gap-3">
          <Input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => handleSignatureUpload(e.target.files?.[0] ?? null)}
          />
          {value.signatureDataUrl && (
            <>
              <img src={value.signatureDataUrl} alt="signature" className="h-10 w-auto rounded border" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onChange({ ...value, signatureDataUrl: undefined })}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground">PNG with transparent background works best.</p>
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
