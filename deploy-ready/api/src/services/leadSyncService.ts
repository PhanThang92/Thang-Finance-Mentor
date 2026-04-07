/**
 * leadSyncService.ts
 * Orchestrates non-blocking external sync after a lead is saved to the DB.
 *
 * Sync order:
 *   1. DB save (handled by caller — must succeed before this is called)
 *   2. Notion sync (if ENABLE_NOTION_SYNC=true)
 *   3. Google Sheets sync (if ENABLE_GOOGLE_SHEETS_SYNC=true)
 *
 * Failure in any sync step is logged and stored in leads.sync_error.
 * The lead is NEVER lost — DB is the primary source of truth.
 */

import { syncLeadToNotion } from "./notionService.js";
import { syncLeadToSheets } from "./sheetsService.js";
import type { Lead } from "../lib/db/index.js";

/**
 * Fire-and-forget external sync.
 * Call this after successfully inserting or updating a lead in the DB.
 * The result is intentionally not awaited by the HTTP handler.
 */
export function triggerLeadSync(lead: Lead): void {
  setImmediate(async () => {
    try {
      // Run in parallel — one failure does not stop the other
      await Promise.allSettled([
        syncLeadToNotion(lead),
        syncLeadToSheets(lead),
      ]);
    } catch (err) {
      console.error("[lead-sync] Unexpected error:", err);
    }
  });
}
