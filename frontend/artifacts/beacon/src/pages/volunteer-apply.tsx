import { useState, useEffect } from "react";
import { useStore } from "@/store";
import type { Campaign, VolunteerApplication } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, RefreshCw } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { VolunteerSkill } from "@/types";

const SKILLS: VolunteerSkill[] = ["Teaching", "Medical", "Logistics", "IT", "Outreach", "Design"];

export default function VolunteerApply() {
  const { getActiveCampaigns, addApplication, getApplicationsByVolunteer } = useStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [myApplications, setMyApplications] = useState<VolunteerApplication[]>([]);
  const [form, setForm] = useState({
    volunteerId: "",
    campaignId: "",
    skill: "" as VolunteerSkill | "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getActiveCampaigns().then(setCampaigns).catch(console.error);
  }, []);

  const loadMyApplications = async () => {
    if (!form.volunteerId || Number(form.volunteerId) <= 0) return;
    try {
      const data = await getApplicationsByVolunteer(Number(form.volunteerId));
      setMyApplications(data);
    } catch (e) { console.error(e); }
  };

  const handle = async () => {
    setError("");
    if (!form.volunteerId || Number(form.volunteerId) <= 0) { setError("Volunteer ID is required."); return; }
    if (!form.campaignId) { setError("Please select a campaign."); return; }
    if (!form.skill) { setError("Please select a skill."); return; }
    if (!form.bio.trim()) { setError("Bio / Statement of Interest cannot be empty."); return; }

    setLoading(true);
    try {
      await addApplication({
        volunteerId: Number(form.volunteerId),
        campaignId: Number(form.campaignId),
        skill: form.skill as VolunteerSkill,
        bio: form.bio.trim(),
      });
      setSuccess(true);
      setForm(f => ({ ...f, campaignId: "", skill: "", bio: "" }));
      setTimeout(() => setSuccess(false), 3000);
      loadMyApplications();
    } catch (e: any) {
      setError(e.message || "Application failed.");
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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Volunteer Apply</h1>
        <p className="text-muted-foreground mt-2">Apply to contribute your skills to an active campaign.</p>
      </div>

      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            Application submitted successfully!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader><CardTitle>Application Form</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Volunteer User ID</Label>
            <Input type="number" placeholder="Enter your user ID" value={form.volunteerId}
              onChange={e => setForm(f => ({ ...f, volunteerId: e.target.value }))}
              onBlur={loadMyApplications} />
          </div>

          <div className="space-y-2">
            <Label>Campaign</Label>
            <Select value={form.campaignId} onValueChange={v => setForm(f => ({ ...f, campaignId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select an active campaign" /></SelectTrigger>
              <SelectContent>
                {campaigns.map(c => (
                  <SelectItem key={c.id} value={String(c.id)}>{c.id} - {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Primary Skill</Label>
            <Select value={form.skill} onValueChange={v => setForm(f => ({ ...f, skill: v as VolunteerSkill }))}>
              <SelectTrigger><SelectValue placeholder="Select your skill" /></SelectTrigger>
              <SelectContent>
                {SKILLS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Bio / Statement of Interest</Label>
            <Textarea placeholder="Tell us about yourself and why you want to volunteer..." rows={5}
              value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
            <p className="text-xs text-muted-foreground text-right">{form.bio.length} / 500</p>
          </div>

          <Button className="w-full" onClick={handle} disabled={loading}>
            {loading ? "Submitting..." : "Apply to Campaign"}
          </Button>
        </CardContent>
      </Card>

      {myApplications.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Applications</CardTitle>
            <Button variant="outline" size="icon" onClick={loadMyApplications}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Skill</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myApplications.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{a.id}</TableCell>
                    <TableCell>{a.campaignId}</TableCell>
                    <TableCell>{a.skill}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border-0 font-semibold ${getStatusColor(a.status)}`}>
                        {a.status}
                      </Badge>
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