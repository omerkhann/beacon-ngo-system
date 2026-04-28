import { useState, useEffect } from "react";
import { useStore } from "@/store";
import type { Donation, DonationReceipt, User } from "@/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Printer } from "lucide-react";

export default function MyDonations() {
  const { getDonationsByDonor } = useStore();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<DonationReceipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to parse current user", err);
      }
    }
  }, []);

  useEffect(() => {
    const loadDonations = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const data = await getDonationsByDonor(currentUser.id);
        setDonations(data);
      } catch (error) {
        console.error("Failed to load donations:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDonations();
  }, [currentUser]);

  const handlePrintReceipt = () => {
    if (!selectedReceipt) return;
    
    const printContent = `
      <html>
        <head>
          <title>BEACON Donation Receipt</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 40px; max-width: 600px; margin: 0 auto; }
            .receipt { border: 2px solid #333; padding: 20px; }
            .header { text-align: center; font-weight: bold; font-size: 16px; margin-bottom: 20px; }
            .line { display: flex; justify-content: space-between; margin: 10px 0; }
            .divider { border-top: 2px solid #333; margin: 15px 0; }
            .footer { text-align: center; font-size: 12px; margin-top: 20px; color: #666; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">===== BEACON DONATION RECEIPT =====</div>
            <div class="line"><span>Receipt #:</span><span>${selectedReceipt.receiptNumber}</span></div>
            <div class="line"><span>Donation ID:</span><span>${selectedReceipt.donationId}</span></div>
            <div class="line"><span>Donor ID:</span><span>${selectedReceipt.donorId}</span></div>
            <div class="line"><span>Campaign ID:</span><span>${selectedReceipt.campaignId}</span></div>
            <div class="line"><span>Amount Donated:</span><span>PKR ${selectedReceipt.amount.toLocaleString()}</span></div>
            <div class="line"><span>Date:</span><span>${new Date(selectedReceipt.transactionDate).toLocaleDateString()}</span></div>
            <div class="divider"></div>
            <div class="footer">
              <p>Thank you for your generous donation!</p>
              <p>BEACON NGO - Making Impact Together</p>
            </div>
            <div class="header">=====================================</div>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open("", "", "height=600,width=600");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6 bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-lg">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Donations</h1>
        <p className="text-muted-foreground mt-2">View your donation history and receipts</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Donation History</CardTitle></CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : donations.length === 0 ? (
            <div className="p-6 text-muted-foreground">No donations found yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donation ID</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map((d) => (
                  <TableRow key={d.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedReceipt({
                    receiptNumber: d.receiptNumber,
                    donationId: d.id,
                    donorId: d.donorId,
                    campaignId: d.campaignId,
                    amount: d.amount,
                    transactionDate: d.transactionDate,
                  })}>
                    <TableCell className="font-mono text-xs">{d.id}</TableCell>
                    <TableCell>Campaign #{d.campaignId}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(d.amount)}</TableCell>
                    <TableCell className="text-right text-sm">{formatDate(d.transactionDate)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{d.receiptNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedReceipt && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Receipt Preview</CardTitle>
            <Button onClick={handlePrintReceipt} size="sm" variant="outline" className="flex gap-2">
              <Printer className="h-4 w-4" />
              Print Receipt
            </Button>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-xs space-y-2 bg-white dark:bg-slate-900 p-4 rounded border">
              <div className="font-bold text-center mb-3">===== BEACON DONATION RECEIPT =====</div>
              <div className="flex justify-between"><span>Receipt #:</span><span>{selectedReceipt.receiptNumber}</span></div>
              <div className="flex justify-between"><span>Donation ID:</span><span>{selectedReceipt.donationId}</span></div>
              <div className="flex justify-between"><span>Donor ID:</span><span>{selectedReceipt.donorId}</span></div>
              <div className="flex justify-between"><span>Campaign ID:</span><span>{selectedReceipt.campaignId}</span></div>
              <div className="flex justify-between font-semibold"><span>Amount:</span><span>PKR {selectedReceipt.amount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Date:</span><span>{new Date(selectedReceipt.transactionDate).toLocaleDateString()}</span></div>
              <div className="border-t pt-2 mt-2 text-center text-xs">Thank you for your support!</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
