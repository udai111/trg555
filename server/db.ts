import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Create a simple pool with basic configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Create the drizzle database instance
export const db = drizzle(pool, { schema });

// Basic error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

// Export the in-memory store for testing
export const store = new Map();