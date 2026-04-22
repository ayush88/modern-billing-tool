import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FuelForm } from "@/components/fuel/FuelForm";
import { FuelPreview } from "@/components/fuel/FuelPreview";
import { FuelReceipt } from "@/lib/types";
import { exportElementToPdf } from "@/lib/pdf";

export const Route = createFileRoute("/fuel")({
  head: () => ({
    meta: [
      { title: "Fuel Receipt — Bill Generator" },
      { name: "description", content: "Generate a thermal-style fuel receipt with live preview." },
    ],
  }),
  component: FuelPage,
});

function nowLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function randReceipt() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function FuelPage() {
  const [data, setData] = useState<FuelReceipt>(() => ({
    stationName: "SHAHEED DESHRAJ FILL. ST.",
    addressLine1: "SECTOR-105 NOIDA",
    addressLine2: "G.B. NAGAR",
    gstNo: "09AEFFS6429C1ZY",
    telNo: "9015748720",
    receiptNo: randReceipt(),
    product: "Petrol",
    rate: 96.72,
    volume: 10.34,
    total: 1000,
    dateTime: nowLocal(),
    paymentMode: "Online",
    vehicleType: "",
    vehicleNo: "",
    customerName: "",
  }));

  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!previewRef.current) return;
    await exportElementToPdf(previewRef.current, {
      filename: `Fuel_Receipt_${data.receiptNo}.pdf`,
      format: "thermal",
    });
  };

  return (
    <DashboardLayout title="Fuel Receipt">
      <link href="https://fonts.googleapis.com/css2?family=VT323&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Receipt details</CardTitle>
          </CardHeader>
          <CardContent>
            <FuelForm value={data} onChange={setData} />
          </CardContent>
        </Card>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Live preview</CardTitle>
              <Button onClick={handleDownload} size="sm" className="rounded-xl">
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </CardHeader>
            <CardContent className="flex justify-center bg-[oklch(0.97_0.005_247)] py-8 rounded-b-2xl">
              <FuelPreview ref={previewRef} data={data} />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
