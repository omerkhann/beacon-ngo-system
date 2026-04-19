import { Router, type IRouter } from "express";
import { eq, sql, count } from "drizzle-orm";
import { db, campaignsTable, donationsTable, expensesTable, volunteerApplicationsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/reports/impact", async (_req, res): Promise<void> => {
  const campaigns = await db.select().from(campaignsTable).orderBy(campaignsTable.createdAt);

  const results = await Promise.all(
    campaigns.map(async (campaign) => {
      const [donationSum] = await db
        .select({ total: sql<string>`COALESCE(SUM(${donationsTable.amount}), 0)` })
        .from(donationsTable)
        .where(eq(donationsTable.campaignId, campaign.id));

      const [expenseSum] = await db
        .select({ total: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)` })
        .from(expensesTable)
        .where(eq(expensesTable.campaignId, campaign.id));

      const totalRaised = parseFloat(donationSum?.total ?? "0");
      const totalExpenses = parseFloat(expenseSum?.total ?? "0");
      const netFunds = totalRaised - totalExpenses;
      const goal = parseFloat(campaign.goalAmount);
      const progressPercent = goal > 0 ? Math.min((totalRaised / goal) * 100, 100) : 0;

      return {
        campaignId: campaign.id,
        campaignName: campaign.name,
        goal,
        totalRaised,
        totalExpenses,
        netFunds,
        progressPercent: Math.round(progressPercent * 100) / 100,
        status: campaign.status,
        deadline: campaign.deadline,
      };
    })
  );

  res.json(results);
});

router.get("/reports/summary", async (_req, res): Promise<void> => {
  const [campaignCount] = await db
    .select({ total: sql<string>`COUNT(*)` })
    .from(campaignsTable);

  const [activeCampaignCount] = await db
    .select({ total: sql<string>`COUNT(*)` })
    .from(campaignsTable)
    .where(eq(campaignsTable.status, "ACTIVE"));

  const [donationStats] = await db
    .select({
      totalRaised: sql<string>`COALESCE(SUM(${donationsTable.amount}), 0)`,
      totalDonations: sql<string>`COUNT(*)`,
    })
    .from(donationsTable);

  const [expenseStats] = await db
    .select({
      totalExpenses: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)`,
    })
    .from(expensesTable);

  const [volunteerStats] = await db
    .select({
      totalVolunteers: sql<string>`COUNT(DISTINCT ${volunteerApplicationsTable.volunteerId})`,
    })
    .from(volunteerApplicationsTable);

  const [pendingStats] = await db
    .select({ pending: sql<string>`COUNT(*)` })
    .from(volunteerApplicationsTable)
    .where(eq(volunteerApplicationsTable.status, "PENDING"));

  res.json({
    totalCampaigns: parseInt(campaignCount?.total ?? "0"),
    activeCampaigns: parseInt(activeCampaignCount?.total ?? "0"),
    totalRaised: parseFloat(donationStats?.totalRaised ?? "0"),
    totalExpenses: parseFloat(expenseStats?.totalExpenses ?? "0"),
    totalDonations: parseInt(donationStats?.totalDonations ?? "0"),
    totalVolunteers: parseInt(volunteerStats?.totalVolunteers ?? "0"),
    pendingApplications: parseInt(pendingStats?.pending ?? "0"),
  });
});

export default router;
