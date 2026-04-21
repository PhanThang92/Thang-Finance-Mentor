import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// POSTGRES_URL (biến tự do) được ưu tiên hơn DATABASE_URL (bị Replit quản lý).
// Đặt POSTGRES_URL trong Replit Secrets hoặc biến môi trường Plesk để
// trỏ toàn bộ dự án về PostgreSQL server riêng.
const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "POSTGRES_URL hoặc DATABASE_URL phải được khai báo.",
  );
}

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export * from "./schema";
