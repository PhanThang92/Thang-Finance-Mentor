import { Router, type IRouter } from "express";
import healthRouter from "./health";
import newsRouter from "./news";
import adminRouter from "./admin";
import resourcesRouter from "./resources";
import adminResourcesRouter from "./adminResources";
import leadsRouter from "./leads";
import contentRouter from "./content";
import trackRouter from "./track";
import emailPublicRouter from "./emailPublic";
import emailAdminRouter from "./emailAdmin";
import contactRouter from "./contact";
import { db, siteSettingsTable } from "../lib/db/index.js";

const router: IRouter = Router();

const LOGO_KEYS = [
  "logo_light_bg", "logo_dark_bg", "logo_accent",
  "logo_icon", "logo_icon_dark", "logo_watermark",
  "logo_display_name", "logo_brand_name", "logo_desktop_width", "logo_mobile_width",
];

/* Keys that must never be exposed publicly */
const PRIVATE_KEYS = new Set(["form_recipient_email"]);

router.get("/logo-settings", async (_req, res) => {
  try {
    const rows = await db.select().from(siteSettingsTable);
    const settings: Record<string, string | null> = {};
    rows.forEach((r) => {
      if (LOGO_KEYS.includes(r.key)) settings[r.key] = r.value;
    });
    res.json({ settings });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* Public site-settings — returns all non-sensitive settings */
router.get("/site-settings", async (_req, res) => {
  try {
    const rows = await db.select().from(siteSettingsTable);
    const settings: Record<string, string | null> = {};
    rows.forEach((r) => {
      if (!PRIVATE_KEYS.has(r.key)) settings[r.key] = r.value;
    });
    res.json({ settings });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.use(healthRouter);
router.use("/news", newsRouter);
router.use("/admin", adminRouter);
router.use("/admin/email", emailAdminRouter);
router.use("/email", emailPublicRouter);
router.use("/leads", leadsRouter);
router.use("/content", contentRouter);
router.use("/resources", resourcesRouter);
router.use("/admin/resources", adminResourcesRouter);
router.use("/contact", contactRouter);
router.use(trackRouter);

export default router;
