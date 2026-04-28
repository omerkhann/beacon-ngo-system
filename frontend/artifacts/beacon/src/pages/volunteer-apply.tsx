import { useState, useEffect } from "react";
import { useStore } from "@/store";
import type { Campaign, VolunteerApplication } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { VolunteerSkill } from "@/types";

const SKILLS: VolunteerSkill[] = ["Teaching", "Medical", "Logistics", "IT", "Outreach", "Design"];

export default function VolunteerApply() {
  const { getActiveCampaigns, addApplication, getApplicationsByVolunteer } = useStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [myApplications, setMyApplications] = useState<VolunteerApplication[]>([]);
  const [volunteerId, setVolunteerId] = useState<number | null>(null);
  const [form, setForm] = useState({
    campaignId: "",
    skill: "" as VolunteerSkill | "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Load user from localStorage and get their applications
  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setVolunteerId(user.id);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    getActiveCampaigns().then(setCampaigns).catch(console.error);
  }, []);

  // Load user's applications whenever volunteerId changes
  useEffect(() => {
    if (!volunteerId) return;
    loadMyApplications();
  }, [volunteerId]);

  const loadMyApplications = async () => {
    if (!volunteerId) return;
    try {
      const data = await getApplicationsByVolunteer(volunteerId);
      setMyApplications(data);
    } catch (e) { console.error(e); }
  };

  // Check if user has already applied to the selected campaign
  const hasAlreadyApplied = () => {
    if (!form.campaignId) return false;
    return myApplications.some(app => app.campaignId === Number(form.campaignId));
  };

  const handle = async () => {
    setError("");
    if (!volunteerId || volunteerId <= 0) { setError("User ID not found. Please log in."); return; }
    if (!form.campaignId) { setError("Please select a campaign."); return; }
    if (!form.skill) { setError("Please select a skill."); return; }
    if (!form.bio.trim()) { setError("Bio / Statement of Interest cannot be empty."); return; }
    if (hasAlreadyApplied()) { setError("You have already applied to this campaign."); return; }

    setLoading(true);
    try {
      await addApplication({
        volunteerId: volunteerId,
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

  return (
    <div className="space-y-6 max-w-2xl bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-lg">
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
            <Label>Your Volunteer ID</Label>
            <Input type="text" disabled value={volunteerId || "Loading..."} className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
            <p className="text-xs text-muted-foreground">Your ID is automatically filled from your account</p>
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

          {hasAlreadyApplied() && (
            <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-200">
                You have already applied to this campaign.
              </AlertDescription>
            </Alert>
          )}

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

          <Button className="w-full" onClick={handle} disabled={loading || hasAlreadyApplied() || !volunteerId}>
            {loading ? "Submitting..." : hasAlreadyApplied() ? "Already Applied" : "Apply to Campaign"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}