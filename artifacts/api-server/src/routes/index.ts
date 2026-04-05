import { Router, type IRouter } from "express";
import healthRouter from "./health";
import newsRouter from "./news";
import adminRouter from "./admin";
import leadsRouter from "./leads";
import contentRouter from "./content";
import trackRouter from "./track";
import emailPublicRouter from "./emailPublic";
import emailAdminRouter from "./emailAdmin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/news", newsRouter);
router.use("/admin", adminRouter);
router.use("/admin/email", emailAdminRouter);
router.use("/email", emailPublicRouter);
router.use("/leads", leadsRouter);
router.use("/content", contentRouter);
router.use(trackRouter);

export default router;
