import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DriverForm } from "@/components/driver/DriverForm";
import { DriverPreview } from "@/components/driver/DriverPreview";
import { DriverSalary } from "@/lib/types";
import { exportElementToA4Pdf } from "@/lib/pdf";

export const Route = createFileRoute("/driver")({
  head: () => ({
    meta: [
      { title: "Driver Salary — Bill Generator" },
      { name: "description", content: "Generate a professional driver salary slip with acknowledgment." },
    ],
  }),
  component: DriverPage,
});

function todayISO() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function DriverPage() {
  const now = new Date();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const [data, setData] = useState<DriverSalary>(() => ({
    employerName: "Ayush Agrawal",
    driverName: "Siyasharan Jha",
    vehicleNo: "UP16EE7180",
    salaryMonth: months[now.getMonth()],
    salaryYear: String(now.getFullYear()),
    paymentDate: todayISO(),
    amount: 20000,
  }));

  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    try {
      const node = previewRef.current;
      if (!node) throw new Error("Preview not ready");
      // Driver slip uses the full A4 with 1cm margins on all sides (A4 = 21 × 29.7cm)
      await exportElementToA4Pdf(node, {
        filename: `Driver_Salary_${data.salaryMonth}_${data.salaryYear}.pdf`,
        xCm: 1,
        yCm: 1,
        widthCm: 19,
        heightCm: 27.7,
      });
    } catch (error) {
      console.error(error);
      alert("Failed to save or download driver bill.");
    }
  };

  return (
    <DashboardLayout title="Driver Salary">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Salary details</CardTitle>
          </CardHeader>
          <CardContent>
            <DriverForm value={data} onChange={setData} />
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
            <CardContent className="bg-[oklch(0.97_0.005_247)] py-8 rounded-b-2xl">
              <div className="origin-top scale-[0.85] sm:scale-100">
                <DriverPreview ref={previewRef} data={data} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
