import { Router } from "express";
import { db, contactWidgetSettingsTable, contactChannelsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router = Router();

/* ── GET /api/contact/widget ─────────────────────────────────────────
   Public endpoint — returns widget config + enabled channels.
   No auth required.                                                    */
router.get("/widget", async (_req, res) => {
  try {
    const [settings] = await db
      .select()
      .from(contactWidgetSettingsTable)
      .limit(1);

    if (!settings || !settings.isEnabled) {
      res.json({ enabled: false, settings: null, channels: [] });
      return;
    }

    const channels = await db
      .select()
      .from(contactChannelsTable)
      .where(eq(contactChannelsTable.isEnabled, true))
      .orderBy(asc(contactChannelsTable.displayOrder));

    res.json({ enabled: true, settings, channels });
  } catch (e) {
    console.error("[contact/widget]", e);
    res.json({ enabled: false, settings: null, channels: [] });
  }
});

export default router;
