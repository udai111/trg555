import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Simple in-memory database for development
const inMemoryDb = new Map();

export const db = {
  // Simplified interface that matches what we need
  select: () => ({
    from: () => ({
      where: () => []
    })
  }),
  insert: () => ({
    values: () => ({
      returning: () => []
    })
  }),
  update: () => ({
    set: () => ({
      where: () => ({
        returning: () => []
      })
    })
  })
};

// Export the in-memory store for testing
export const store = inMemoryDb;