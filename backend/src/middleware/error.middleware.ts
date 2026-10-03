import { Request, Response, NextFunction } from "express";
import { ApiError } from "../exceptions/api-error.js";
import logger from "../logger/index.js";
import { Sentry } from "../instrument.js";

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const timestamp = new Date().toISOString();
  const requestId = (req.headers["x-request-id"] as string) ?? "N/A";

  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      Sentry.captureException(err, {
        extra: {
          path: req.path,
          method: req.method,
          requestId,
          statusCode: err.statusCode,
        },
      });
    }

    logger.warn({
      message: err.message,
      statusCode: err.statusCode,
      errors: err.errors,
      path: req.path,
      method: req.method,
      requestId,
    });

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      timestamp,
      requestId,
    });
  }

  // Capture all unhandled 5xx / unexpected runtime errors in Sentry
  Sentry.captureException(err, {
    extra: {
      path: req.path,
      method: req.method,
      requestId,
      stack: err.stack,
    },
  });

  // Handle default unhandled exceptions
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId,
  });

  const message = process.env.NODE_ENV === "production" 
    ? "An unexpected error occurred." 
    : err.message;

  return res.status(500).json({
    success: false,
    message,
    timestamp,
    requestId,
  });
}
