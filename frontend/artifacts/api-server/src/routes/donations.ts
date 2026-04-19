import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, donationsTable, campaignsTable } from "@workspace/db";
import { CreateDonationBody } from "@workspace/api-zod";
import { randomUUID } from "crypto";

const router: IRouter = Router();

router.post("/donations", async (req, res): Promise<void> => {
  const parsed = CreateDonationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.message });
    return;
  }

  const { donorId, campaignId, amount } = parsed.data;

  if ((amount as unknown as number) <= 0) {
    res.status(400).json({ error: "Donation amount must be a positive number" });
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

  if (campaign.status !== "ACTIVE") {
    res.status(400).json({ error: "Donations can only be made to active campaigns" });
    return;
  }

  const receiptNumber = `RCP-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;

  const [donation] = await db
    .insert(donationsTable)
    .values({
      donorId,
      campaignId,
      amount: String(amount),
      receiptNumber,
    })
    .returning();

  res.status(201).json({
    receiptNumber: donation.receiptNumber,
    donationId: donation.id,
    donorId: donation.donorId,
    campaignId: donation.campaignId,
    amount: parseFloat(donation.amount),
    transactionDate: donation.transactionDate,
  });
});

router.get("/donations/donor/:donorId", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.donorId) ? req.params.donorId[0] : req.params.donorId;
  const donorId = parseInt(raw, 10);
  if (isNaN(donorId)) {
    res.status(400).json({ error: "Invalid donor ID" });
    return;
  }

  const donations = await db
    .select()
    .from(donationsTable)
    .where(eq(donationsTable.donorId, donorId))
    .orderBy(donationsTable.transactionDate);

  res.json(
    donations.map((d) => ({
      id: d.id,
      donorId: d.donorId,
      campaignId: d.campaignId,
      amount: parseFloat(d.amount),
      transactionDate: d.transactionDate,
      receiptNumber: d.receiptNumber,
    }))
  );
});

export default router;
