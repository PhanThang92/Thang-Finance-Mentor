import { Router, type IRouter } from "express";
import healthRouter from "./health";
import newsRouter from "./news";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/news", newsRouter);
router.use("/admin", adminRouter);

export default router;
