import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2, Download } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listFuelBills,
  deleteFuelBill,
  downloadFuelPdf,
  listDriverBills,
  deleteDriverBill,
  downloadDriverPdf,
  FuelBillRecord,
  DriverBillRecord,
} from "@/lib/api";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [{ title: "History — Bill Generator" }],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [fuelBills, setFuelBills] = useState<FuelBillRecord[]>([]);
  const [driverBills, setDriverBills] = useState<DriverBillRecord[]>([]);

  const loadData = async () => {
    try {
      const [f, d] = await Promise.all([listFuelBills(), listDriverBills()]);
      setFuelBills(f);
      setDriverBills(d);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFuelDelete = async (id: number) => {
    if (!confirm("Delete this fuel receipt?")) return;
    await deleteFuelBill(id);
    await loadData();
  };

  const handleDriverDelete = async (id: number) => {
    if (!confirm("Delete this driver salary slip?")) return;
    await deleteDriverBill(id);
    await loadData();
  };

  return (
    <DashboardLayout title="History">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Saved Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fuel" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="fuel">Fuel Receipts</TabsTrigger>
              <TabsTrigger value="driver">Driver Salaries</TabsTrigger>
            </TabsList>
            
            <TabsContent value="fuel">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Receipt No</TableHead>
                      <TableHead>Station</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fuelBills.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No fuel receipts found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      fuelBills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell>{bill.dateTime.replace("T", " ")}</TableCell>
                          <TableCell>{bill.receiptNo}</TableCell>
                          <TableCell>{bill.stationName}</TableCell>
                          <TableCell>₹{bill.total}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadFuelPdf(bill.id, bill.receiptNo)}
                            >
                              <Download className="h-4 w-4 mr-1" /> PDF
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleFuelDelete(bill.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="driver">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {driverBills.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No driver salaries found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      driverBills.map((bill) => (
                        <TableRow key={bill.id}>
                          <TableCell>{bill.salaryMonth} {bill.salaryYear}</TableCell>
                          <TableCell>{bill.driverName}</TableCell>
                          <TableCell>{bill.vehicleNo}</TableCell>
                          <TableCell>₹{bill.amount}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadDriverPdf(bill.id, bill.salaryMonth, bill.salaryYear)}
                            >
                              <Download className="h-4 w-4 mr-1" /> PDF
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDriverDelete(bill.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
