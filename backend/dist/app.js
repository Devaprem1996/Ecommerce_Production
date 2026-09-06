"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const error_middleware_js_1 = require("./middleware/error.middleware.js");
const db_js_1 = __importDefault(require("./config/db.js"));
const index_js_1 = __importDefault(require("./logger/index.js"));
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const cms_routes_js_1 = __importDefault(require("./routes/cms.routes.js"));
const payment_routes_js_1 = __importDefault(require("./routes/payment.routes.js"));
const shipping_routes_js_1 = __importDefault(require("./routes/shipping.routes.js"));
const app = (0, express_1.default)();
// Trust proxy header from local Next.js proxy
app.set("trust proxy", 1);
// Apply security headers
app.use((0, helmet_1.default)());
// Cross-Origin Resource Sharing
const whitelist = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ["http://localhost:3000"];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Blocked by CORS policy."));
        }
    },
    credentials: true,
}));
// Payload size limits & parsing
app.use(express_1.default.json({ limit: "5mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "5mb" }));
app.use((0, cookie_parser_1.default)());
// Generate requestId for audit tracking
app.use((req, res, next) => {
    const requestId = crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 9);
    req.headers["x-request-id"] = requestId;
    next();
});
// Logging request lifecycle
app.use((req, res, next) => {
    index_js_1.default.info(`Request Recieved: ${req.method} ${req.path}`);
    next();
});
// Rate limiting (max 100 requests per 15 minutes per IP)
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api/", apiLimiter);
// Authentication API routes
app.use("/api/v1/auth", auth_routes_js_1.default);
// Product & Category CMS API routes
app.use("/api/v1/cms", cms_routes_js_1.default);
// Payment Gateway API routes
app.use("/api/v1/payments", payment_routes_js_1.default);
// Shipping & Pincode API routes
app.use("/api/v1/shipping", shipping_routes_js_1.default);
// Health check endpoint
app.get("/api/v1/health", async (req, res, next) => {
    try {
        // Basic SELECT 1 query check
        await db_js_1.default.$queryRaw `SELECT 1`;
        return res.status(200).json({
            success: true,
            message: "Server is healthy.",
            database: "connected",
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        index_js_1.default.error("Health check failed:", error);
        return res.status(500).json({
            success: false,
            message: "Server database connection failed.",
            database: "disconnected",
            timestamp: new Date().toISOString(),
        });
    }
});
// Global error handler
app.use(error_middleware_js_1.errorMiddleware);
exports.default = app;
