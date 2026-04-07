import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { objClient, OBJECT_PREFIX, mimeTypeForPath } from "./lib/storage";

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
      : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images from Replit Object Storage (persistent across deployments).
// Path: /api/uploads/<relativePath>  →  GCS object: uploads/<relativePath>
app.use("/api/uploads", async (req, res) => {
  try {
    const objectName = `${OBJECT_PREFIX}${req.path}`;
    const result = await objClient.downloadAsBytes(objectName);
    if (!result.ok) {
      res.status(404).end();
      return;
    }
    // @google-cloud/storage .download() returns [Buffer], so result.value is [Buffer]
    const buf = Array.isArray(result.value) ? result.value[0] : result.value;
    const mime = mimeTypeForPath(req.path);
    res.setHeader("Content-Type", mime);
    res.setHeader("Cache-Control", "public, max-age=86400, stale-while-revalidate=3600");
    res.setHeader("ETag", `"${Buffer.from(objectName).toString("base64").slice(0, 16)}"`);
    res.end(buf);
  } catch {
    res.status(404).end();
  }
});

app.use("/api", router);

export default app;
