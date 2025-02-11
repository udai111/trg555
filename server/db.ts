import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

function constructDatabaseUrl(): string {
  // If DATABASE_URL is provided and valid, use it
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
    return process.env.DATABASE_URL;
  }

  // Construct URL from individual components
  const host = process.env.PGHOST;
  const port = process.env.PGPORT;
  const user = process.env.PGUSER;
  const password = process.env.PGPASSWORD;
  const database = process.env.PGDATABASE;

  if (!host || !port || !user || !password || !database) {
    throw new Error(
      "Database configuration incomplete. Required environment variables: PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE"
    );
  }

  return `postgresql://${user}:${password}@${host}:${port}/${database}?sslmode=require`;
}

const databaseUrl = constructDatabaseUrl();
console.log('Connecting to database:', databaseUrl.replace(/:[^:@]+@/, ':****@')); // Log URL with masked password

// Create the connection pool
export const pool = new Pool({ 
  connectionString: databaseUrl,
  database: process.env.PGDATABASE // Explicitly set database name
});

export const db = drizzle({ client: pool, schema });

// Add error handling for the pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  pool.end(() => {
    console.log('Database pool has ended');
    process.exit(0);
  });
});