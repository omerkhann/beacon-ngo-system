import { pgTable, serial, timestamp, numeric, integer, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { campaignsTable } from "./campaigns";

export const donationsTable = pgTable("donations", {
  id: serial("id").primaryKey(),
  donorId: integer("donor_id").notNull(),
  campaignId: integer("campaign_id").notNull().references(() => campaignsTable.id),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  receiptNumber: text("receipt_number").notNull(),
  transactionDate: timestamp("transaction_date", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDonationSchema = createInsertSchema(donationsTable).omit({ id: true, transactionDate: true });
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donationsTable.$inferSelect;
