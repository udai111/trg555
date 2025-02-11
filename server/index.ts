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

// Security middleware with adjusted CSP for development and production
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "*.replit.dev"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "*.tradingview.com",
        "https://cdn.jsdelivr.net",
        "*.replit.dev"
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "*.replit.dev"],
      imgSrc: ["'self'", "data:", "https:", "blob:", "*.replit.dev"],
      connectSrc: ["'self'", "wss:", "ws:", "*.neon.tech", "https:", "*.replit.dev"],
      frameSrc: ["'self'", "*.tradingview.com", "*.replit.dev"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"]
    }
  },
  // Disable HSTS in development
  strictTransportSecurity: process.env.NODE_ENV === 'production'
}));

// Add CORS headers for Replit domains
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin.endsWith('.replit.dev') || origin === 'https://replit.com')) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
  }

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
export const handler = serverless(app, {
  binary: ['application/octet-stream', 'application/x-protobuf', 'image/*']
});

// Only start the server if we're not in a serverless environment
if (!process.env.NETLIFY) {
  const PORT = Number(process.env.PORT) || 5000;
  server.listen(PORT, '0.0.0.0', () => {
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