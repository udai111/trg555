import { pgTable, text, serial, integer, boolean, timestamp, decimal, foreignKey } from "drizzle-orm/pg-core";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  cash_balance: decimal("cash_balance").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  current_price: decimal("current_price").notNull(),
  last_updated: timestamp("last_updated").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  portfolio_id: integer("portfolio_id").references(() => portfolios.id),
  stock_id: integer("stock_id").references(() => stocks.id),
  type: text("type").notNull(), // 'buy' or 'sell'
  quantity: integer("quantity").notNull(),
  price: decimal("price").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const educational_resources = pgTable("educational_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  difficulty_level: text("difficulty_level").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const social_interactions = pgTable("social_interactions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id),
  type: text("type").notNull(), // 'comment', 'follow', 'like'
  target_id: integer("target_id").notNull(), // can be user_id or post_id
  content: text("content"),
  created_at: timestamp("created_at").defaultNow(),
});

// Define manual insert types as fallbacks for when drizzle-zod isn't available
export type InsertUser = {
  username: string;
  password: string;
  email: string;
};

export type User = {
  id: number;
  username: string;
  password: string;
  email: string;
  created_at: Date;
};

export type Portfolio = typeof portfolios.$inferSelect;
export type Stock = typeof stocks.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type EducationalResource = typeof educational_resources.$inferSelect;
export type SocialInteraction = typeof social_interactions.$inferSelect;

// For schema validation, we'll manually define Zod schemas when needed
export const insertUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(4),
  email: z.string().email(),
});

export const insertPortfolioSchema = z.object({
  user_id: z.number(),
  name: z.string().min(1),
  cash_balance: z.coerce.number().min(0),
});

export const insertStockSchema = z.object({
  symbol: z.string().min(1).max(10),
  name: z.string().min(1),
  current_price: z.coerce.number().min(0),
});

export const insertTransactionSchema = z.object({
  portfolio_id: z.number(),
  stock_id: z.number(),
  type: z.string().min(1).max(4),
  quantity: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
});

export const insertEducationalResourceSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  difficulty_level: z.string().min(1),
});

export const insertSocialInteractionSchema = z.object({
  user_id: z.number(),
  type: z.string().min(1).max(10),
  target_id: z.number(),
  content: z.string().min(1),
});