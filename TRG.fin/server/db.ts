import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

// Set up a mock DB if no real DB is available
let pool;
let db;

try {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
    console.warn(
      "Warning: Using in-memory storage instead of PostgreSQL.",
    );
    
    // Set up mock database functionality
    db = createMockDb();
  } else {
    const poolConfig = {
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    pool = new Pool(poolConfig);

    // Add error handling for the pool
    pool.on('error', (err) => {
      console.error('Unexpected error on idle database client', err);
      // Don't exit process in development mode
      if (process.env.NODE_ENV === 'production') {
        process.exit(-1);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      if (pool) {
        pool.end(() => {
          console.log('Database pool has ended');
          process.exit(0);
        });
      }
    });

    db = drizzle({ client: pool, schema });

    // Test database connection
    testConnection().catch(err => {
      console.error('Database connection failed:', err);
      console.warn('Falling back to in-memory storage');
      db = createMockDb();
    });
  }
} catch (err) {
  console.error('Error setting up database:', err);
  console.warn('Falling back to in-memory storage');
  db = createMockDb();
}

export { pool, db };

// Mock DB implementation
function createMockDb() {
  // In-memory storage
  const storage = {
    users: [],
    portfolios: [],
    stocks: [],
    transactions: [],
    educational_resources: [],
    social_interactions: []
  };

  // Return a simple mock DB interface
  return {
    select: () => ({
      from: (table: any) => ({
        where: () => Promise.resolve([]),
      }),
    }),
    insert: (table: any) => ({
      values: (data: any) => ({
        returning: () => {
          const tableName = table._.name.name;
          const newItem = { ...data, id: storage[tableName].length + 1 };
          storage[tableName].push(newItem);
          return Promise.resolve([newItem]);
        },
      }),
    }),
  };
}

// Test database connection
async function testConnection() {
  if (!pool) return;
  
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('Database connection successful');
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
}