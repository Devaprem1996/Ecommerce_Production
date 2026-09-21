"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_dns_1 = __importDefault(require("node:dns"));
node_dns_1.default.setDefaultResultOrder("ipv4first");
const client_1 = require("@prisma/client");
const index_js_1 = __importDefault(require("../logger/index.js"));
const basePrisma = new client_1.PrismaClient({
    log: [
        { level: "query", emit: "event" },
        { level: "error", emit: "stdout" },
        { level: "info", emit: "stdout" },
        { level: "warn", emit: "stdout" },
    ],
});
// Log database queries in development environment
if (process.env.NODE_ENV !== "production") {
    basePrisma.$on("query", (e) => {
        index_js_1.default.debug(`Query: ${e.query} -- Params: ${e.params} -- Duration: ${e.duration}ms`);
    });
}
// Auto-wake retry extension for Neon Serverless cold starts
const prisma = basePrisma.$extends({
    query: {
        $allModels: {
            async $allOperations({ operation, model, args, query }) {
                try {
                    return await query(args);
                }
                catch (error) {
                    const isConnectionError = error?.message?.includes("Can't reach database server") ||
                        error?.message?.includes("connection closed") ||
                        error?.message?.includes("Connection terminated") ||
                        error?.message?.includes("Connection timed out") ||
                        error?.name === "PrismaClientInitializationError";
                    if (isConnectionError) {
                        index_js_1.default.warn(`[Neon DB Auto-Wakeup] Waking up serverless compute for ${model}.${operation}, retrying query in 1.5s...`);
                        await new Promise((resolve) => setTimeout(resolve, 1500));
                        return await query(args);
                    }
                    throw error;
                }
            },
        },
    },
});
exports.default = prisma;
