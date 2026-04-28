import { useState, useEffect } from "react";
import { useStore } from "@/store";
import type { VolunteerApplication, Campaign, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function AdminApprovals() {
  const { getApplications, getCampaigns, approveApplication, rejectApplication } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [selected, setSelected] = useState<VolunteerApplication | null>(null);
  const [userId, setUserId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const load = async (status: string) => {
    try {
      const data = await getApplications(status);
      
      // Filter applications based on user role
      if (user?.role === "CAMPAIGN_MANAGER") {
        // Get campaigns managed by this user
        const userCampaigns = campaigns.filter(c => c.managerId === user.id);
        const userCampaignIds = userCampaigns.map(c => c.id);
        // Only show applications for campaigns they manage
        setApplications(data.filter(app => userCampaignIds.includes(app.campaignId)));
      } else {
        // Admins see all applications
        setApplications(data);
      }
      
      setSelected(null);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    // Load user from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setUserId(String(parsedUser.id));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    // Load campaigns for filtering
    getCampaigns("ALL").then(setCampaigns).catch(console.error);
  }, []);

  useEffect(() => { load(statusFilter); }, [statusFilter, campaigns]);

  const handleApprove = async () => {
    if (!selected) { setError("Select an application first."); return; }
    if (!userId || Number(userId) <= 0) { setError("User ID is required."); return; }
    setError("");
    setLoading(true);
    try {
      await approveApplication(selected.id, Number(userId));
      setSuccess("Application approved successfully.");
      setTimeout(() => setSuccess(""), 3000);
      load(statusFilter);
    } catch (e: any) {
      setError(e.message || "Approval failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected) { setError("Select an application first."); return; }
    if (!userId || Number(userId) <= 0) { setError("User ID is required."); return; }
    if (!rejectionReason.trim()) { setError("Rejection reason is required."); return; }
    setError("");
    setLoading(true);
    try {
      await rejectApplication(selected.id, Number(userId), rejectionReason.trim());
      setSuccess("Application rejected.");
      setRejectionReason("");
      setTimeout(() => setSuccess(""), 3000);
      load(statusFilter);
    } catch (e: any) {
      setError(e.message || "Rejection failed.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "REJECTED": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  return (
    <div className="space-y-6 bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-lg">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Approvals</h1>
        <p className="text-muted-foreground mt-2">Review and act on volunteer applications.</p>
      </div>

      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by volunteer or campaign name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => load(statusFilter)}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>App ID</TableHead>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Volunteer Name</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rejection Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length > 0 ? applications
                .filter((a) =>
                  a.volunteerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  a.campaignName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(a => (
                <TableRow key={a.id}
                  className={`cursor-pointer ${selected?.id === a.id ? "bg-primary/10" : ""}`}
                  onClick={() => { setSelected(a); setError(""); }}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell className="font-medium">{a.campaignName}</TableCell>
                  <TableCell className="font-medium">{a.volunteerName}</TableCell>
                  <TableCell>{a.skill}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-xs">{a.bio}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 font-semibold ${getStatusColor(a.status)}`}>
                      {a.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.rejectionReason || "-"}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No applications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selected ? `Action — Application #${selected.id}` : "Select an application above to take action"}
          </CardTitle>
        </CardHeader>
        {selected && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{user?.role === "ADMIN" ? "Admin Reviewer ID" : "Manager ID"}</Label>
              <Input type="number" value={userId} disabled />
              <p className="text-sm text-muted-foreground">
                {user?.role === "ADMIN" ? "Your admin ID" : "Your manager ID"}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Rejection Reason <span className="text-muted-foreground">(required if rejecting)</span></Label>
              <Input placeholder="Enter reason for rejection" value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={handleApprove} disabled={loading}>
                ✓ Approve Selected
              </Button>
              <Button className="flex-1" variant="destructive"
                onClick={handleReject} disabled={loading}>
                ✗ Reject Selected
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}