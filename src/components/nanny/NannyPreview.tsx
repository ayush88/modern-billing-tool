import { forwardRef } from "react";
import { NannySalary } from "@/lib/types";
import revenueStamp from "@/assets/revenue-stamp.webp";

function fmtDate(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

export const NannyPreview = forwardRef<HTMLDivElement, { data: NannySalary }>(
  ({ data }, ref) => {
    const dateStr = fmtDate(data.paymentDate);
    const amountStr = `₹ ${data.amount.toLocaleString("en-IN")}/-`;

    return (
      <div
        ref={ref}
        className="mx-auto w-full max-w-[640px] bg-white p-10 text-black font-sans"
        style={{ fontSize: "14px", aspectRatio: "1/1.414" }}
      >
        <div className="border-2 border-black p-6">
          {/* Section 1 */}
          <div className="text-center text-lg font-bold">Salary Receipt</div>
          <div className="mt-6 space-y-3">
            <div><b>Date:</b> {dateStr}</div>
            <div><b>Salary for the Month:</b> {data.salaryMonth}</div>
            <div><b>Amount Paid: {amountStr}</b></div>
          </div>
          <p className="mt-4 leading-relaxed">
            Please note that this salary slip is based on the salary disbursement for the month of{" "}
            <b>{data.salaryMonth}</b>. It reflects the total amount of <b>{amountStr}</b> paid to the
            nanny <b>{data.recipientName}</b> and provides a breakdown of earnings and deductions, if applicable.
          </p>
          <div className="mt-8 text-right">
            <div><b>Employee Name:</b> {data.employeeName}</div>
            <div className="mt-1"><b>Employee Code:</b> {data.employeeCode}</div>
          </div>

          <div className="my-6 border-t border-dashed border-black" />

          {/* Section 2 */}
          <div className="text-center text-lg font-bold">Receipt Acknowledgment</div>
          <div className="mt-6 space-y-3">
            <div><b>Date:</b> {dateStr}</div>
            <div><b>Salary of the Month:</b> {data.salaryMonth}</div>
            <div><b>Amount Paid: {amountStr}</b></div>
          </div>
          <p className="mt-4 leading-relaxed">
            Received a sum of <b>{amountStr}</b> only for the <b>{data.salaryMonth}</b> month from{" "}
            Mrs. <b>{data.employeeName}</b> to nanny, <b>{data.recipientName}</b> towards salary.
          </p>
          <div className="mt-6 text-right">
            <div><b>Recipients Name:</b> {data.recipientName}</div>
          </div>

          <div className="mt-8">
            <div className="mb-1">Revenue Stamp</div>
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
          </div>
        </div>
      </div>
    );
  },
);
NannyPreview.displayName = "NannyPreview";
