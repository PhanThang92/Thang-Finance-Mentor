import path from "path";
import { existsSync, mkdirSync } from "fs";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
const allowedOrigins = process.env.ALLOWED_ORIGINS;
app.use(
  cors({
    origin: allowedOrigins
      ? allowedOrigins.split(",").map((o) => o.trim())
      : true, // allow all in dev; set ALLOWED_ORIGINS in production
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(process.cwd(), "uploads");
["orig", "disp"].forEach((sub) => {
  const dir = path.join(uploadsDir, sub);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
});
app.use("/api/uploads", express.static(uploadsDir, { maxAge: "1d", etag: true }));

app.use("/api", router);

export default app;
