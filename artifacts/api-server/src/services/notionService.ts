/**
 * notionService.ts
 * Syncs lead records to a Notion database after successful local DB save.
 *
 * Configuration (all optional — sync is disabled if NOTION_API_KEY is absent):
 *   NOTION_API_KEY        Notion integration secret (starts with "secret_")
 *   NOTION_DATABASE_ID    ID of the target Notion database (32-char hex or hyphenated UUID)
 *   ENABLE_NOTION_SYNC    "true" to enable (default false for safety)
 *
 * Field mapping:
 *   The Notion database must have the columns listed in FIELD_MAP below.
 *   Column names are case-sensitive in Notion.
 *
 * To disable: set ENABLE_NOTION_SYNC=false or remove NOTION_API_KEY.
 * To re-sync a failed lead: call syncLeadToNotion(lead) again — the service
 *   checks notionPageId to avoid duplicates.
 */

import { Client } from "@notionhq/client";
import { db, leadsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Lead } from "@workspace/db";

const ENABLED =
  process.env.ENABLE_NOTION_SYNC === "true" &&
  !!process.env.NOTION_API_KEY &&
  !!process.env.NOTION_DATABASE_ID;

let notion: Client | null = null;

if (ENABLED) {
  notion = new Client({ auth: process.env.NOTION_API_KEY });
  console.log("[notion] Notion sync enabled");
} else {
  console.log("[notion] Notion sync disabled — set ENABLE_NOTION_SYNC=true + NOTION_API_KEY + NOTION_DATABASE_ID to enable");
}

/**
 * Sync a single lead to Notion.
 * Returns true on success, false on failure.
 * Updates the leads table with sync status and Notion page ID.
 */
export async function syncLeadToNotion(lead: Lead): Promise<boolean> {
  if (!ENABLED || !notion) return false;

  // Skip if already synced
  if (lead.syncedToNotion && lead.notionPageId) return true;

  const databaseId = process.env.NOTION_DATABASE_ID!;

  try {
    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        // Title property — usually "Name" in Notion
        "Name": {
          title: [{ text: { content: lead.name } }],
        },
        "Phone": {
          rich_text: [{ text: { content: lead.phone ?? "" } }],
        },
        "Email": {
          email: lead.email ?? null,
        },
        "Message": {
          rich_text: [{ text: { content: lead.message ?? "" } }],
        },
        "Source Page": {
          rich_text: [{ text: { content: lead.sourcePage ?? "" } }],
        },
        "Source Type": {
          select: lead.sourceType ? { name: lead.sourceType } : null,
        },
        "Campaign": {
          rich_text: [{ text: { content: lead.utmCampaign ?? "" } }],
        },
        "UTM Source": {
          rich_text: [{ text: { content: lead.utmSource ?? "" } }],
        },
        "UTM Medium": {
          rich_text: [{ text: { content: lead.utmMedium ?? "" } }],
        },
        "Status": {
          select: { name: lead.status ?? "moi" },
        },
        "Created At": {
          date: { start: lead.createdAt.toISOString() },
        },
        "Internal ID": {
          number: lead.id,
        },
      },
    });

    // Update sync status in DB
    await db.update(leadsTable).set({
      syncedToNotion: true,
      notionPageId: response.id,
      notionSyncedAt: new Date(),
      syncError: null,
      updatedAt: new Date(),
    }).where(eq(leadsTable.id, lead.id));

    console.log(`[notion] Synced lead ${lead.id} → Notion page ${response.id}`);
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[notion] Failed to sync lead ${lead.id}:`, message);

    await db.update(leadsTable).set({
      syncError: `notion: ${message}`,
      updatedAt: new Date(),
    }).where(eq(leadsTable.id, lead.id)).catch(() => {});

    return false;
  }
}

/**
 * Retry all un-synced leads (for background retry jobs).
 * Only runs if Notion sync is enabled.
 */
export async function retryFailedNotionSyncs(): Promise<void> {
  if (!ENABLED) return;

  const unsynced = await db
    .select()
    .from(leadsTable)
    .where(eq(leadsTable.syncedToNotion, false))
    .limit(50);

  for (const lead of unsynced) {
    await syncLeadToNotion(lead);
  }
}
