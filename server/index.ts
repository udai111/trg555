import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import serverless from 'serverless-http';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const sanitizedResponse = { ...capturedJsonResponse };
        delete sanitizedResponse.password;
        delete sanitizedResponse.token;
        logLine += ` :: ${JSON.stringify(sanitizedResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Add health check endpoint
app.get('/api/health', async (_req, res) => {
  try {
    // Try to get a user to test database connection
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
  binary: ['application/octet-stream', 'application/x-protobuf', 'image/*']
});

// Only start the server if we're not in a serverless environment
if (!process.env.NETLIFY) {
  const PORT = Number(process.env.PORT) || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    log(`serving on port ${PORT}`);
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