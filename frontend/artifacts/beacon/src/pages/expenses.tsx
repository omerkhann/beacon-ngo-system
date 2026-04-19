import { useState, useEffect } from "react";
import { useStore } from "@/store";
import type { Campaign } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { ExpenseCategory } from "@/types";

const CATEGORIES: ExpenseCategory[] = ["Logistics", "Food", "Transport", "Medical", "Operations", "Other"];

export default function Expenses() {
  const { getActiveCampaigns, addExpense, getCampaignBalance } = useStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [form, setForm] = useState({
    campaignId: "",
    category: "" as ExpenseCategory | "",
    amount: "",
    description: "",
    adminId: "1",
  });
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getActiveCampaigns().then(setCampaigns).catch(console.error);
  }, []);

  useEffect(() => {
    if (!form.campaignId) { setBalance(null); return; }
    getCampaignBalance(Number(form.campaignId))
      .then(b => setBalance(b.remainingBalance))
      .catch(() => setBalance(null));
  }, [form.campaignId]);

  const handle = async () => {
    setError("");
    if (!form.campaignId) { setError("Please select a campaign."); return; }
    if (!form.category) { setError("Please select a category."); return; }
    if (!form.amount || Number(form.amount) <= 0) { setError("Amount must be a positive number."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.adminId || Number(form.adminId) <= 0) { setError("Admin ID is required."); return; }

    setLoading(true);
    try {
      await addExpense({
        campaignId: Number(form.campaignId),
        category: form.category as ExpenseCategory,
        amount: Number(form.amount),
        description: form.description.trim(),
        adminId: Number(form.adminId),
      });
      setSuccess(true);
      setForm(f => ({ ...f, amount: "", description: "" }));
      setTimeout(() => setSuccess(false), 3000);
      getCampaignBalance(Number(form.campaignId))
        .then(b => setBalance(b.remainingBalance))
        .catch(() => {});
    } catch (e: any) {
      setError(e.message || "Failed to log expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expense Log</h1>
        <p className="text-muted-foreground mt-2">Log expenses against active campaigns.</p>
      </div>

      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            Expense logged successfully!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader><CardTitle>Log an Expense</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Campaign</Label>
            <Select value={form.campaignId} onValueChange={v => setForm(f => ({ ...f, campaignId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select a campaign" /></SelectTrigger>
              <SelectContent>
                {campaigns.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.id} - {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {balance !== null && (
            <div className={`text-sm font-medium ${balance > 0 ? "text-green-600" : "text-red-600"}`}>
              Available Balance: PKR {balance.toLocaleString()}
            </div>
          )}

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as ExpenseCategory }))}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amount (PKR)</Label>
            <Input type="number" placeholder="0" value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Describe the expense" rows={3} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>

          <div className="space-y-2">
            <Label>Admin ID</Label>
            <Input type="number" placeholder="1" value={form.adminId}
              onChange={e => setForm(f => ({ ...f, adminId: e.target.value }))} />
          </div>

          <Button className="w-full" onClick={handle} disabled={loading}>
            {loading ? "Logging..." : "Log Expense"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}