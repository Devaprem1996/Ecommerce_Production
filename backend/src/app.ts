import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middleware/error.middleware.js";
import { checkDbHealth } from "./config/db.js";
import logger from "./logger/index.js";
import { Sentry } from "./instrument.js";
import { apiGlobalLimiter } from "./middleware/rate-limit.middleware.js";
import authRouter from "./routes/auth.routes.js";
import cmsRouter from "./routes/cms.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import shippingRouter from "./routes/shipping.routes.js";
import adminRouter from "./routes/admin.routes.js";
import userRouter from "./routes/user.routes.js";
import couponRouter from "./routes/coupon.routes.js";

const app = express();

// Track server shutdown state for readiness probe
let isShuttingDown = false;
export const setServerShuttingDown = (val: boolean) => {
  isShuttingDown = val;
};

// Trust proxy header from Nginx reverse proxy
app.set("trust proxy", 1);

// Apply security headers with Razorpay CDN/frame allowances
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://checkout.razorpay.com"],
        frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
        connectSrc: ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Cross-Origin Resource Sharing
const explicitWhitelist = [
  process.env.FRONTEND_URL,
  "https://yathuiyarkaiyagam.vercel.app",
  "https://yathuarokiyagam.vercel.app",
  "https://yathuarokiyagam.com",
  "https://www.yathuarokiyagam.com",
  "http://localhost",
  "http://localhost:80",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1",
  "http://127.0.0.1:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (
        explicitWhitelist.includes(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error(`Blocked by CORS policy: ${origin}`));
    },
    credentials: true,
  })
);

// Payload size limits & parsing (verify captures rawBody for cryptographic webhook signatures)
app.use(
  express.json({
    limit: "5mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// Generate requestId for audit tracking
app.use((req, res, next) => {
  const requestId = crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 9);
  req.headers["x-request-id"] = requestId;
  next();
});

// Logging request lifecycle (skip logging health checks to prevent log spam)
app.use((req, res, next) => {
  if (req.path !== "/healthz" && req.path !== "/ready" && req.path !== "/api/v1/health") {
    logger.info(`Request Received: ${req.method} ${req.path}`);
  }
  next();
});

// =================================================================
// OBSERVABILITY & HEALTH PROBES (Dedicated low-overhead endpoints)
// =================================================================

/**
 * 1. Dedicated Liveness Probe (/healthz)
 * Lightweight ping: Confirms the Node.js event loop is alive without querying the database.
 * Ideal for high-frequency container liveness probes and load balancers.
 */
app.get("/healthz", (_req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({
      status: "terminating",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  }
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    nodeEnv: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/**
 * 2. Dedicated Readiness Probe (/ready)
 * Verifies that the service is ready to accept user traffic:
 * Checks PostgreSQL connectivity and measures query response latency (< 3000ms threshold).
 */
app.get("/ready", async (_req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({
      status: "unready",
      message: "Server is in the process of shutting down.",
      timestamp: new Date().toISOString(),
    });
  }

  const dbStatus = await checkDbHealth();
  if (!dbStatus.ok || dbStatus.latencyMs > 3000) {
    logger.warn(`[Readiness Probe] Database health failed or high latency: ${dbStatus.latencyMs}ms, error: ${dbStatus.error}`);
    return res.status(503).json({
      status: "unready",
      database: "disconnected",
      latencyMs: dbStatus.latencyMs,
      error: dbStatus.error,
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(200).json({
    status: "ready",
    database: "connected",
    latencyMs: dbStatus.latencyMs,
    memoryUsageMB: Math.round(process.memoryUsage().rss / (1024 * 1024)),
    timestamp: new Date().toISOString(),
  });
});

/**
 * 3. Backward-compatible health probe (/api/v1/health)
 */
app.get("/api/v1/health", async (_req, res) => {
  const dbStatus = await checkDbHealth();
  if (!dbStatus.ok) {
    return res.status(500).json({
      success: false,
      message: "Server database connection failed.",
      database: "disconnected",
      error: dbStatus.error,
      timestamp: new Date().toISOString(),
    });
  }
  return res.status(200).json({
    success: true,
    message: "Server is healthy.",
    database: "connected",
    latencyMs: dbStatus.latencyMs,
    timestamp: new Date().toISOString(),
  });
});

// =================================================================
// REST API ROUTES & ROUTE-SPECIFIC RATE LIMITING
// =================================================================

// General API rate limiting for public browsing
app.use("/api/", apiGlobalLimiter);

// Authentication API routes (Includes dedicated auth & OTP rate limiting)
app.use("/api/v1/auth", authRouter);

// Product & Category CMS API routes
app.use("/api/v1/cms", cmsRouter);

// Payment Gateway API routes (/api/create-order, /api/verify-payment, /api/v1/payments/*)
app.use("/api", paymentRouter);
app.use("/api/v1/payments", paymentRouter);

// Shipping & Pincode API routes
app.use("/api/v1/shipping", shippingRouter);

// Admin Dashboard & Overview API routes
app.use("/api/v1/admin", adminRouter);

// Customer User Account API routes (Includes strict checkoutRateLimiter on /orders)
app.use("/api/v1/user", userRouter);

// Promotional Coupon API routes
app.use("/api/v1/coupons", couponRouter);
app.use("/api/coupons", couponRouter);

// =================================================================
// SENTRY ERROR HANDLER & GLOBAL ERROR MIDDLEWARE
// =================================================================

// Sentry setupExpressErrorHandler catches any error before our custom handler
Sentry.setupExpressErrorHandler(app);

// Global custom application error handler
app.use(errorMiddleware);

export default app;
