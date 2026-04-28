import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Campaign, CampaignStatus, User } from "@/types";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type StatusFilter = "ALL" | CampaignStatus;

export default function Campaigns() {
  const { getCampaigns, updateCampaignStatus } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ campaignId: number; campaign: Campaign; action: CampaignStatus } | null>(null);

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

  useEffect(() => { load(statusFilter); }, [statusFilter]);

  const handleStatusChange = async (campaignId: number, newStatus: CampaignStatus) => {
    setActionLoading(campaignId);
    setError("");
    try {
      await updateCampaignStatus(campaignId, newStatus);
      setConfirmAction(null);
      load(statusFilter);
    } catch (e: any) {
      setError(e.message || "Failed to update campaign status.");
    } finally {
      setActionLoading(null);
    }
  };

  const isBeforeDeadline = (deadline: string) => {
    return new Date(deadline) > new Date();
  };

  const handleActionClick = (campaign: Campaign, action: CampaignStatus) => {
    setConfirmAction({ campaignId: campaign.id, campaign, action });
  };

  const canChangeStatus = (campaign: Campaign) => {
    // Admins can always change status
    if (user?.role === "ADMIN") return true;
    // Campaign managers can change status for campaigns they manage
    if (user?.role === "CAMPAIGN_MANAGER" && campaign.managerId === user.id) return true;
    return false;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "COMPLETED": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "CANCELLED": return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-lg">
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-[250px]"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => load(statusFilter)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                  <TableHead className="text-right">Manager</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.length > 0 ? (
                  campaigns
                    .filter((campaign) =>
                      campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((campaign) => {
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
                        <TableCell className="text-right text-muted-foreground">Manager {campaign.managerId || "-"}</TableCell>
                        <TableCell className="text-right">
                          {campaign.status === "ACTIVE" && canChangeStatus(campaign) && (
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => handleActionClick(campaign, "COMPLETED")}
                                disabled={actionLoading === campaign.id}
                              >
                                {actionLoading === campaign.id ? "..." : "✓ Complete"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs text-red-600 hover:text-red-700"
                                onClick={() => handleActionClick(campaign, "CANCELLED")}
                                disabled={actionLoading === campaign.id}
                              >
                                {actionLoading === campaign.id ? "..." : "✗ Cancel"}
                              </Button>
                            </div>
                          )}
                          {campaign.status !== "ACTIVE" && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      {loading ? "Loading..." : "No campaigns found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.action === "COMPLETED" ? "Complete Campaign?" : "Cancel Campaign?"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.action === "COMPLETED"
                ? "Mark this campaign as completed."
                : "Mark this campaign as cancelled."}
            </DialogDescription>
          </DialogHeader>

          {confirmAction?.action === "COMPLETED" && isBeforeDeadline(confirmAction.campaign.deadline) && (
            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-200">
                <strong>Early completion:</strong> This campaign's deadline is {formatDate(confirmAction.campaign.deadline)}.
                Are you sure you want to complete it early?
              </AlertDescription>
            </Alert>
          )}

          {confirmAction?.action === "CANCELLED" && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700 dark:text-red-200">
                This action is permanent. All associated tasks and volunteers will remain in the system but will be marked as
                cancelled.
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-sm space-y-1">
            <div>
              <strong>Campaign:</strong> {confirmAction?.campaign.name}
            </div>
            <div>
              <strong>Status:</strong> ACTIVE → {confirmAction?.action}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              className={confirmAction?.action === "CANCELLED" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
              onClick={() => {
                if (confirmAction) {
                  handleStatusChange(confirmAction.campaignId, confirmAction.action);
                }
              }}
              disabled={actionLoading !== null}
            >
              {actionLoading ? "Processing..." : confirmAction?.action === "COMPLETED" ? "✓ Complete" : "✗ Cancel Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}