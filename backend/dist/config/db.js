"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const index_js_1 = __importDefault(require("../logger/index.js"));
const prisma = new client_1.PrismaClient({
    log: [
        { level: "query", emit: "event" },
        { level: "error", emit: "stdout" },
        { level: "info", emit: "stdout" },
        { level: "warn", emit: "stdout" },
    ],
});
// Log database queries in development environment
if (process.env.NODE_ENV !== "production") {
    prisma.$on("query", (e) => {
        index_js_1.default.debug(`Query: ${e.query} -- Params: ${e.params} -- Duration: ${e.duration}ms`);
    });
}
exports.default = prisma;
