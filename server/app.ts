import path from "path";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { UPLOAD_DIR } from "./lib/storage";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

const allowedOrigins = process.env.ALLOWED_ORIGINS;
app.use(
  cors({
    origin: allowedOrigins
      ? allowedOrigins.split(",").map((o) => o.trim())
      : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve uploaded files from local filesystem ────────────────────────────
// Path: /api/uploads/<relativePath>  →  <UPLOAD_DIR>/<relativePath>
// Files are stored in uploads/orig/, uploads/disp/, uploads/thumb/
app.use(
  "/api/uploads",
  express.static(UPLOAD_DIR, {
    maxAge:       "7d",
    etag:         true,
    lastModified: true,
    index:        false,
    setHeaders(res) {
      res.setHeader("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
    },
  })
);

// ── Fallback: directory index for /api/uploads/ (returns JSON listing) ────
// Used by admin media browser to see what's on disk
app.get("/api/uploads", (_req, res) => {
  res.redirect("/api/admin/media/disk");
});

app.use("/api", router);

export default app;
