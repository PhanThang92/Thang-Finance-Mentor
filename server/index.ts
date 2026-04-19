import app from "./app";
import { logger } from "./lib/logger";
import { startSequenceWorker } from "./services/sequenceWorker.js";
import { startSyncRetryWorker } from "./services/syncRetryWorker.js";

// PORT: Passenger sets this automatically; API_PORT is the fallback from .env
const port = Number(process.env["API_PORT"] ?? process.env["PORT"] ?? 8080);

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "API server listening");
  startSequenceWorker();
  startSyncRetryWorker();
});
