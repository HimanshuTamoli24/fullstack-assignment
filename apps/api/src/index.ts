import http from "node:http";
import { logger } from "@repo/logger";
import { app as expressApplication } from "./server";

import { env } from "@repo/env";

import { connectDB } from "@repo/database";

async function init() {
  try {
    await connectDB();
    const server = http.createServer(expressApplication);
    const PORT: number = env.PORT ? +env.PORT : 8000;
    server.listen(PORT, () => {
      logger.info(` TaskFlow API Server is running on http://localhost:${PORT}`);
      logger.info(` Interactive OpenAPI Docs at http://localhost:${PORT}/docs`);
    });
  } catch (err) {
    logger.error(`Error creating http server`, { err });
    process.exit(1);
  }
}

init();
