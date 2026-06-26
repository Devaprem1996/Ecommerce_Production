import { PrismaClient } from "@prisma/client";
import logger from "../logger/index.js";

const prisma = new PrismaClient({
  log: [
    { level: "query", emit: "event" },
    { level: "error", emit: "stdout" },
    { level: "info", emit: "stdout" },
    { level: "warn", emit: "stdout" },
  ],
});

// Log database queries in development environment
if (process.env.NODE_ENV !== "production") {
  prisma.$on("query" as any, (e: any) => {
    logger.debug(`Query: ${e.query} -- Params: ${e.params} -- Duration: ${e.duration}ms`);
  });
}

export default prisma;
