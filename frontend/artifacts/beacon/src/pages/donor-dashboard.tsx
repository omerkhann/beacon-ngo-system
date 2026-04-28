import { useState, useEffect } from "react";
import { useStore } from "@/store";
import type { Campaign, Donation, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, TrendingUp, Target } from "lucide-react";
import { useLocation } from "wouter";
import { formatCurrency } from "@/lib/utils";

export default function DonorDashboard() {
  const { getCampaigns, getDonationsByDonor } = useStore();
  const [, setLocation] = useLocation();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalDonated: 0,
    donationCount: 0,
    activeCampaigns: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to parse current user", err);
      }
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      try {
        const [campaignsList, donationsList] = await Promise.all([
          getCampaigns(),
          getDonationsByDonor(currentUser.id),
        ]);
        setCampaigns(campaignsList.filter((c) => c.status === "ACTIVE"));
        setDonations(donationsList);

        const totalDonated = donationsList.reduce((sum, d) => sum + d.amount, 0);

        setStats({
          totalDonated,
          donationCount: donationsList.length,
          activeCampaigns: campaignsList.filter((c) => c.status === "ACTIVE").length,
        });
      } catch (error) {
        console.error("Failed to load donor dashboard:", error);
      }
    };

    loadData();
  }, [currentUser]);

  return (
    <div className="space-y-6 bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-lg">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {currentUser?.fullName || 'Donor'}</h1>
        <p className="text-muted-foreground mt-2">Your donations and active campaigns</p>
      </div>

      {/* Donor Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalDonated)}</div>
            <p className="text-xs text-muted-foreground">{stats.donationCount} donations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">available to donate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impact</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.donationCount}</div>
            <p className="text-xs text-muted-foreground">lives touched</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <p className="text-muted-foreground">No donations yet. Support a campaign!</p>
          ) : (
            <div className="space-y-3">
              {donations.slice(0, 5).map((donation) => (
                <div key={donation.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-semibold">Campaign #{donation.campaignId}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(donation.transactionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">{formatCurrency(donation.amount)}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Campaigns */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Campaigns Accepting Donations</CardTitle>
          <Button onClick={() => setLocation("/donations")} variant="outline" size="sm">
            Donate Now
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.slice(0, 3).map((campaign) => {
              const progress =
                campaign.goalAmount > 0
                  ? (campaign.amountRaised / campaign.goalAmount) * 100
                  : 0;
              return (
                <div key={campaign.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{campaign.name}</h3>
                    <Badge>{Math.round(progress)}% funded</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatCurrency(campaign.amountRaised)}</span>
                    <span>{formatCurrency(campaign.goalAmount)}</span>
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
