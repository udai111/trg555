import express, { Express } from 'express';
import serverless from 'serverless-http';
import { storage } from './storage';
import { setupAuth } from './auth';
import { registerRoutes } from './routes';

const app: Express = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup authentication
setupAuth(app);

// Register all routes
registerRoutes(app);

// API Routes
app.get('/.netlify/functions/server/api/health', async (_req, res) => {
  try {
    console.log('Checking database connection...');
    const testUser = await storage.getUserByUsername('test');
    res.json({ 
      status: 'ok',
      database: {
        connected: true,
        url: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'hidden',
        database: process.env.PGDATABASE || 'neondb',
        test_query: testUser ? 'success' : 'no test user found'
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV
    });
  }
});

// Export the serverless handler
export const handler = serverless(app, {
  binary: ['application/octet-stream', 'application/x-protobuf', 'image/*'],
  basePath: '/.netlify/functions/server'
});