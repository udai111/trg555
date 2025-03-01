import { defineConfig } from "drizzle-kit";

// Support both PostgreSQL and SQLite
let dialect = "postgresql";
if (process.env.DATABASE_URL?.startsWith("file:")) {
  dialect = "sqlite";
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: dialect as any,
  dbCredentials: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
});
