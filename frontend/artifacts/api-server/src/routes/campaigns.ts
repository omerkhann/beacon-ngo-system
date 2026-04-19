import { Router, type IRouter } from "express";
import { eq, sql, and } from "drizzle-orm";
import { db, campaignsTable, donationsTable, expensesTable } from "@workspace/db";
import {
  CreateCampaignBody,
  ListCampaignsQueryParams,
  GetCampaignParams,
  GetCampaignBalanceParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/campaigns", async (req, res): Promise<void> => {
  const parsed = ListCampaignsQueryParams.safeParse(req.query);
  const statusFilter = parsed.success ? parsed.data.status : undefined;

  const campaigns = await db
    .select({
      id: campaignsTable.id,
      name: campaignsTable.name,
      description: campaignsTable.description,
      goalAmount: campaignsTable.goalAmount,
      status: campaignsTable.status,
      deadline: campaignsTable.deadline,
      adminUserId: campaignsTable.adminUserId,
      createdAt: campaignsTable.createdAt,
      amountRaised: sql<string>`COALESCE(SUM(${donationsTable.amount}), 0)`,
    })
    .from(campaignsTable)
    .leftJoin(donationsTable, eq(campaignsTable.id, donationsTable.campaignId))
    .groupBy(campaignsTable.id)
    .orderBy(campaignsTable.createdAt);

  const filtered =
    !statusFilter || statusFilter === "ALL"
      ? campaigns
      : campaigns.filter((c) => c.status === statusFilter);

  res.json(
    filtered.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      goalAmount: parseFloat(c.goalAmount),
      amountRaised: parseFloat(c.amountRaised),
      status: c.status,
      deadline: c.deadline,
      adminUserId: c.adminUserId,
      createdAt: c.createdAt,
    }))
  );
});

router.get("/campaigns/active", async (_req, res): Promise<void> => {
  const campaigns = await db
    .select({
      id: campaignsTable.id,
      name: campaignsTable.name,
      description: campaignsTable.description,
      goalAmount: campaignsTable.goalAmount,
      status: campaignsTable.status,
      deadline: campaignsTable.deadline,
      adminUserId: campaignsTable.adminUserId,
      createdAt: campaignsTable.createdAt,
      amountRaised: sql<string>`COALESCE(SUM(${donationsTable.amount}), 0)`,
    })
    .from(campaignsTable)
    .leftJoin(donationsTable, eq(campaignsTable.id, donationsTable.campaignId))
    .where(eq(campaignsTable.status, "ACTIVE"))
    .groupBy(campaignsTable.id)
    .orderBy(campaignsTable.createdAt);

  res.json(
    campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      goalAmount: parseFloat(c.goalAmount),
      amountRaised: parseFloat(c.amountRaised),
      status: c.status,
      deadline: c.deadline,
      adminUserId: c.adminUserId,
      createdAt: c.createdAt,
    }))
  );
});

router.post("/campaigns", async (req, res): Promise<void> => {
  const parsed = CreateCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.message });
    return;
  }

  const { name, description, goalAmount, deadline, adminUserId } = parsed.data;

  if ((goalAmount as unknown as number) <= 0) {
    res.status(400).json({ error: "Goal amount must be a positive number" });
    return;
  }

  const [campaign] = await db
    .insert(campaignsTable)
    .values({
      name,
      description,
      goalAmount: String(goalAmount),
      deadline: deadline instanceof Date ? deadline.toISOString().split("T")[0] : String(deadline),
      adminUserId,
    })
    .returning();

  res.status(201).json({
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    goalAmount: parseFloat(campaign.goalAmount),
    amountRaised: 0,
    status: campaign.status,
    deadline: campaign.deadline,
    adminUserId: campaign.adminUserId,
    createdAt: campaign.createdAt,
  });
});

router.get("/campaigns/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid campaign ID" });
    return;
  }

  const [campaign] = await db
    .select({
      id: campaignsTable.id,
      name: campaignsTable.name,
      description: campaignsTable.description,
      goalAmount: campaignsTable.goalAmount,
      status: campaignsTable.status,
      deadline: campaignsTable.deadline,
      adminUserId: campaignsTable.adminUserId,
      createdAt: campaignsTable.createdAt,
      amountRaised: sql<string>`COALESCE(SUM(${donationsTable.amount}), 0)`,
    })
    .from(campaignsTable)
    .leftJoin(donationsTable, eq(campaignsTable.id, donationsTable.campaignId))
    .where(eq(campaignsTable.id, id))
    .groupBy(campaignsTable.id);

  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  res.json({
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    goalAmount: parseFloat(campaign.goalAmount),
    amountRaised: parseFloat(campaign.amountRaised),
    status: campaign.status,
    deadline: campaign.deadline,
    adminUserId: campaign.adminUserId,
    createdAt: campaign.createdAt,
  });
});

router.get("/campaigns/:id/balance", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid campaign ID" });
    return;
  }

  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, id));

  if (!campaign) {
    res.status(404).json({ error: "Campaign not found" });
    return;
  }

  const [donationSum] = await db
    .select({ total: sql<string>`COALESCE(SUM(${donationsTable.amount}), 0)` })
    .from(donationsTable)
    .where(eq(donationsTable.campaignId, id));

  const [expenseSum] = await db
    .select({ total: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)` })
    .from(expensesTable)
    .where(eq(expensesTable.campaignId, id));

  const totalRaised = parseFloat(donationSum?.total ?? "0");
  const totalExpenses = parseFloat(expenseSum?.total ?? "0");
  const remainingBalance = totalRaised - totalExpenses;

  res.json({
    campaignId: campaign.id,
    campaignName: campaign.name,
    totalRaised,
    totalExpenses,
    remainingBalance,
  });
});

export default router;
