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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error in getUser:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db.insert(users).values(insertUser).returning();
      return user;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  }

  // Portfolio operations
  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    try {
      const [portfolio] = await db.select().from(portfolios).where(eq(portfolios.id, id));
      return portfolio;
    } catch (error) {
      console.error('Error in getPortfolio:', error);
      throw error;
    }
  }

  async getUserPortfolios(userId: number): Promise<Portfolio[]> {
    try {
      return await db.select().from(portfolios).where(eq(portfolios.user_id, userId));
    } catch (error) {
      console.error('Error in getUserPortfolios:', error);
      throw error;
    }
  }

  async createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio> {
    try {
      const [newPortfolio] = await db.insert(portfolios).values(portfolio).returning();
      return newPortfolio;
    } catch (error) {
      console.error('Error in createPortfolio:', error);
      throw error;
    }
  }

  // Stock operations
  async getStock(id: number): Promise<Stock | undefined> {
    try {
      const [stock] = await db.select().from(stocks).where(eq(stocks.id, id));
      return stock;
    } catch (error) {
      console.error('Error in getStock:', error);
      throw error;
    }
  }

  async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    try {
      const [stock] = await db.select().from(stocks).where(eq(stocks.symbol, symbol));
      return stock;
    } catch (error) {
      console.error('Error in getStockBySymbol:', error);
      throw error;
    }
  }

  async createStock(stock: InsertStock): Promise<Stock> {
    try {
      const [newStock] = await db.insert(stocks).values(stock).returning();
      return newStock;
    } catch (error) {
      console.error('Error in createStock:', error);
      throw error;
    }
  }

  async updateStockPrice(id: number, price: number): Promise<Stock> {
    try {
      const [updatedStock] = await db
        .update(stocks)
        .set({ 
          current_price: price.toString(),
          last_updated: new Date() 
        })
        .where(eq(stocks.id, id))
        .returning();
      return updatedStock;
    } catch (error) {
      console.error('Error in updateStockPrice:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();