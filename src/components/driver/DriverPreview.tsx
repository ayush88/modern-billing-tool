import { forwardRef } from "react";
import { DriverSalary } from "@/lib/types";
import revenueStamp from "@/assets/revenue-stamp.webp";

function fmtDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

function inWords(n: number): string {
  if (!n || isNaN(n)) return "";
  const a = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  const num = (x: number): string => {
    if (x < 20) return a[x];
    if (x < 100) return b[Math.floor(x/10)] + (x%10 ? " " + a[x%10] : "");
    if (x < 1000) return a[Math.floor(x/100)] + " Hundred" + (x%100 ? " " + num(x%100) : "");
    return "";
  };
  let res = "";
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thou = Math.floor(n / 1000); n %= 1000;
  const hund = n;
  if (crore) res += num(crore) + " Crore ";
  if (lakh) res += num(lakh) + " Lakh ";
  if (thou) res += num(thou) + " Thousand ";
  if (hund) res += num(hund);
  return (res.trim() || "Zero") + " Rupees Only";
}

export const DriverPreview = forwardRef<HTMLDivElement, { data: DriverSalary }>(
  ({ data }, ref) => {
    const dateStr = fmtDate(data.paymentDate);
    const monthYear = `${data.salaryMonth} ${data.salaryYear}`;
    const amountStr = `₹ ${data.amount.toLocaleString("en-IN")}`;

    return (
      <div
        ref={ref}
        className="mx-auto w-full max-w-[640px] bg-white p-10 text-black font-sans"
        style={{ fontSize: "14px", aspectRatio: "1/1.414" }}
      >
        <div className="border-2 border-black p-6">
          {/* Section 1 */}
          <div className="text-center text-lg font-bold underline">Driver Salary Receipt</div>
          <div className="mt-6 space-y-2">
            <Row k="Date" v={dateStr} />
            <Row k="Salary of the Month" v={monthYear} />
            <Row k="Vehicle No" v={data.vehicleNo} />
            <Row k="Amount Paid" v={amountStr} />
          </div>
          <p className="mt-5 leading-relaxed">
            This is to certify that an amount of <b>{amountStr}</b> ({inWords(data.amount)})
            has been paid to <b>{data.driverName}</b> as salary for the month of <b>{monthYear}</b>{" "}
            for driving services rendered on vehicle <b>{data.vehicleNo}</b>.
          </p>
          <div className="mt-10 text-right">
            <div className="font-bold">Employee Name: {data.employerName}</div>
          </div>

          <div className="my-8 border-t border-dashed border-black" />

          {/* Section 2 */}
          <div className="text-center text-lg font-bold underline">Receipt Acknowledgment</div>
          <div className="mt-6 space-y-2">
            <Row k="Date" v={dateStr} />
            <Row k="Salary of the Month" v={monthYear} />
            <Row k="Amount Received" v={amountStr} />
          </div>
          <p className="mt-5 leading-relaxed">
            I, <b>{data.driverName}</b>, hereby acknowledge the receipt of <b>{amountStr}</b>{" "}
            ({inWords(data.amount)}) from <b>{data.employerName}</b> as my salary for the
            month of <b>{monthYear}</b>.
          </p>
          <div className="mt-10 flex items-end justify-between">
            <div className="relative h-28 w-24">
              <img
                src={revenueStamp}
                alt="Revenue Stamp"
                crossOrigin="anonymous"
                className="absolute inset-0 h-full w-full object-contain"
              />
              {data.signatureDataUrl && (
                <img
                  src={data.signatureDataUrl}
                  alt="Signature"
                  className="absolute inset-0 h-full w-full mix-blend-multiply object-contain mx-[37px]"
                  style={{ transform: "rotate(-6deg) scale(1.15)" }}
                />
              )}
            </div>
            <div className="text-right font-bold">Driver Name: {data.driverName}</div>
          </div>
        </div>
      </div>
    );
  },
);
DriverPreview.displayName = "DriverPreview";

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex">
      <span className="w-56 font-bold">{k}</span>
      <span>: {v}</span>
    </div>
  );
}
