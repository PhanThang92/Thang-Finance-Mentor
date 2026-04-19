import { db, leadsTable } from "../db/index.js";
import { isNotNull } from "drizzle-orm";
import { triggerLeadSync } from "./leadSyncService.js";

const RETRY_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

export function startSyncRetryWorker() {
  console.log(`[sync-retry-worker] Started - checking every ${RETRY_INTERVAL_MS / 60000} minutes`);
  
  // Also run once on startup after a small delay
  setTimeout(() => runRetryJob(), 10000);
  
  setInterval(runRetryJob, RETRY_INTERVAL_MS);
}

async function runRetryJob() {
  try {
    const failedLeads = await db.select().from(leadsTable).where(isNotNull(leadsTable.syncError));
    
    if (failedLeads.length > 0) {
      console.log(`[sync-retry-worker] Found ${failedLeads.length} leads with sync errors. Retrying...`);
      for (const lead of failedLeads) {
        // triggerLeadSync acts as a fire-and-forget sync
        triggerLeadSync(lead);
      }
    }
  } catch (err) {
    console.error("[sync-retry-worker] Error fetching failed leads:", err);
  }
}
