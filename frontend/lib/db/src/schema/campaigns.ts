import { pgTable, text, serial, timestamp, numeric, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const campaignStatusEnum = pgEnum("campaign_status", ["ACTIVE", "COMPLETED", "CANCELLED"]);

export const campaignsTable = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  goalAmount: numeric("goal_amount", { precision: 15, scale: 2 }).notNull(),
  deadline: text("deadline").notNull(),
  adminUserId: integer("admin_user_id").notNull(),
  status: campaignStatusEnum("status").notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCampaignSchema = createInsertSchema(campaignsTable).omit({ id: true, createdAt: true, status: true });
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaignsTable.$inferSelect;
