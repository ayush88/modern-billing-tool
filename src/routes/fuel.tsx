import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FuelForm, type DateMode } from "@/components/fuel/FuelForm";
import { FuelPreview } from "@/components/fuel/FuelPreview";
import { FuelReceipt } from "@/lib/types";
import { exportElementToA4Pdf } from "@/lib/pdf";

export const Route = createFileRoute("/fuel")({
  head: () => ({
    meta: [
      { title: "Fuel Receipt — Bill Generator" },
      { name: "description", content: "Generate a thermal-style fuel receipt with live preview." },
    ],
  }),
  component: FuelPage,
});

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function nowLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function randReceipt() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Generate N evenly-ish spaced datetimes within a month, 5–7 days apart,
// time between 8:30 and 18:30.
function generateMonthDates(monthIdx: number, year: number, count: number): string[] {
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const out: string[] = [];
  let day = 1 + Math.floor(Math.random() * 5); // start day 1–5
  for (let i = 0; i < count; i++) {
    if (day > daysInMonth) day = daysInMonth;
    const minutesSinceStart = Math.floor(Math.random() * (10 * 60 + 1)); // 0..600
    const totalMin = 8 * 60 + 30 + minutesSinceStart;
    const hh = Math.floor(totalMin / 60);
    const mm = totalMin % 60;
    out.push(toLocalInput(new Date(year, monthIdx, day, hh, mm)));
    const gap = 5 + Math.floor(Math.random() * 3); // 5,6,7
    day += gap;
  }
  return out;
}

function FuelPage() {
  const [data, setData] = useState<FuelReceipt>(() => ({
    stationName: "SHAHEED DESHRAJ FILL. ST.",
    addressLine1: "SECTOR-105 NOIDA",
    addressLine2: "G.B. NAGAR",
    gstNo: "09AEFFS6429C1ZY",
    telNo: "9015748720",
    receiptNo: "000000",
    product: "Petrol",
    rate: 101.1,
    volume: +(5000 / 101.1).toFixed(2),
    total: 5000,
    dateTime: nowLocal(),
    paymentMode: "Card",
    vehicleType: "",
    vehicleNo: "",
    customerName: "",
  }));

  const now = new Date();
  const [dateMode, setDateMode] = useState<DateMode>("single");
  const [monthValue, setMonthValue] = useState(MONTHS[now.getMonth()]);
  const [yearValue, setYearValue] = useState(String(now.getFullYear()));
  const [receiptCount, setReceiptCount] = useState(3);

  const previewRef = useRef<HTMLDivElement>(null);

  // Randomize receiptNo on client only to avoid SSR hydration mismatch
  useEffect(() => {
    setData((d) => ({ ...d, receiptNo: randReceipt() }));
  }, []);

  // Fuel slip placement on A4 — measured from reference 1.pdf
  const FUEL_PLACEMENT = { xCm: 7.11, yCm: 0.79, widthCm: 6.91, heightCm: 13.41 };

  const exportCurrent = async (receiptNo: string) => {
    const node = previewRef.current;
    if (!node) throw new Error("Preview not ready");
    await exportElementToA4Pdf(node, {
      filename: `Fuel_Receipt_${receiptNo}.pdf`,
      ...FUEL_PLACEMENT,
      backgroundColor: "#f5f7f7",
    });
  };

  const handleDownload = async () => {
    try {
      if (dateMode === "single") {
        await exportCurrent(data.receiptNo);
        return;
      }

      // Batch month mode — render each in turn, capture, download
      const monthIdx = MONTHS.indexOf(monthValue);
      const year = parseInt(yearValue, 10) || now.getFullYear();
      const dates = generateMonthDates(monthIdx, year, receiptCount);

      const original = data;
      for (let i = 0; i < dates.length; i++) {
        const newData = {
          ...original,
          dateTime: dates[i],
          receiptNo: randReceipt(),
        };
        setData(newData);
        // wait two animation frames for React + layout to commit
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
        await exportCurrent(newData.receiptNo);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save or download fuel bill.");
    }
  };

  return (
    <DashboardLayout title="Fuel Receipt">
      <link href="https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet"></link>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Receipt details</CardTitle>
          </CardHeader>
          <CardContent>
            <FuelForm
              value={data}
              onChange={setData}
              dateMode={dateMode}
              onDateModeChange={setDateMode}
              monthValue={monthValue}
              yearValue={yearValue}
              receiptCount={receiptCount}
              onMonthChange={setMonthValue}
              onYearChange={setYearValue}
              onReceiptCountChange={setReceiptCount}
            />
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Live preview</CardTitle>
              <Button onClick={handleDownload} size="sm" className="rounded-xl">
                <Download className="mr-2 h-4 w-4" />
                {dateMode === "month" ? `Download ${receiptCount} PDFs` : "Download PDF"}
              </Button>
            </CardHeader>
            <CardContent className="flex justify-center bg-muted py-8 rounded-b-2xl">
              <FuelPreview ref={previewRef} data={data} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
