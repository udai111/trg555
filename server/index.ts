import 'dotenv/config';
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import serverless from 'serverless-http';
import helmet from 'helmet';
import http from 'http';
import { setupAuth } from './auth';

const app = express();

// Security middleware with proper CSP for Replit environment
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "*.replit.dev", "ws:", "wss:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "data:"],
      frameSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

// Enable CORS for Replit domains
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && origin.endsWith('.replit.dev')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setup authentication
setupAuth(app);

// Register API routes before frontend middleware
registerRoutes(app);

// Create HTTP server
const server = http.createServer(app);

if (process.env.NODE_ENV === 'production') {
  log('Running in production mode');
  serveStatic(app);
} else {
  log('Running in development mode');
  setupVite(app, server)
    .catch((err) => {
      console.error('Failed to setup Vite:', err);
      process.exit(1);
    });
}

// Export serverless handler for Netlify
export const handler = serverless(app);

// Only start the server if we're not in a serverless environment
if (!process.env.NETLIFY) {
  const PORT = Number(process.env.PORT || 5000);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
    console.log('Press Ctrl+C to stop');
  });

  // Improved error handling for the server
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
      throw error;
    }

    switch (error.code) {
      case 'EACCES':
        console.error(`Port ${PORT} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});