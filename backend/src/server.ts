import "./instrument.js";
import "dotenv/config";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import type { Socket } from "node:net";
import app, { setServerShuttingDown } from "./app.js";
import logger from "./logger/index.js";
import { disconnectDb } from "./config/db.js";
import { Sentry } from "./instrument.js";

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  logger.info(`Server successfully started on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
});

// Track open sockets for safe connection draining
const openSockets = new Set<Socket>();
server.on("connection", (socket: Socket) => {
  openSockets.add(socket);
  socket.on("close", () => {
    openSockets.delete(socket);
  });
});

let isShuttingDown = false;

// Production Graceful Shutdown Handling
const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  setServerShuttingDown(true);

  logger.info(`[Shutdown] Received ${signal}. Initiating graceful shutdown...`);

  // Force termination fallback if in-flight requests fail to finish in 10s
  const forceTimer = setTimeout(() => {
    logger.error("[Shutdown] Forcefully terminating process after 10s timeout.");
    process.exit(1);
  }, 10000);
  forceTimer.unref();

  // 1. Stop accepting new HTTP requests
  server.close(async (err) => {
    if (err) {
      logger.error("[Shutdown] Error during server.close():", err);
    } else {
      logger.info("[Shutdown] HTTP server closed to new connections.");
    }

    // 2. Disconnect Prisma client cleanly
    try {
      await disconnectDb();
    } catch (dbErr) {
      logger.error("[Shutdown] Error disconnecting database:", dbErr);
    }

    // 3. Flush Sentry events
    try {
      await Sentry.flush(2000);
    } catch (sentryErr) {
      logger.error("[Shutdown] Error flushing Sentry:", sentryErr);
    }

    logger.info("[Shutdown] Graceful shutdown completed cleanly.");
    clearTimeout(forceTimer);
    process.exit(0);
  });

  // Close idle keep-alive connections
  for (const socket of openSockets) {
    // If the socket has no active request, destroy it
    socket.end();
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Global unhandled error handlers
process.on("unhandledRejection", (reason: any) => {
  logger.error("[Process] Unhandled Rejection at Promise:", reason);
  Sentry.captureException(reason);
});

process.on("uncaughtException", (error: Error) => {
  logger.error("[Process] Uncaught Exception:", error);
  Sentry.captureException(error);
  // Give Sentry 1 second to flush, then terminate
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});
