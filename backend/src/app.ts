import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { errorMiddleware } from "./middleware/error.middleware.js";
import prisma from "./config/db.js";
import logger from "./logger/index.js";

const app = express();

// Apply security headers
app.use(helmet());

// Cross-Origin Resource Sharing
const whitelist = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ["http://localhost:3000"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS policy."));
      }
    },
    credentials: true,
  })
);

// Payload size limits & parsing
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// Generate requestId for audit tracking
app.use((req, res, next) => {
  const requestId = crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 9);
  req.headers["x-request-id"] = requestId;
  next();
});

// Logging request lifecycle
app.use((req, res, next) => {
  logger.info(`Request Recieved: ${req.method} ${req.path}`);
  next();
});

// Rate limiting (max 100 requests per 15 minutes per IP)
const apiLimiter = rateLimit({
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

// Health check endpoint
app.get("/api/v1/health", async (req, res, next) => {
  try {
    // Basic SELECT 1 query check
    await prisma.$queryRaw`SELECT 1`;
    
    return res.status(200).json({
      success: true,
      message: "Server is healthy.",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Health check failed:", error);
    return res.status(500).json({
      success: false,
      message: "Server database connection failed.",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

// Global error handler
app.use(errorMiddleware);

export default app;
