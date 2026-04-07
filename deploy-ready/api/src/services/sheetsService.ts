/**
 * sheetsService.ts
 * Appends lead records to a Google Sheet after successful local DB save.
 *
 * Configuration (all optional — sync is disabled if keys are absent):
 *   GOOGLE_CLIENT_EMAIL       Service account email
 *   GOOGLE_PRIVATE_KEY        Service account private key (PEM, with newlines as \n)
 *   GOOGLE_SPREADSHEET_ID     ID of the target Google Spreadsheet
 *   GOOGLE_SHEET_NAME         Tab name to append to (default: "Leads")
 *   ENABLE_GOOGLE_SHEETS_SYNC "true" to enable (default false for safety)
 *
 * Setup:
 *   1. Create a Google Cloud service account
 *   2. Enable the Google Sheets API
 *   3. Share your spreadsheet with the service account email
 *   4. Set the env vars above
 *
 * Column order in the sheet (row 1 must be a header row):
 *   Created At | Full Name | Phone | Email | Message | Source Page |
 *   Source Type | Campaign | UTM Source | UTM Medium | UTM Term | UTM Content |
 *   Article | Status | Internal ID
 *
 * To disable: set ENABLE_GOOGLE_SHEETS_SYNC=false or remove credentials.
 */

import { google } from "googleapis";
import { db, leadsTable } from "../lib/db/index.js";
import { eq } from "drizzle-orm";
import type { Lead } from "../lib/db/index.js";

const ENABLED =
  process.env.ENABLE_GOOGLE_SHEETS_SYNC === "true" &&
  !!process.env.GOOGLE_CLIENT_EMAIL &&
  !!process.env.GOOGLE_PRIVATE_KEY &&
  !!process.env.GOOGLE_SPREADSHEET_ID;

const SHEET_NAME = process.env.GOOGLE_SHEET_NAME ?? "Leads";

let sheets: ReturnType<typeof google.sheets> | null = null;

if (ENABLED) {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: (process.env.GOOGLE_PRIVATE_KEY ?? "").replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  sheets = google.sheets({ version: "v4", auth });
  console.log("[sheets] Google Sheets sync enabled");
} else {
  console.log("[sheets] Google Sheets sync disabled — set ENABLE_GOOGLE_SHEETS_SYNC=true + credentials to enable");
}

function formatDate(d: Date): string {
  return d.toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

/**
 * Append a single lead as a new row in the Google Sheet.
 * Returns true on success, false on failure.
 * Updates the leads table with sync status.
 */
export async function syncLeadToSheets(lead: Lead): Promise<boolean> {
  if (!ENABLED || !sheets) return false;

  // Skip if already synced
  if (lead.syncedToSheets) return true;

  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID!;

  const row = [
    formatDate(lead.createdAt),
    lead.name,
    lead.phone ?? "",
    lead.email ?? "",
    lead.message ?? "",
    lead.sourcePage ?? "",
    lead.sourceType ?? "",
    lead.utmCampaign ?? "",
    lead.utmSource ?? "",
    lead.utmMedium ?? "",
    lead.utmTerm ?? "",
    lead.utmContent ?? "",
    lead.articleSlug ? `${lead.articleTitle ?? ""} (${lead.articleSlug})` : "",
    lead.status ?? "moi",
    String(lead.id),
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:O`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    // Update sync status in DB
    await db.update(leadsTable).set({
      syncedToSheets: true,
      sheetsSyncedAt: new Date(),
      syncError: null,
      updatedAt: new Date(),
    }).where(eq(leadsTable.id, lead.id));

    console.log(`[sheets] Synced lead ${lead.id} → Google Sheets`);
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[sheets] Failed to sync lead ${lead.id}:`, message);

    await db.update(leadsTable).set({
      syncError: `sheets: ${message}`,
      updatedAt: new Date(),
    }).where(eq(leadsTable.id, lead.id)).catch(() => {});

    return false;
  }
}

/**
 * Retry all un-synced leads (for background retry jobs).
 * Only runs if Sheets sync is enabled.
 */
export async function retryFailedSheetsSyncs(): Promise<void> {
  if (!ENABLED) return;

  const unsynced = await db
    .select()
    .from(leadsTable)
    .where(eq(leadsTable.syncedToSheets, false))
    .limit(50);

  for (const lead of unsynced) {
    await syncLeadToSheets(lead);
  }
}
