import express, { Express } from 'express';
import serverless from 'serverless-http';
import { storage } from './storage';

const app: Express = express();

// Middleware setup
app.use(express.json());

// Basic health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Convert express app to serverless function
export const handler = serverless(app);