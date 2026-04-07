/**
 * Entry point wrapper for production.
 * Loads the single root .env file BEFORE importing the app,
 * so that DATABASE_URL and other vars are set before @workspace/db initializes.
 *
 * Run from project root:   node artifacts/api-server/loader.mjs
 * Or from artifact dir:    node loader.mjs
 */
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Try root .env (2 levels up from artifacts/api-server/)
config({ path: path.resolve(__dirname, "../../.env") });
// Fallback: .env in current working directory
config({ path: path.resolve(process.cwd(), ".env") });

// Now start the API server (env vars are ready)
await import("./dist/index.mjs");
