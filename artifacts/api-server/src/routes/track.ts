import { Router } from "express";
import { db, analyticsEventsTable } from "@workspace/db";

const router = Router();

router.post("/track", async (req, res) => {
  try {
    const {
      event_type, entity_type, entity_slug, event_label,
      page_path, referrer, session_id, visitor_id, metadata,
    } = req.body as Record<string, unknown>;

    if (!event_type || typeof event_type !== "string") {
      res.status(400).json({ error: "event_type required" });
      return;
    }

    await db.insert(analyticsEventsTable).values({
      eventType:  event_type,
      entityType: typeof entity_type === "string" ? entity_type : null,
      entitySlug: typeof entity_slug === "string" ? entity_slug : null,
      eventLabel: typeof event_label === "string" ? event_label : null,
      pagePath:   typeof page_path   === "string" ? page_path   : null,
      referrer:   typeof referrer    === "string" ? referrer    : null,
      sessionId:  typeof session_id  === "string" ? session_id  : null,
      visitorId:  typeof visitor_id  === "string" ? visitor_id  : null,
      metadata:   metadata && typeof metadata === "object" ? metadata as Record<string, unknown> : null,
    });

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
