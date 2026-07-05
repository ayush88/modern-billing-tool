import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NannyForm } from "@/components/nanny/NannyForm";
import { NannyPreview } from "@/components/nanny/NannyPreview";
import { NannySalary } from "@/lib/types";
import { exportElementToA4Pdf } from "@/lib/pdf";

export const Route = createFileRoute("/nanny")({
  head: () => ({
    meta: [
      { title: "Nanny Salary — Bill Generator" },
      { name: "description", content: "Generate a professional nanny salary receipt with acknowledgment." },
    ],
  }),
  component: NannyPage,
});

function NannyPage() {
  const [data, setData] = useState<NannySalary>(() => ({
    paymentDate: "2026-01-31",
    salaryMonth: "January",
    amount: 16000,
    employeeName: "Pooja Manchanda",
    employeeCode: "56986",
    recipientName: "Prava Bage",
  }));

  const previewRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    try {
      const node = previewRef.current;
      if (!node) throw new Error("Preview not ready");
      await exportElementToA4Pdf(node, {
        filename: `Nanny_Salary_${data.salaryMonth}_${data.paymentDate.slice(0, 4)}.pdf`,
        xCm: 1,
        yCm: 1,
        widthCm: 19,
        heightCm: 27.7,
      });
    } catch (error) {
      console.error(error);
      alert("Failed to save or download nanny bill.");
    }
  };

  return (
    <DashboardLayout title="Nanny Salary">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Salary details</CardTitle>
          </CardHeader>
          <CardContent>
            <NannyForm value={data} onChange={setData} />
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
                <NannyPreview ref={previewRef} data={data} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
