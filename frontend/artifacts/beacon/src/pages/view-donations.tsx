import { useState, useEffect } from "react";
import { useStore } from "@/store";
import type { Campaign, User, Donation } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function ViewDonations() {
  const { getCampaigns, getCampaignDonations } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCampaigns = async () => {
    try {
      const allCampaigns = await getCampaigns("ACTIVE");
      const visibleCampaigns = user?.role === "CAMPAIGN_MANAGER"
        ? allCampaigns.filter(c => c.managerId === user.id)
        : allCampaigns;

      setCampaigns(visibleCampaigns);
      if (visibleCampaigns.length > 0 && !selectedCampaignId) {
        setSelectedCampaignId(String(visibleCampaigns[0].id));
      }
      setError("");
    } catch (e) {
      setError("Failed to load campaigns");
      console.error(e);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [user]);

  useEffect(() => {
    if (!selectedCampaignId) {
      setDonations([]);
      return;
    }
    setLoading(true);
    getCampaignDonations(Number(selectedCampaignId))
      .then(d => {
        setDonations(d);
        setError("");
      })
      .catch(() => {
        setDonations([]);
        setError("Failed to load donations");
      })
      .finally(() => setLoading(false));
  }, [selectedCampaignId]);

  const totalDonations = donations.length;
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6 bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-lg">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">View Donations</h1>
        <p className="text-muted-foreground mt-2">Track all donations for your campaigns.</p>
      </div>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <Card>
        <CardHeader><CardTitle>Select Campaign</CardTitle></CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
              <SelectTrigger id="campaign-select">
                <SelectValue placeholder="Select a campaign..." />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCampaignId && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="text-sm font-medium text-muted-foreground">Total Donations</div>
                <div className="text-2xl font-bold">{totalDonations}</div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                <div className="text-sm font-medium text-muted-foreground">Total Amount</div>
                <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCampaignId && donations.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Donations</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donation ID</TableHead>
                  <TableHead>Donor ID</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                  <TableHead>Receipt No.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.map(d => (
                  <TableRow key={d.id}>
                    <TableCell>{d.id}</TableCell>
                    <TableCell>{d.donorId}</TableCell>
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

      {selectedCampaignId && donations.length === 0 && !loading && (
        <Card>
          <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
            No donations for this campaign yet.
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
            Loading donations...
          </CardContent>
        </Card>
      )}
    </div>
  );
}
