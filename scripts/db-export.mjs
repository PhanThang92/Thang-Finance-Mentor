#!/usr/bin/env node
/**
 * db-export.mjs
 * Export the PostgreSQL database to a plain-SQL dump.
 *
 * Usage:
 *   node scripts/db-export.mjs                  # dumps to ./backup-<timestamp>.sql
 *   node scripts/db-export.mjs my-backup.sql    # custom filename
 *
 * Requires: DATABASE_URL env var and pg_dump installed on the host.
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import path from "path";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("[db-export] ERROR: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

const backupDir = path.join(process.cwd(), "backups");
if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const outputArg = process.argv[2];
const outputFile = outputArg
  ? path.resolve(outputArg)
  : path.join(backupDir, `backup-${timestamp}.sql`);

console.log(`[db-export] Dumping database to: ${outputFile}`);

try {
  execSync(`pg_dump "${DATABASE_URL}" -f "${outputFile}" --no-owner --no-acl`, {
    stdio: "inherit",
  });
  console.log(`[db-export] Done. File: ${outputFile}`);
} catch (err) {
  console.error("[db-export] pg_dump failed:", err.message);
  process.exit(1);
}
