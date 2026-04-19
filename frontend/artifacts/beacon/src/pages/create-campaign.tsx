import { useState } from "react";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

export default function CreateCampaign() {
  const { addCampaign } = useStore();
  const [form, setForm] = useState({
    name: "",
    description: "",
    goalAmount: "",
    deadline: "",
    adminUserId: "1",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    setError("");
    if (!form.name.trim()) { setError("Campaign name is required."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.goalAmount || Number(form.goalAmount) <= 0) { setError("Goal amount must be a positive number."); return; }
    if (!form.deadline) { setError("Deadline is required."); return; }
    if (!form.adminUserId || Number(form.adminUserId) <= 0) { setError("Admin User ID is required."); return; }

    setLoading(true);
    try {
      await addCampaign({
        name: form.name.trim(),
        description: form.description.trim(),
        goalAmount: Number(form.goalAmount),
        deadline: form.deadline,
        adminUserId: Number(form.adminUserId),
      });
      setSuccess(true);
      setForm({ name: "", description: "", goalAmount: "", deadline: "", adminUserId: "1" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || "Failed to create campaign.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Campaign</h1>
        <p className="text-muted-foreground mt-2">Set up a new fundraising campaign.</p>
      </div>

      {success && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            Campaign created successfully!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Campaign Name</Label>
            <Input placeholder="Enter campaign name" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea placeholder="Enter campaign description" rows={4} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Goal Amount (PKR)</Label>
              <Input type="number" placeholder="0" value={form.goalAmount}
                onChange={e => setForm(f => ({ ...f, goalAmount: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input type="date" value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Admin User ID</Label>
            <Input type="number" placeholder="1" value={form.adminUserId}
              onChange={e => setForm(f => ({ ...f, adminUserId: e.target.value }))} />
          </div>
          <Button className="w-full" onClick={handle} disabled={loading}>
            {loading ? "Creating..." : "Create Campaign"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}