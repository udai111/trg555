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
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Convert express app to serverless function
export const handler = serverless(app);