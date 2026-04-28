import { useState, useEffect } from "react";
import { useStore } from "@/store";
import type { Campaign, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";  import { Input } from "@/components/ui/input";import { PlusCircle, Target, TrendingUp, Calendar, AlertCircle, Search } from "lucide-react";
import { useLocation } from "wouter";
import { formatCurrency } from "@/lib/utils";

export default function CampaignManagerDashboard() {
  const { getCampaigns } = useStore();
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    myCampaigns: 0,
    activeCampaigns: 0,
    totalRaised: 0,
    averageFunded: 0,
  });

  useEffect(() => {
    // Get current user
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Failed to parse user");
      }
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const allCampaigns = await getCampaigns();
        // Filter to only campaigns managed by this user
        const myCampaigns = allCampaigns.filter((c) => c.managerId === user.id);
        setCampaigns(myCampaigns);

        const totalRaised = myCampaigns.reduce((sum, c) => sum + c.amountRaised, 0);
        const activeCampaigns = myCampaigns.filter((c) => c.status === "ACTIVE");
        const avgFunded =
          myCampaigns.length > 0
            ? myCampaigns.reduce(
                (sum, c) => sum + (c.goalAmount > 0 ? (c.amountRaised / c.goalAmount) * 100 : 0),
                0
              ) / myCampaigns.length
            : 0;

        setStats({
          myCampaigns: myCampaigns.length,
          activeCampaigns: activeCampaigns.length,
          totalRaised,
          averageFunded: Math.round(avgFunded),
        });
      } catch (error) {
        console.error("Failed to load campaign manager dashboard:", error);
      }
    };

    loadData();
  }, [user]);

  return (
    <div className="space-y-6 bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-lg">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.fullName || 'Manager'}</h1>
        <p className="text-muted-foreground mt-2">Manage and monitor campaigns assigned to you</p>
      </div>

      {/* Manager Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Campaigns</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeCampaigns} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRaised)}</div>
            <p className="text-xs text-muted-foreground">across campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Funded</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageFunded}%</div>
            <p className="text-xs text-muted-foreground">of goal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Action</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setLocation("/create-campaign")}
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
            >
              Create New
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex flex-row items-center justify-between">
            <CardTitle>Your Campaigns</CardTitle>
            <Button onClick={() => setLocation("/campaigns")} variant="outline" size="sm">
              View All
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
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
                <div key={campaign.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
                    </div>
                    <Badge variant={campaign.status === "ACTIVE" ? "default" : "secondary"}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-muted rounded-full h-2 mb-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold">
                        {formatCurrency(campaign.amountRaised)}/{formatCurrency(campaign.goalAmount)}
                      </span>
                      <span className="text-muted-foreground">{Math.round(progress)}% funded</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                      View Analytics
                    </Button>
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
