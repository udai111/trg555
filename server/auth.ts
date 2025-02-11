import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { randomBytes } from "crypto";

declare module 'express-session' {
  interface SessionData {
    passport?: any;
    isAuthenticated?: boolean;
  }
}

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

export function setupAuth(app: Express) {
  // Use a simpler session configuration
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: app.get('env') === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // JSON Content-Type middleware
  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log(`[Auth] Login attempt for user: ${username}`);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log(`[Auth] User not found: ${username}`);
          return done(null, false, { message: "Invalid username or password" });
        }
        // For demo purposes, accept any password
        console.log(`[Auth] Login successful for user: ${username}`);
        return done(null, user);
      } catch (err) {
        console.error('[Auth] Login error:', err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user: Express.User, done) => {
    console.log(`[Auth] Serializing user: ${user.username}`);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log(`[Auth] Deserializing user ID: ${id}`);
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (err) {
      console.error('[Auth] Deserialize error:', err);
      done(err);
    }
  });

  // Simple middleware to ensure JSON responses
  const wrapAsync = (fn: Function) => {
    return (req: Request, res: any, next: any) => {
      fn(req, res, next).catch(next);
    };
  };

  app.post("/api/register", wrapAsync(async (req: Request, res) => {
    console.log('[Auth] Register attempt:', req.body);
    const { username } = req.body;

    if (!username || typeof username !== 'string' || username.length < 3) {
      console.log('[Auth] Invalid username:', username);
      return res.status(400).json({
        error: true,
        message: "Username must be at least 3 characters"
      });
    }

    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      console.log('[Auth] Username exists:', username);
      return res.status(400).json({
        error: true,
        message: "Username already exists"
      });
    }

    try {
      const user = await storage.createUser({
        username,
        email: `${username}@example.com`,
        password: "demo" // For demo purposes
      });

      console.log('[Auth] User created:', username);
      req.login(user, (err) => {
        if (err) {
          console.error('[Auth] Login after registration failed:', err);
          return res.status(500).json({
            error: true,
            message: "Login failed after registration"
          });
        }
        console.log('[Auth] Login after registration successful:', username);
        res.json({ user, isAuthenticated: true });
      });
    } catch (err) {
      console.error('[Auth] Registration error:', err);
      res.status(500).json({
        error: true,
        message: "Registration failed"
      });
    }
  }));

  app.post("/api/login", (req, res, next) => {
    console.log('[Auth] Login attempt:', req.body);
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error('[Auth] Authentication error:', err);
        return res.status(500).json({
          error: true,
          message: "Authentication error"
        });
      }
      if (!user) {
        console.log('[Auth] Authentication failed:', info?.message);
        return res.status(401).json({
          error: true,
          message: info?.message || "Invalid credentials"
        });
      }
      req.login(user, (err) => {
        if (err) {
          console.error('[Auth] Login error:', err);
          return res.status(500).json({
            error: true,
            message: "Login failed"
          });
        }
        console.log('[Auth] Login successful:', user.username);
        res.json({ user, isAuthenticated: true });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    const username = req.user?.username;
    console.log('[Auth] Logout attempt:', username);
    req.logout((err) => {
      if (err) {
        console.error('[Auth] Logout error:', err);
        return res.status(500).json({
          error: true,
          message: "Logout failed"
        });
      }
      console.log('[Auth] Logout successful:', username);
      res.json({
        message: "Logged out successfully",
        isAuthenticated: false
      });
    });
  });

  app.get("/api/user", (req, res) => {
    console.log('[Auth] User check:', req.user?.username);
    if (!req.isAuthenticated() || !req.user) {
      console.log('[Auth] User not authenticated');
      return res.status(401).json({
        error: true,
        message: "Not authenticated",
        isAuthenticated: false
      });
    }
    console.log('[Auth] User authenticated:', req.user.username);
    res.json({
      user: req.user,
      isAuthenticated: true
    });
  });

  // Error handling middleware
  app.use((err: Error, req: Request, res: any, next: any) => {
    console.error('[Auth] Error:', err);
    res.status(500).json({
      error: true,
      message: 'Internal server error',
      isAuthenticated: false
    });
  });
}