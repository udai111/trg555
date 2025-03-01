import { users, type User, type InsertUser } from "../shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// keep IStorage interface the same
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  // In-memory fallback storage when DB operations fail
  private memoryUsers: User[] = [
    {
      id: 1,
      username: "demo",
      password: "demo",
      email: "demo@example.com",
      created_at: new Date()
    }
  ];

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (err) {
      console.warn("DB error in getUser, using memory fallback:", err);
      return this.memoryUsers.find(u => u.id === id);
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (err) {
      console.warn("DB error in getUserByUsername, using memory fallback:", err);
      return this.memoryUsers.find(u => u.username === username);
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(insertUser)
        .returning();
      return user;
    } catch (err) {
      console.warn("DB error in createUser, using memory fallback:", err);
      const newUser = {
        ...insertUser,
        id: this.memoryUsers.length > 0 ? Math.max(...this.memoryUsers.map(u => u.id)) + 1 : 1,
        created_at: new Date()
      } as User;
      this.memoryUsers.push(newUser);
      return newUser;
    }
  }
}

export const storage = new DatabaseStorage();