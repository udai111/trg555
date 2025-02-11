import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { randomBytes } from "crypto";

// Augment express-session with a custom SessionData interface
declare module 'express-session' {
  interface SessionData {
    passport?: any;
  }
}

// Augment Express Request type
declare global {
  namespace Express {
    interface User extends SelectUser {}
    interface Request {
      user?: User;
      login(user: User, done: (err: any) => void): void;
      logout(done: (err: any) => void): void;
    }
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID! + randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: app.get('env') === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    }
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (
      username: string, 
      password: string, 
      done: (error: any, user?: SelectUser | false, options?: { message: string }) => void
    ) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "User not found" });
        }
        // For this demo, we're not implementing password checks
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user: Express.User, done: (err: any, id?: number) => void) => {
    done(null, user.id)
  });

  passport.deserializeUser(async (id: number, done: (err: any, user?: Express.User | false) => void) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req: Request, res) => {
    try {
      const { username } = req.body;

      // Input validation
      if (!username || typeof username !== 'string' || username.length < 3) {
        return res.status(400).json({ message: "Invalid username. Must be at least 3 characters." });
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        username,
        email: `${username}@example.com`, // Placeholder email
        password: "demo", // For demo purposes
      });

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration" });
        }
        res.status(201).json(user);
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/login", (req: Request, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false, info?: { message: string }) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Authentication failed" });

      req.login(user, (err) => {
        if (err) return next(err);
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req: Request, res) => {
    const username = req.user?.username;
    req.logout(() => {
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: `${username} logged out successfully` });
      });
    });
  });

  app.get("/api/user", (req: Request, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    // Don't send sensitive information
    const { password, ...safeUser } = req.user;
    res.json(safeUser);
  });
}