import { useState, useEffect } from "react";
import { useStore } from "@/store";
import type { CampaignImpact, Campaign, User } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Search } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function ImpactReport() {
  const { getImpactReport, getCampaigns } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [rows, setRows] = useState<CampaignImpact[]>([]);
  const [selected, setSelected] = useState<CampaignImpact | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getImpactReport();
      
      // Filter impact data based on user role
      if (user?.role === "CAMPAIGN_MANAGER") {
        // Get campaigns managed by this user
        const userCampaignIds = campaigns
          .filter(c => c.managerId === user.id)
          .map(c => c.id);
        // Only show impact data for campaigns they manage
        setRows(data.filter(row => userCampaignIds.includes(row.campaignId)));
      } else {
        // Admins see all impact data
        setRows(data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    // Load user from localStorage
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
    // Load campaigns for filtering
    getCampaigns("ALL").then(setCampaigns).catch(console.error);
  }, []);

  useEffect(() => { load(); }, [campaigns]);

  const totalRaised = rows.reduce((s, r) => s + r.totalRaised, 0);
  const totalExpenses = rows.reduce((s, r) => s + r.totalExpenses, 0);
  const netFunds = rows.reduce((s, r) => s + r.netFunds, 0);
  const avgProgress = rows.length > 0
    ? rows.reduce((s, r) => s + r.progressPercent, 0) / rows.length
    : 0;

  const getProgressColor = (p: number) =>
    p >= 75 ? "text-green-600" : p >= 40 ? "text-orange-500" : "text-red-600";

  return (
    <div className="space-y-6 bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Impact Report</h1>
          <p className="text-muted-foreground mt-2">Financial summary across all campaigns.</p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(totalRaised)}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Raised</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Expenses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className={`text-2xl font-bold ${netFunds >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(netFunds)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Net Funds</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{avgProgress.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground mt-1">Avg Progress</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead className="text-right">Goal</TableHead>
                <TableHead className="text-right">Raised</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Net Funds</TableHead>
                <TableHead className="w-[180px]">Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length > 0 ? rows
                .filter((r) => r.campaignName.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(r => (
                <TableRow key={r.campaignId}
                  className={`cursor-pointer ${selected?.campaignId === r.campaignId ? "bg-primary/10" : ""}`}
                  onClick={() => setSelected(r)}>
                  <TableCell>
                    <div className="font-medium">{r.campaignName}</div>
                    <div className="text-xs text-muted-foreground">ID: {r.campaignId}</div>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(r.goal)}</TableCell>
                  <TableCell className="text-right text-green-600">{formatCurrency(r.totalRaised)}</TableCell>
                  <TableCell className="text-right text-red-600">{formatCurrency(r.totalExpenses)}</TableCell>
                  <TableCell className={`text-right font-medium ${r.netFunds >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {formatCurrency(r.netFunds)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={r.progressPercent} className="h-2 flex-1" />
                      <span className={`text-xs w-9 text-right font-medium ${getProgressColor(r.progressPercent)}`}>
                        {r.progressPercent}%
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    {loading ? "Loading..." : "No report data available."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>{selected.campaignName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(selected.totalRaised)}</div>
                <div className="text-sm text-muted-foreground">Total Raised</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{formatCurrency(selected.totalExpenses)}</div>
                <div className="text-sm text-muted-foreground">Total Expenses</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${selected.netFunds >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {formatCurrency(selected.netFunds)}
                </div>
                <div className="text-sm text-muted-foreground">Net Funds</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress toward goal</span>
                <span className="font-medium">{selected.progressPercent}%</span>
              </div>
              <Progress value={selected.progressPercent} className="h-4" />
              <p className="text-xs text-muted-foreground text-center">
                {formatCurrency(selected.totalRaised)} raised of {formatCurrency(selected.goal)} goal —{" "}
                {selected.progressPercent}% of target achieved
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}