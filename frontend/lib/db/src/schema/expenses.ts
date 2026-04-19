import { pgTable, serial, timestamp, numeric, integer, text, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { campaignsTable } from "./campaigns";

export const expenseCategoryEnum = pgEnum("expense_category", [
  "Logistics",
  "Food",
  "Transport",
  "Medical",
  "Operations",
  "Other",
]);

export const expensesTable = pgTable("expenses", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaignsTable.id),
  category: expenseCategoryEnum("category").notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description").notNull(),
  adminId: integer("admin_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertExpenseSchema = createInsertSchema(expensesTable).omit({ id: true, createdAt: true });
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expensesTable.$inferSelect;
