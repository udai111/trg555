import 'dotenv/config';
import express from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes
const server = registerRoutes(app);

// Setup basic development server
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

// Start server
const PORT = Number(process.env.PORT || 5000);
server.listen(PORT, '0.0.0.0', () => {
  log(`Server running at http://0.0.0.0:${PORT}`);
});