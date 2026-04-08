/**
 * Entry point wrapper for production.
 * Loads the .env file BEFORE importing the app so that DATABASE_URL
 * and other vars are set before the DB pool initialises.
 *
 * Usage (from project root):
 *   node loader.mjs
 */
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from project root
config({ path: path.resolve(__dirname, ".env") });
// Fallback: .env from current working directory
config({ path: path.resolve(process.cwd(), ".env") });

await import("./dist/index.mjs");
