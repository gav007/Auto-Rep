import { Pool } from 'pg';  // Standard Postgres client for Node.js
import { drizzle } from 'drizzle-orm/node-postgres';  // Drizzle's local Postgres adapter
import * as schema from "@shared/schema";  // Your DB schema

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
