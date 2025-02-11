import { 
  users, portfolios, stocks, transactions, educational_resources, social_interactions,
  type User, type InsertUser,
  type Portfolio, type InsertPortfolio,
  type Stock, type InsertStock,
  type Transaction, type InsertTransaction,
  type EducationalResource, type InsertEducationalResource,
  type SocialInteraction, type InsertSocialInteraction
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Portfolio operations
  getPortfolio(id: number): Promise<Portfolio | undefined>;
  getUserPortfolios(userId: number): Promise<Portfolio[]>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;

  // Stock operations
  getStock(id: number): Promise<Stock | undefined>;
  getStockBySymbol(symbol: string): Promise<Stock | undefined>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStockPrice(id: number, price: number): Promise<Stock>;

  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getPortfolioTransactions(portfolioId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Educational resource operations
  getEducationalResource(id: number): Promise<EducationalResource | undefined>;
  getEducationalResourcesByCategory(category: string): Promise<EducationalResource[]>;
  createEducationalResource(resource: InsertEducationalResource): Promise<EducationalResource>;

  // Social interaction operations
  getSocialInteraction(id: number): Promise<SocialInteraction | undefined>;
  getUserSocialInteractions(userId: number): Promise<SocialInteraction[]>;
  createSocialInteraction(interaction: InsertSocialInteraction): Promise<SocialInteraction>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Portfolio operations
  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.id, id));
    return portfolio;
  }

  async getUserPortfolios(userId: number): Promise<Portfolio[]> {
    return await db.select().from(portfolios).where(eq(portfolios.user_id, userId));
  }

  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    const [newPortfolio] = await db.insert(portfolios).values(portfolio).returning();
    return newPortfolio;
  }

  // Stock operations
  async getStock(id: number): Promise<Stock | undefined> {
    const [stock] = await db.select().from(stocks).where(eq(stocks.id, id));
    return stock;
  }

  async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    const [stock] = await db.select().from(stocks).where(eq(stocks.symbol, symbol));
    return stock;
  }

  async createStock(stock: InsertStock): Promise<Stock> {
    const [newStock] = await db.insert(stocks).values(stock).returning();
    return newStock;
  }

  async updateStockPrice(id: number, price: number): Promise<Stock> {
    const [updatedStock] = await db
      .update(stocks)
      .set({ 
        current_price: price.toString(),
        last_updated: new Date() 
      })
      .where(eq(stocks.id, id))
      .returning();
    return updatedStock;
  }

  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async getPortfolioTransactions(portfolioId: number): Promise<Transaction[]> {
    return await db.select().from(transactions).where(eq(transactions.portfolio_id, portfolioId));
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }

  // Educational resource operations
  async getEducationalResource(id: number): Promise<EducationalResource | undefined> {
    const [resource] = await db.select().from(educational_resources).where(eq(educational_resources.id, id));
    return resource;
  }

  async getEducationalResourcesByCategory(category: string): Promise<EducationalResource[]> {
    return await db.select().from(educational_resources).where(eq(educational_resources.category, category));
  }

  async createEducationalResource(resource: InsertEducationalResource): Promise<EducationalResource> {
    const [newResource] = await db.insert(educational_resources).values(resource).returning();
    return newResource;
  }

  // Social interaction operations
  async getSocialInteraction(id: number): Promise<SocialInteraction | undefined> {
    const [interaction] = await db.select().from(social_interactions).where(eq(social_interactions.id, id));
    return interaction;
  }

  async getUserSocialInteractions(userId: number): Promise<SocialInteraction[]> {
    return await db.select().from(social_interactions).where(eq(social_interactions.user_id, userId));
  }

  async createSocialInteraction(interaction: InsertSocialInteraction): Promise<SocialInteraction> {
    const [newInteraction] = await db.insert(social_interactions).values(interaction).returning();
    return newInteraction;
  }
}

export const storage = new DatabaseStorage();