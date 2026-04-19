import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Campaign, CampaignStatus } from "@/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type StatusFilter = "ALL" | CampaignStatus;

export default function Campaigns() {
  const { getCampaigns } = useStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(false);

  const load = async (status: StatusFilter) => {
    setLoading(true);
    try {
      const data = await getCampaigns(status);
      setCampaigns(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(statusFilter); }, [statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "COMPLETED": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "CANCELLED": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaign Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Overview of all fundraising operations and their progress.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as StatusFilter)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Campaigns</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => load(statusFilter)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b rounded-t-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Raised / Goal</TableHead>
                  <TableHead className="text-right">Deadline</TableHead>
                  <TableHead className="text-right">Created By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.length > 0 ? (
                  campaigns.map((campaign) => {
                    const percent = campaign.goalAmount > 0
                      ? Math.min(100, (campaign.amountRaised / campaign.goalAmount) * 100)
                      : 0;
                    return (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-xs text-muted-foreground">ID: {campaign.id}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`font-semibold border-0 ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-[200px]">
                          <div className="flex items-center gap-2">
                            <Progress value={percent} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground w-9 text-right">{percent.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium text-primary">{formatCurrency(campaign.amountRaised)}</div>
                          <div className="text-xs text-muted-foreground">of {formatCurrency(campaign.goalAmount)}</div>
                        </TableCell>
                        <TableCell className="text-right">{formatDate(campaign.deadline)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">Admin {campaign.adminUserId}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      {loading ? "Loading..." : "No campaigns found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}