import { Router } from "express";
import { db, leadsTable } from "@workspace/db";

const router = Router();

// Public lead submission (no auth required)
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, sourceType, sourcePage, productRef, message } = req.body;
    if (!name || !name.trim()) { res.status(400).json({ error: "Họ và tên là bắt buộc" }); return; }
    const [lead] = await db.insert(leadsTable).values({
      name: name.trim(), email: email?.trim() || null, phone: phone?.trim() || null,
      sourceType: sourceType || null, sourcePage: sourcePage || null,
      productRef: productRef || null, message: message?.trim() || null,
    }).returning();
    res.json({ ok: true, id: lead.id });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
