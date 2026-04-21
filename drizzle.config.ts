import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("POSTGRES_URL hoặc DATABASE_URL phải được khai báo.");
}

export default defineConfig({
  schema: "./server/db/schema/index.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
  migrations: {
    table: "__drizzle_migrations",
    schema: "public",
  },
});
