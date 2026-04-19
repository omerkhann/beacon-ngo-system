import { pgTable, serial, timestamp, integer, text, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { campaignsTable } from "./campaigns";

export const volunteerSkillEnum = pgEnum("volunteer_skill", [
  "Teaching",
  "Medical",
  "Logistics",
  "IT",
  "Outreach",
  "Design",
]);

export const applicationStatusEnum = pgEnum("application_status", ["PENDING", "APPROVED", "REJECTED"]);

export const volunteerApplicationsTable = pgTable("volunteer_applications", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").notNull(),
  campaignId: integer("campaign_id").notNull().references(() => campaignsTable.id),
  skill: volunteerSkillEnum("skill").notNull(),
  bio: text("bio").notNull(),
  status: applicationStatusEnum("status").notNull().default("PENDING"),
  rejectionReason: text("rejection_reason"),
  reviewedBy: integer("reviewed_by"),
  appliedAt: timestamp("applied_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVolunteerApplicationSchema = createInsertSchema(volunteerApplicationsTable).omit({
  id: true,
  appliedAt: true,
  status: true,
  rejectionReason: true,
  reviewedBy: true,
});
export type InsertVolunteerApplication = z.infer<typeof insertVolunteerApplicationSchema>;
export type VolunteerApplication = typeof volunteerApplicationsTable.$inferSelect;
