import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { User } from "@/types";

export default function CreateCampaign() {
  const { addCampaign } = useStore();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    goalAmount: "",
    deadline: "",
    managerId: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Campaign managers auto-populate their own ID
        if (parsedUser.role === "CAMPAIGN_MANAGER") {
          setForm(f => ({ ...f, managerId: String(parsedUser.id) }));
        }
      } catch (e) {
        setError("Failed to load user data");
      }
    }
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (!user) { setError("User not authenticated"); return; }
    if (!form.name.trim()) { setError("Campaign name is required."); return; }
    if (!form.description.trim()) { setError("Description is required."); return; }
    if (!form.goalAmount || Number(form.goalAmount) <= 0) { setError("Goal amount must be a positive number."); return; }
    if (!form.deadline) { setError("Deadline is required."); return; }
    if (user.role === "ADMIN" && !form.managerId) { setError("Campaign manager is required."); return; }

    setLoading(true);
    try {
      await addCampaign({
        name: form.name.trim(),
        description: form.description.trim(),
        goalAmount: Number(form.goalAmount),
        deadline: form.deadline,
        adminUserId: user.id,
        managerId: form.managerId ? Number(form.managerId) : undefined,
      });
      setSuccess(true);
      const resetForm = { name: "", description: "", goalAmount: "", deadline: "", managerId: "" };
      if (user.role === "CAMPAIGN_MANAGER") {
        resetForm.managerId = String(user.id);
      }
      setForm(resetForm);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message || "Failed to create campaign.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-lg">
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

          {/* Campaign Manager Selection - Only for Admins */}
          {user && user.role === "ADMIN" && (
            <div className="space-y-2">
              <Label>Campaign Manager ID</Label>
              <Input 
                type="number" 
                placeholder="Enter campaign manager user ID (e.g., 3, 4, 5)" 
                value={form.managerId}
                onChange={e => setForm(f => ({ ...f, managerId: e.target.value }))} 
              />
              <p className="text-sm text-muted-foreground">Select an existing campaign manager to oversee this campaign.</p>
            </div>
          )}

          {/* Auto-populated for Campaign Managers */}
          {user && user.role === "CAMPAIGN_MANAGER" && (
            <div className="space-y-2">
              <Label>Your ID (Manager)</Label>
              <Input 
                type="number" 
                value={form.managerId}
                disabled 
              />
              <p className="text-sm text-muted-foreground">This campaign will be assigned to you.</p>
            </div>
          )}

          {user && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                This campaign will be created by <strong>{user.fullName}</strong> ({user.role})
              </AlertDescription>
            </Alert>
          )}

          <Button className="w-full" onClick={handleSubmit} disabled={loading || !user}>
            {loading ? "Creating..." : "Create Campaign"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}