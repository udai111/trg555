import express, { Express } from 'express';
import serverless from 'serverless-http';
import { storage } from './storage';
import { setupAuth } from './auth';

const app: Express = express();

// Middleware setup
app.use(express.json());

// Setup authentication
setupAuth(app);

// API Routes
app.get('/api/health', async (_req, res) => {
  try {
    console.log('Database URL:', process.env.DATABASE_URL); // Add logging
    console.log('Database Name:', process.env.PGDATABASE); // Add logging

    // Try to get a user to test database connection
    const testUser = await storage.getUserByUsername('test');
    res.json({ 
      status: 'ok',
      database: 'connected',
      dbName: process.env.PGDATABASE || 'neondb',
      test_query: testUser ? 'success' : 'no test user found'
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Convert express app to serverless function
export const handler = serverless(app);