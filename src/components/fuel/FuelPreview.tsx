import { forwardRef } from "react";
import { FuelReceipt } from "@/lib/types";

function fmtDateTime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const FuelPreview = forwardRef<HTMLDivElement, { data: FuelReceipt }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="relative mx-auto w-[320px] bg-white p-4 text-black"
        style={{ fontFamily: "'VT323', 'Share Tech Mono', monospace", fontSize: "16px", lineHeight: 1.25 }}
      >
        {/* HDFC vertical watermarks */}
        <div className="pointer-events-none absolute right-1 top-4 flex flex-col gap-10 text-[10px] tracking-widest opacity-30" style={{ writingMode: "vertical-rl" }}>
          <span>HDFC BANK</span>
          <span>HDFC BANK</span>
          <span>HDFC BANK</span>
        </div>
        <div className="absolute right-1 bottom-2 text-[9px] opacity-40">A127016</div>

        <div className="text-center">
          <div className="text-[18px] font-bold">WELCOME!!!</div>
          <div className="font-bold">{data.stationName}</div>
          <div>{data.addressLine1}</div>
          <div>{data.addressLine2}</div>
          <div>Tel: {data.telNo}</div>
          <div>GST: {data.gstNo}</div>
        </div>
        <div className="my-2 border-t border-dashed border-black" />
        <Row k="Receipt" v={data.receiptNo} />
        <Row k="Date" v={fmtDateTime(data.dateTime)} />
        <Row k="Pump No" v="03" />
        <Row k="Nozzle" v="02" />
        <Row k="Product" v={data.product} />
        <Row k="Rate" v={`${data.rate.toFixed(2)} /L`} />
        <Row k="Volume" v={`${data.volume.toFixed(2)} L`} />
        <div className="my-2 border-t border-dashed border-black" />
        <Row k="AMOUNT" v={`Rs. ${data.total.toFixed(2)}`} bold />
        <Row k="Mode" v={data.paymentMode} />
        {data.vehicleNo && <Row k="Vehicle" v={data.vehicleNo} />}
        {data.vehicleType && <Row k="Veh.Type" v={data.vehicleType} />}
        {data.customerName && <Row k="Customer" v={data.customerName} />}
        <div className="my-2 text-center">*****************</div>
        <div className="text-center">Thank You! Visit Again</div>
        <div className="text-center">Save Fuel, Save Money.</div>
      </div>
    );
  },
);
FuelPreview.displayName = "FuelPreview";

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold" : ""}`}>
      <span>{k}</span>
      <span>{v}</span>
    </div>
  );
}
