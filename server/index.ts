import 'dotenv/config';
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { storage } from "./storage";
import serverless from 'serverless-http';
import helmet from 'helmet';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable CSP temporarily for faster deployment
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for Netlify deployment
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Add health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    const testUser = await storage.getUserByUsername('test');
    res.json({ 
      status: 'ok',
      database: {
        connected: true,
        url: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'hidden',
        database: process.env.PGDATABASE || 'neondb'
      },
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Register routes
registerRoutes(app);

// Export the serverless handler for Netlify Functions
export const handler = serverless(app, {
  binary: ['application/octet-stream', 'application/x-protobuf', 'image/*'],
  basePath: '/.netlify/functions',
  callbackWaitsForEmptyEventLoop: false
});

// Only start the server if we're not in a serverless environment
if (!process.env.NETLIFY) {
  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});