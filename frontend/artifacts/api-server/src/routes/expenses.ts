import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, expensesTable, donationsTable, campaignsTable } from "@workspace/db";
import { CreateExpenseBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/expenses", async (req, res): Promise<void> => {
  const parsed = CreateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.message });
    return;
  }

  const { campaignId, category, amount, description, adminId } = parsed.data;

  if ((amount as unknown as number) <= 0) {
    res.status(400).json({ error: "Expense amount must be a positive number" });
    return;
  }

  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, campaignId));

  if (!campaign) {
    res.status(400).json({ error: "Campaign not found" });
    return;
  }

  const [donationSum] = await db
    .select({ total: sql<string>`COALESCE(SUM(${donationsTable.amount}), 0)` })
    .from(donationsTable)
    .where(eq(donationsTable.campaignId, campaignId));

  const [expenseSum] = await db
    .select({ total: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)` })
    .from(expensesTable)
    .where(eq(expensesTable.campaignId, campaignId));

  const totalRaised = parseFloat(donationSum?.total ?? "0");
  const totalExpenses = parseFloat(expenseSum?.total ?? "0");
  const remainingBalance = totalRaised - totalExpenses;

  if ((amount as unknown as number) > remainingBalance) {
    res.status(400).json({
      error: `Expense amount (PKR ${(amount as unknown as number).toFixed(2)}) exceeds remaining campaign balance (PKR ${remainingBalance.toFixed(2)})`,
    });
    return;
  }

  const [expense] = await db
    .insert(expensesTable)
    .values({
      campaignId,
      category,
      amount: String(amount),
      description,
      adminId,
    })
    .returning();

  res.status(201).json({
    id: expense.id,
    campaignId: expense.campaignId,
    category: expense.category,
    amount: parseFloat(expense.amount),
    description: expense.description,
    adminId: expense.adminId,
    createdAt: expense.createdAt,
  });
});

router.get("/expenses/campaign/:campaignId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.campaignId)
    ? req.params.campaignId[0]
    : req.params.campaignId;
  const campaignId = parseInt(raw, 10);
  if (isNaN(campaignId)) {
    res.status(400).json({ error: "Invalid campaign ID" });
    return;
  }

  const expenses = await db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.campaignId, campaignId))
    .orderBy(expensesTable.createdAt);

  res.json(
    expenses.map((e) => ({
      id: e.id,
      campaignId: e.campaignId,
      category: e.category,
      amount: parseFloat(e.amount),
      description: e.description,
      adminId: e.adminId,
      createdAt: e.createdAt,
    }))
  );
});

export default router;
