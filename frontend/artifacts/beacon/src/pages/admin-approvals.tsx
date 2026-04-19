import { useState, useEffect } from "react";
import { useStore } from "@/store";
import type { VolunteerApplication } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export default function AdminApprovals() {
  const { getApplications, approveApplication, rejectApplication } = useStore();
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [selected, setSelected] = useState<VolunteerApplication | null>(null);
  const [adminId, setAdminId] = useState("1");
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async (status: string) => {
    try {
      const data = await getApplications(status);
      setApplications(data);
      setSelected(null);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { load(statusFilter); }, [statusFilter]);

  const handleApprove = async () => {
    if (!selected) { setError("Select an application first."); return; }
    if (!adminId || Number(adminId) <= 0) { setError("Admin ID is required."); return; }
    setError("");
    setLoading(true);
    try {
      await approveApplication(selected.id, Number(adminId));
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
    if (!adminId || Number(adminId) <= 0) { setError("Admin ID is required."); return; }
    if (!rejectionReason.trim()) { setError("Rejection reason is required."); return; }
    setError("");
    setLoading(true);
    try {
      await rejectApplication(selected.id, Number(adminId), rejectionReason.trim());
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
    <div className="space-y-6">
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
                <TableHead>Campaign</TableHead>
                <TableHead>Volunteer ID</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Bio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rejection Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length > 0 ? applications.map(a => (
                <TableRow key={a.id}
                  className={`cursor-pointer ${selected?.id === a.id ? "bg-primary/10" : ""}`}
                  onClick={() => { setSelected(a); setError(""); }}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{a.campaignId}</TableCell>
                  <TableCell>{a.volunteerId}</TableCell>
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
              <Label>Admin Reviewer ID</Label>
              <Input type="number" value={adminId}
                onChange={e => setAdminId(e.target.value)} />
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