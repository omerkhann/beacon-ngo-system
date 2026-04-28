import { useState, useEffect } from "react";
import { useStore } from "@/store";
import type { Campaign, User, Expense } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { ExpenseCategory } from "@/types";

const CATEGORIES: ExpenseCategory[] = ["Logistics", "Food", "Transport", "Medical", "Operations", "Other"];

export default function Expenses() {
  const { getCampaigns, addExpense, getCampaignBalance, getCampaignExpenses } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({
    campaignId: "",
    category: "" as ExpenseCategory | "",
    amount: "",
    description: "",
    userId: "",
  });
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const loadCampaigns = async () => {
    try {
      const allCampaigns = await getCampaigns("ACTIVE");
      if (user?.role === "CAMPAIGN_MANAGER") {
        setCampaigns(allCampaigns.filter(c => c.managerId === user.id));
      } else {
        setCampaigns(allCampaigns);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setForm(f => ({ ...f, userId: String(parsedUser.id) }));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    loadCampaigns();
  }, [user]);

  useEffect(() => {
    if (!form.campaignId) { 
      setBalance(null); 
      setExpenses([]);
      return; 
    }
    getCampaignBalance(Number(form.campaignId))
      .then(b => setBalance(b.remainingBalance))
      .catch(() => setBalance(null));
    
    getCampaignExpenses(Number(form.campaignId))
      .then(e => setExpenses(e))
      .catch(() => setExpenses([]));
  }, [form.campaignId]);

  const handle = async () => {
    setError("");
    if (!form.campaignId) { setError("Please select a campaign."); return; }
    if (!form.category) { setError("Please select a category."); return; }
    if (!form.amount || Number(form.amount) <= 0) { setError("Amount must be a positive number."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.userId || Number(form.userId) <= 0) { setError("User ID is required."); return; }

    setLoading(true);
    try {
      await addExpense({
        campaignId: Number(form.campaignId),
        category: form.category as ExpenseCategory,
        amount: Number(form.amount),
        description: form.description.trim(),
        adminId: Number(form.userId),
      });
      setSuccess(true);
      setForm(f => ({ ...f, amount: "", description: "", userId: String(user?.id || "") }));
      setTimeout(() => setSuccess(false), 3000);
      getCampaignBalance(Number(form.campaignId))
        .then(b => setBalance(b.remainingBalance))
        .catch(() => {});
      getCampaignExpenses(Number(form.campaignId))
        .then(e => setExpenses(e))
        .catch(() => {});
    } catch (e: any) {
      setError(e.message || "Failed to log expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-lg">
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

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr] items-start">
        <Card className="h-fit min-h-[22rem] max-h-[30rem]">
          <CardHeader><CardTitle>Log an Expense</CardTitle></CardHeader>
          <CardContent className="space-y-4 overflow-y-auto max-h-[calc(30rem-5rem)]">
            <div className="space-y-2">
              <Label>Campaign</Label>
              <Select value={form.campaignId} onValueChange={v => setForm(f => ({ ...f, campaignId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a campaign" /></SelectTrigger>
                <SelectContent>
                  {campaigns.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as ExpenseCategory }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount (PKR)</Label>
                <Input type="number" placeholder="0" value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{user?.role === "ADMIN" ? "Admin ID" : "Manager ID"}</Label>
                <Input 
                  type="number" 
                  value={form.userId}
                  disabled 
                />
                <p className="text-sm text-muted-foreground">
                  {user?.role === "ADMIN" ? "Your admin ID" : "Your manager ID"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the expense" rows={3} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            {user && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Expenses are being logged by <strong>{user.fullName}</strong> ({user.role})
                </AlertDescription>
              </Alert>
            )}

            <Button className="w-full" onClick={handle} disabled={loading}>
              {loading ? "Logging..." : "Log Expense"}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="h-fit min-h-[22rem] max-h-[30rem]">
            <CardHeader><CardTitle>Campaign Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4 overflow-y-auto max-h-[calc(30rem-5rem)]">
              {form.campaignId ? (

                <>
                  <div className={`rounded-lg p-4 ${balance !== null ? "bg-white dark:bg-slate-900" : "bg-muted"}`}>
                    <div className="text-sm font-medium text-muted-foreground">Remaining Balance</div>
                    <div className={`text-2xl font-bold ${balance !== null ? (balance > 0 ? "text-green-600" : "text-red-600") : "text-muted-foreground"}`}>
                      {balance !== null ? `PKR ${balance.toLocaleString()}` : "No campaign selected"}
                    </div>
                  </div>
                  {expenses.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">Recent Expenses</div>
                      <div className="space-y-3 max-h-[10rem] overflow-y-auto pr-1">
                        {expenses.slice(0, 5).map((exp, idx) => (
                          <div key={idx} className="rounded-lg border bg-white dark:bg-slate-900 p-3">
                            <div className="flex justify-between text-sm font-medium">
                              <span>{exp.category}</span>
                              <span>PKR {exp.amount.toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{exp.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No expenses recorded for the selected campaign yet.</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Select a campaign to see remaining balance and expense history.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {form.campaignId && expenses.length > 0 && (
        <Card>
          <CardHeader><CardTitle>All Campaign Expenses</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((exp, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{exp.category}</TableCell>
                    <TableCell className="text-right">{exp.amount.toLocaleString()} PKR</TableCell>
                    <TableCell>{exp.description}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {exp.createdAt ? new Date(exp.createdAt).toLocaleDateString() : "N/A"}
                    </TableCell>
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