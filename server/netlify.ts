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
    // Try to get a user to test database connection
    const testUser = await storage.getUserByUsername('test');
    res.json({ 
      status: 'ok',
      database: 'connected',
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