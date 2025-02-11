import express, { Express } from 'express';
import serverless from 'serverless-http';
import { setupAuth } from './auth';
import { storage } from './storage';

const app: Express = express();

// Middleware setup
app.use(express.json());

// Setup authentication
setupAuth(app);

// Convert express app to serverless function
export const handler = serverless(app);
