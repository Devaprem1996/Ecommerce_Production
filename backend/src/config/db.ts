import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
import { PrismaClient } from "@prisma/client";
import logger from "../logger/index.js";

// PrismaClient tuned for single VPS deployment (PostgreSQL on NVMe volume)
const basePrisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "error", emit: "stdout" },
    { level: "info", emit: "stdout" },
    { level: "warn", emit: "stdout" },
  ],
});

// Log database queries in development environment
if (process.env.NODE_ENV !== "production") {
  basePrisma.$on("query" as any, (e: any) => {
    logger.debug(`Query: ${e.query} -- Params: ${e.params} -- Duration: ${e.duration}ms`);
  });
}

// Resilient query retry wrapper for transient PostgreSQL connection/pool pressure
const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        try {
          return await query(args);
        } catch (error: any) {
          const isConnectionError =
            error?.message?.includes("Can't reach database server") ||
            error?.message?.includes("connection closed") ||
            error?.message?.includes("Connection terminated") ||
            error?.message?.includes("Connection timed out") ||
            error?.message?.includes("Timed out fetching a new connection from the connection pool") ||
            error?.message?.includes("connection pool") ||
            error?.name === "PrismaClientInitializationError";

          if (isConnectionError) {
            logger.warn(
              `[DB Connection / Pool Auto-Retry] Retrying ${model}.${operation} in 500ms due to connection/pool pressure: ${error?.message?.slice(0, 120)}`
            );
            await new Promise((resolve) => setTimeout(resolve, 500));
            return await query(args);
          }
          throw error;
        }
      },
    },
  },
});

/**
 * Health check helper for DB connectivity and response latency probe
 */
export async function checkDbHealth(): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    await basePrisma.$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err: any) {
    return { ok: false, latencyMs: Date.now() - start, error: err?.message || String(err) };
  }
}

/**
 * Clean disconnect for graceful shutdown
 */
export async function disconnectDb(): Promise<void> {
  try {
    await basePrisma.$disconnect();
    logger.info("[Prisma] Cleanly disconnected from PostgreSQL.");
  } catch (err) {
    logger.error("[Prisma] Error disconnecting from PostgreSQL:", err);
  }
}

export { basePrisma };
export default prisma;
