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
      console.log('Executing getUserByUsername query for username:', username);
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

  // Portfolio operations with error handling
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

  // Stock operations with error handling
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

  // Transaction operations with error handling
  async getTransaction(id: number): Promise<Transaction | undefined> {
    try {
      const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
      return transaction;
    } catch (error) {
      console.error('Error in getTransaction:', error);
      throw error;
    }
  }

  async getPortfolioTransactions(portfolioId: number): Promise<Transaction[]> {
    try {
      return await db.select().from(transactions).where(eq(transactions.portfolio_id, portfolioId));
    } catch (error) {
      console.error('Error in getPortfolioTransactions:', error);
      throw error;
    }
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    try {
      const [newTransaction] = await db.insert(transactions).values(transaction).returning();
      return newTransaction;
    } catch (error) {
      console.error('Error in createTransaction:', error);
      throw error;
    }
  }

  // Educational resource operations with error handling
  async getEducationalResource(id: number): Promise<EducationalResource | undefined> {
    try {
      const [resource] = await db.select().from(educational_resources).where(eq(educational_resources.id, id));
      return resource;
    } catch (error) {
      console.error('Error in getEducationalResource:', error);
      throw error;
    }
  }

  async getEducationalResourcesByCategory(category: string): Promise<EducationalResource[]> {
    try {
      return await db.select().from(educational_resources).where(eq(educational_resources.category, category));
    } catch (error) {
      console.error('Error in getEducationalResourcesByCategory:', error);
      throw error;
    }
  }

  async createEducationalResource(resource: InsertEducationalResource): Promise<EducationalResource> {
    try {
      const [newResource] = await db.insert(educational_resources).values(resource).returning();
      return newResource;
    } catch (error) {
      console.error('Error in createEducationalResource:', error);
      throw error;
    }
  }

  // Social interaction operations with error handling
  async getSocialInteraction(id: number): Promise<SocialInteraction | undefined> {
    try {
      const [interaction] = await db.select().from(social_interactions).where(eq(social_interactions.id, id));
      return interaction;
    } catch (error) {
      console.error('Error in getSocialInteraction:', error);
      throw error;
    }
  }

  async getUserSocialInteractions(userId: number): Promise<SocialInteraction[]> {
    try {
      return await db.select().from(social_interactions).where(eq(social_interactions.user_id, userId));
    } catch (error) {
      console.error('Error in getUserSocialInteractions:', error);
      throw error;
    }
  }

  async createSocialInteraction(interaction: InsertSocialInteraction): Promise<SocialInteraction> {
    try {
      const [newInteraction] = await db.insert(social_interactions).values(interaction).returning();
      return newInteraction;
    } catch (error) {
      console.error('Error in createSocialInteraction:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();