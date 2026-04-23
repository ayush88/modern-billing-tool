import { forwardRef } from "react";
import { FuelReceipt } from "@/lib/types";
import hdfcStrip from "@/assets/hdfc-side.webp";

function fmtDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const FuelPreview = forwardRef<HTMLDivElement, { data: FuelReceipt }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="relative mx-auto bg-white text-black"
        style={{
          width: "6.81cm",
          padding: "55px 10px 55px 10px",
          fontFamily: '"Press Start 2P", "VT323", monospace',
          fontSize: "8.5px",
          fontWeight: "400",
          lineHeight: 1.2,
          letterSpacing: "-.7px",
          backgroundColor: "#f5f7f7",
        }}
      >
        {/* HDFC vertical strips on the right edge — rotated logo image */}
        < div
          className="pointer-events-none absolute"
          style={{ right: "-2px", top: "26px", width: "22px", height: "260px" }}
        >
          <img
            src={hdfcStrip}
            alt=""
            crossOrigin="anonymous"
            style={{
              position: "absolute",
              top: "38%",
              left: "50%",
              height: "22px",
              width: "260px",
              transform: "translate(-50%, -50%) rotate(270deg)",
              transformOrigin: "center",
              objectFit: "contain",
              opacity: "0.35",
              maxWidth: "fit-content",
            }}
          />
        </div >
        <div
          className="pointer-events-none absolute"
          style={{ right: "-2px", top: "513px", width: "22px", height: "260px" }}
        >
          <img
            src={hdfcStrip}
            alt=""
            crossOrigin="anonymous"
            style={{
              position: "absolute",
              top: "-60%",
              left: "50%",
              height: "22px",
              width: "260px",
              transform: "translate(-50%, -50%) rotate(270deg)",
              transformOrigin: "center",
              objectFit: "contain",
              opacity: "0.35",
              maxWidth: "fit-content",
            }}
          />
        </div>

        {/* Header */}
        <div className="text-center">
          <div>WELCOME!!!</div>
          <div>{data.stationName}</div>
          <div>{data.addressLine1}</div>
          <div>{data.addressLine2}</div>
        </div>

        <div style={{ height: "16px" }} />

        {/* Block 1 */}
        <div>
          <Line k="GST NO" v={data.gstNo} />
          <Line k="TEL NO" v={data.telNo} />
          <Line k="RECEIPT NO" v={data.receiptNo} />
          <Line k="FCC ID" v="" />
          <Line k="FIP NO" v="" />
          <Line k="NOZZLE NO" v="" />
        </div>

        <div style={{ height: "35px" }} />

        {/* Block 2 — product/amount */}
        <div>
          <Line k="PRODUCT" v="" />
          <Line k="RATE/LTR" v={`₹ ${data.rate.toFixed(2)}`} />
          <Line k="AMOUNT" v={`₹ ${data.total.toFixed(2)}`} />
          <Line k="VOLUME(LTR)" v={`${data.volume.toFixed(2)} lt`} />
        </div>

        <div style={{ height: "35px" }} />

        {/* Block 3 — vehicle */}
        <div>
          <Line k="VEH TYPE" v={data.vehicleType || data.product} />
          <Line k="VEH NO" v={data.vehicleNo} />
          <Line k="CUSTOMER NAME" v={data.customerName} />
        </div>

        <div style={{ height: "35px" }} />

        {/* Block 4 — meta */}
        <div>
          <Line k="DATE" v={fmtDate(data.dateTime)} />
          <Line k="MODE" v={data.paymentMode} />
          <Line k="LST NO" v="" />
          <Line k="VAT NO" v="" />
          <Line k="ATTENDENT ID" v="not available" />
        </div>

        <div style={{ height: "55px" }} />

        <div className="text-center">
          <div>*****************</div>
          <div>Thank You! Visit Again</div>
          <div>Save Fuel, Save Money.</div>
        </div>
      </div >
    );
  },
);
FuelPreview.displayName = "FuelPreview";

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div>
      {k}:{v ? ` ${v}` : ""}
    </div>
  );
}
