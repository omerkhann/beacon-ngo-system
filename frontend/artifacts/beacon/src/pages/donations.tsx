import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Campaign, Donation, DonationReceipt } from "@/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";

export default function Donations() {
  const { getCampaigns, addDonation, getDonationsByDonor } = useStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [donorId, setDonorId] = useState("");
  const [amount, setAmount] = useState("");
  const [receipt, setReceipt] = useState<DonationReceipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCampaigns = async () => {
    try {
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadCampaigns(); }, []);

  const handleDonate = async () => {
    setError("");
    setReceipt(null);
    if (!selectedCampaignId) { setError("Please select a campaign."); return; }
    if (!donorId || Number(donorId) <= 0) { setError("Donor ID is required."); return; }
    if (!amount || Number(amount) <= 0) { setError("Amount must be a positive number."); return; }

    setLoading(true);
    try {
      const result = await addDonation({
        campaignId: selectedCampaignId,
        donorId: Number(donorId),
        amount: Number(amount),
      });
      setReceipt(result);
      setAmount("");
      loadCampaigns();
    } catch (e: any) {
      setError(e.message || "Donation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async () => {
    if (!donorId || Number(donorId) <= 0) { setError("Enter a Donor ID first."); return; }
    try {
      const data = await getDonationsByDonor(Number(donorId));
      setDonations(data);
    } catch (e: any) {
      setError(e.message || "Failed to load history.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
        <p className="text-muted-foreground mt-2">Process donations and view donor history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Make a Donation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="space-y-2">
              <Label>Donor ID</Label>
              <Input type="number" placeholder="Enter donor ID" value={donorId}
                onChange={e => setDonorId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Donation Amount (PKR)</Label>
              <Input type="number" placeholder="0" value={amount}
                onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDonate} disabled={loading} className="flex-1">
                {loading ? "Processing..." : "Donate to Selected"}
              </Button>
              <Button variant="outline" onClick={loadCampaigns}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={handleViewHistory}>History</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Receipt</CardTitle></CardHeader>
          <CardContent>
            {receipt ? (
              <div className="font-mono text-sm space-y-1 bg-muted p-4 rounded">
                <div className="font-bold text-center mb-2">===== BEACON RECEIPT =====</div>
                <div>Receipt #: {receipt.receiptNumber}</div>
                <div>Donation ID: {receipt.donationId}</div>
                <div>Donor ID: {receipt.donorId}</div>
                <div>Campaign ID: {receipt.campaignId}</div>
                <div>Amount: PKR {receipt.amount.toLocaleString()}</div>
                <div>Date: {new Date(receipt.transactionDate).toLocaleString()}</div>
                <div className="font-bold text-center mt-2">==========================</div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Receipt will appear here after donation.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Select Campaign</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Goal</TableHead>
                <TableHead className="text-right">Raised</TableHead>
                <TableHead className="text-right">Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map(c => (
                <TableRow key={c.id}
                  className={`cursor-pointer ${selectedCampaignId === c.id ? "bg-primary/10" : ""}`}
                  onClick={() => setSelectedCampaignId(c.id)}>
                  <TableCell>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {c.id}</div>
                  </TableCell>
                  <TableCell>{c.status}</TableCell>
                  <TableCell className="text-right">{formatCurrency(c.goalAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(c.amountRaised)}</TableCell>
                  <TableCell className="text-right">{formatDate(c.deadline)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {donations.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Donation History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donation ID</TableHead>
                  <TableHead>Campaign ID</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead>Receipt No.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map(d => (
                  <TableRow key={d.id}>
                    <TableCell>{d.id}</TableCell>
                    <TableCell>{d.campaignId}</TableCell>
                    <TableCell className="text-right">{formatCurrency(d.amount)}</TableCell>
                    <TableCell className="text-right">{formatDate(d.transactionDate)}</TableCell>
                    <TableCell className="font-mono text-xs">{d.receiptNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}