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
    // Add logging
    console.log('Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')); // Mask password
    console.log('Database Name:', process.env.PGDATABASE);

    // Try to get a user to test database connection
    const testUser = await storage.getUserByUsername('test');
    res.json({ 
      status: 'ok',
      database: {
        connected: true,
        url: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'hidden', // Only show host/port
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
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add a catch-all route for the API
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Convert express app to serverless function
export const handler = serverless(app, {
  binary: ['application/octet-stream', 'application/x-protobuf', 'image/*']
});