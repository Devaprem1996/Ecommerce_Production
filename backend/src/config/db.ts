import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
import { PrismaClient } from "@prisma/client";
import logger from "../logger/index.js";

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

// Auto-wake retry extension for Neon Serverless cold starts
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
            error?.name === "PrismaClientInitializationError";

          if (isConnectionError) {
            logger.warn(
              `[Neon DB Auto-Wakeup] Waking up serverless compute for ${model}.${operation}, retrying query in 1.5s...`
            );
            await new Promise((resolve) => setTimeout(resolve, 1500));
            return await query(args);
          }
          throw error;
        }
      },
    },
  },
});

export default prisma;
