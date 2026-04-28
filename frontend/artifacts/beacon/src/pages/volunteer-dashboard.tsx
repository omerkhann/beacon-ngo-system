import { useState, useEffect } from "react";
import { useStore } from "@/store";
import type { Campaign, VolunteerApplication, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, CheckCircle, Clock } from "lucide-react";
import { useLocation } from "wouter";

export default function VolunteerDashboard() {
  const { getApplicationsByVolunteer, getCampaigns } = useStore();
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [stats, setStats] = useState({
    applicationsCount: 0,
    approvedCount: 0,
    pendingCount: 0,
    hoursVolunteered: 0,
  });

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

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [campaignsList, appsList] = await Promise.all([
          getCampaigns(),
          getApplicationsByVolunteer(user.id),
        ]);
        setCampaigns(campaignsList);
        setApplications(appsList);

        const approved = appsList.filter((a) => a.status === "APPROVED").length;
        const pending = appsList.filter((a) => a.status === "PENDING").length;

        setStats({
          applicationsCount: appsList.length,
          approvedCount: approved,
          pendingCount: pending,
          hoursVolunteered: approved * 20, // Mock: 20 hours per approved application
        });
      } catch (error) {
        console.error("Failed to load volunteer dashboard:", error);
      }
    };

    loadData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "default";
      case "PENDING":
        return "secondary";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6 bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.fullName || "Volunteer"}</h1>
          <p className="text-muted-foreground mt-2">Track your volunteer work and opportunities</p>
        </div>
        <Button
          onClick={() => setLocation("/volunteer-apply")}
          className="flex items-center gap-2"
        >
          <Heart className="h-4 w-4" />
          Apply to Campaign
        </Button>
      </div>

      {/* Volunteer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.applicationsCount}</div>
            <p className="text-xs text-muted-foreground">total submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedCount}</div>
            <p className="text-xs text-muted-foreground">active volunteers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCount}</div>
            <p className="text-xs text-muted-foreground">awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hoursVolunteered}</div>
            <p className="text-xs text-muted-foreground">total volunteered</p>
          </CardContent>
        </Card>
      </div>

      {/* Opportunities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Campaign Opportunities</CardTitle>
          <Button onClick={() => setLocation("/volunteer-apply")} variant="outline" size="sm">
            View All & Apply
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaigns.filter((c) => c.status === "ACTIVE").slice(0, 4).map((campaign) => (
              <div key={campaign.id} className="p-3 border rounded-lg">
                <h4 className="font-semibold">{campaign.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    onClick={() => setLocation("/volunteer-apply")}
                    size="sm"
                    className="flex-1 h-8 text-xs"
                  >
                    Apply
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                    Learn More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
