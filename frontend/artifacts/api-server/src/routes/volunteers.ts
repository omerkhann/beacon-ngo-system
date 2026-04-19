import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, volunteerApplicationsTable, campaignsTable } from "@workspace/db";
import {
  ApplyVolunteerBody,
  ApproveApplicationBody,
  RejectApplicationBody,
  ListAllApplicationsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/volunteers/apply", async (req, res): Promise<void> => {
  const parsed = ApplyVolunteerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.message });
    return;
  }

  const { volunteerId, campaignId, skill, bio } = parsed.data;

  if (!bio || !bio.trim()) {
    res.status(400).json({ error: "Bio / Statement of Interest cannot be empty" });
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
    res.status(400).json({ error: "Applications can only be submitted for active campaigns" });
    return;
  }

  const [existingApp] = await db
    .select()
    .from(volunteerApplicationsTable)
    .where(
      and(
        eq(volunteerApplicationsTable.volunteerId, volunteerId),
        eq(volunteerApplicationsTable.campaignId, campaignId)
      )
    );

  if (existingApp) {
    res.status(409).json({ error: "You have already applied to this campaign" });
    return;
  }

  const [application] = await db
    .insert(volunteerApplicationsTable)
    .values({ volunteerId, campaignId, skill, bio })
    .returning();

  res.status(201).json({
    id: application.id,
    volunteerId: application.volunteerId,
    campaignId: application.campaignId,
    campaignName: campaign.name,
    skill: application.skill,
    bio: application.bio,
    status: application.status,
    rejectionReason: application.rejectionReason ?? null,
    reviewedBy: application.reviewedBy ?? null,
    appliedAt: application.appliedAt,
  });
});

router.get("/volunteers/:volunteerId/applications", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.volunteerId)
    ? req.params.volunteerId[0]
    : req.params.volunteerId;
  const volunteerId = parseInt(raw, 10);
  if (isNaN(volunteerId)) {
    res.status(400).json({ error: "Invalid volunteer ID" });
    return;
  }

  const applications = await db
    .select({
      id: volunteerApplicationsTable.id,
      volunteerId: volunteerApplicationsTable.volunteerId,
      campaignId: volunteerApplicationsTable.campaignId,
      campaignName: campaignsTable.name,
      skill: volunteerApplicationsTable.skill,
      bio: volunteerApplicationsTable.bio,
      status: volunteerApplicationsTable.status,
      rejectionReason: volunteerApplicationsTable.rejectionReason,
      reviewedBy: volunteerApplicationsTable.reviewedBy,
      appliedAt: volunteerApplicationsTable.appliedAt,
    })
    .from(volunteerApplicationsTable)
    .leftJoin(campaignsTable, eq(volunteerApplicationsTable.campaignId, campaignsTable.id))
    .where(eq(volunteerApplicationsTable.volunteerId, volunteerId))
    .orderBy(volunteerApplicationsTable.appliedAt);

  res.json(
    applications.map((a) => ({
      id: a.id,
      volunteerId: a.volunteerId,
      campaignId: a.campaignId,
      campaignName: a.campaignName ?? "Unknown Campaign",
      skill: a.skill,
      bio: a.bio,
      status: a.status,
      rejectionReason: a.rejectionReason ?? null,
      reviewedBy: a.reviewedBy ?? null,
      appliedAt: a.appliedAt,
    }))
  );
});

router.get("/volunteers/applications", async (req, res): Promise<void> => {
  const parsed = ListAllApplicationsQueryParams.safeParse(req.query);
  const statusFilter = parsed.success ? parsed.data.status : undefined;

  const applications = await db
    .select({
      id: volunteerApplicationsTable.id,
      volunteerId: volunteerApplicationsTable.volunteerId,
      campaignId: volunteerApplicationsTable.campaignId,
      campaignName: campaignsTable.name,
      skill: volunteerApplicationsTable.skill,
      bio: volunteerApplicationsTable.bio,
      status: volunteerApplicationsTable.status,
      rejectionReason: volunteerApplicationsTable.rejectionReason,
      reviewedBy: volunteerApplicationsTable.reviewedBy,
      appliedAt: volunteerApplicationsTable.appliedAt,
    })
    .from(volunteerApplicationsTable)
    .leftJoin(campaignsTable, eq(volunteerApplicationsTable.campaignId, campaignsTable.id))
    .orderBy(volunteerApplicationsTable.appliedAt);

  const filtered =
    !statusFilter || statusFilter === "ALL"
      ? applications
      : applications.filter((a) => a.status === statusFilter);

  res.json(
    filtered.map((a) => ({
      id: a.id,
      volunteerId: a.volunteerId,
      campaignId: a.campaignId,
      campaignName: a.campaignName ?? "Unknown Campaign",
      skill: a.skill,
      bio: a.bio,
      status: a.status,
      rejectionReason: a.rejectionReason ?? null,
      reviewedBy: a.reviewedBy ?? null,
      appliedAt: a.appliedAt,
    }))
  );
});

router.post("/volunteers/applications/:id/approve", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid application ID" });
    return;
  }

  const parsed = ApproveApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(volunteerApplicationsTable)
    .where(eq(volunteerApplicationsTable.id, id));

  if (!existing) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  if (existing.status !== "PENDING") {
    res.status(400).json({ error: `Cannot approve application with status: ${existing.status}. Only PENDING applications can be approved.` });
    return;
  }

  const [updated] = await db
    .update(volunteerApplicationsTable)
    .set({ status: "APPROVED", reviewedBy: parsed.data.adminId })
    .where(eq(volunteerApplicationsTable.id, id))
    .returning();

  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, updated.campaignId));

  res.json({
    id: updated.id,
    volunteerId: updated.volunteerId,
    campaignId: updated.campaignId,
    campaignName: campaign?.name ?? "Unknown Campaign",
    skill: updated.skill,
    bio: updated.bio,
    status: updated.status,
    rejectionReason: updated.rejectionReason ?? null,
    reviewedBy: updated.reviewedBy ?? null,
    appliedAt: updated.appliedAt,
  });
});

router.post("/volunteers/applications/:id/reject", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid application ID" });
    return;
  }

  const parsed = RejectApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.message });
    return;
  }

  if (!parsed.data.rejectionReason || !parsed.data.rejectionReason.trim()) {
    res.status(400).json({ error: "Rejection reason is required when rejecting an application" });
    return;
  }

  const [existing] = await db
    .select()
    .from(volunteerApplicationsTable)
    .where(eq(volunteerApplicationsTable.id, id));

  if (!existing) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  if (existing.status !== "PENDING") {
    res.status(400).json({ error: `Cannot reject application with status: ${existing.status}. Only PENDING applications can be rejected.` });
    return;
  }

  const [updated] = await db
    .update(volunteerApplicationsTable)
    .set({
      status: "REJECTED",
      reviewedBy: parsed.data.adminId,
      rejectionReason: parsed.data.rejectionReason,
    })
    .where(eq(volunteerApplicationsTable.id, id))
    .returning();

  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, updated.campaignId));

  res.json({
    id: updated.id,
    volunteerId: updated.volunteerId,
    campaignId: updated.campaignId,
    campaignName: campaign?.name ?? "Unknown Campaign",
    skill: updated.skill,
    bio: updated.bio,
    status: updated.status,
    rejectionReason: updated.rejectionReason ?? null,
    reviewedBy: updated.reviewedBy ?? null,
    appliedAt: updated.appliedAt,
  });
});

export default router;
