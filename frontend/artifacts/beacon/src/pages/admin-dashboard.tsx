import { useState, useEffect } from "react";
import { useStore } from "@/store";
import type { Campaign, CampaignImpact, VolunteerApplication } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Users, Heart, Target, CheckCircle, Clock, AlertCircle, Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { getCampaigns, getImpactReport, getVolunteerApplications } = useStore();
  const [, setLocation] = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [impactData, setImpactData] = useState<CampaignImpact[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalRaised: 0,
    totalGap: 0,
    pendingVolunteers: 0,
    approvedVolunteers: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  const loadData = async () => {
    try {
      const [campaignsList, impact, volunteerApps] = await Promise.all([
        getCampaigns(),
        getImpactReport(),
        getVolunteerApplications(),
      ]);
      setCampaigns(campaignsList);
      setImpactData(impact);
      setVolunteers(volunteerApps);

      const totalRaised = campaignsList.reduce((sum, c) => sum + c.amountRaised, 0);
      const totalGoal = campaignsList.reduce((sum, c) => sum + c.goalAmount, 0);
      const pendingVolsCount = volunteerApps.filter((v) => v.status === "PENDING").length;
      const approvedVolsCount = volunteerApps.filter((v) => v.status === "APPROVED").length;

      setStats({
        totalCampaigns: campaignsList.length,
        activeCampaigns: campaignsList.filter((c) => c.status === "ACTIVE").length,
        totalRaised,
        totalGap: totalGoal - totalRaised,
        pendingVolunteers: pendingVolsCount,
        approvedVolunteers: approvedVolsCount,
      });
    } catch (error) {
      console.error("Failed to load admin dashboard:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {currentUser?.fullName || "Administrator"}</h1>
          <p className="text-muted-foreground mt-2">Full system overview, volunteer approvals, and reporting</p>
        </div>
        <Button onClick={() => setLocation("/impact-report")} variant="outline">
          Generate Report
        </Button>
      </div>

      {/* Admin Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCampaigns} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRaised)}</div>
            <p className="text-xs text-muted-foreground">system-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funding Gap</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalGap)}</div>
            <p className="text-xs text-muted-foreground">to reach goals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingVolunteers}</div>
            <p className="text-xs text-muted-foreground">volunteers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedVolunteers}</div>
            <p className="text-xs text-muted-foreground">approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setLocation("/admin-approvals")}
              size="sm"
              variant="outline"
              className="h-8 text-xs w-full"
            >
              Review
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pending Volunteer Approvals */}
      {stats.pendingVolunteers > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Pending Volunteer Approvals ({stats.pendingVolunteers})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {volunteers
                .filter((v) => v.status === "PENDING")
                .slice(0, 5)
                .map((app) => (
                  <div key={app.id} className="flex items-center justify-between p-2 bg-white rounded border">
                    <div>
                      <p className="text-sm font-semibold">Campaign #{app.campaignId}</p>
                      <p className="text-xs text-muted-foreground">Volunteer #{app.volunteerId}</p>
                    </div>
                    <Button
                      onClick={() => setLocation("/admin-approvals")}
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                    >
                      Review
                    </Button>
                  </div>
                ))}
            </div>
            <Button onClick={() => setLocation("/admin-approvals")} variant="link" className="mt-2 p-0 h-auto">
              View all approvals →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All Campaigns List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Campaigns (System-Wide)</CardTitle>
          <Button onClick={() => setLocation("/campaigns")} variant="outline" size="sm">
            Manage All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="space-y-4">
            {campaigns
              .filter((campaign) =>
                campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((campaign) => {
              const progress =
                campaign.goalAmount > 0
                  ? (campaign.amountRaised / campaign.goalAmount) * 100
                  : 0;
              return (
                <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{campaign.name}</h3>
                    <p className="text-sm text-muted-foreground">{campaign.description}</p>
                    <div className="mt-2 w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <Badge variant={campaign.status === "ACTIVE" ? "default" : "secondary"}>
                      {campaign.status}
                    </Badge>
                    <p className="text-sm font-semibold mt-2">
                      {formatCurrency(campaign.amountRaised)}/{formatCurrency(campaign.goalAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">{Math.round(progress)}% funded</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
