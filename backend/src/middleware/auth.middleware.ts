import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { AuthService, UserTokenPayload } from "../services/auth.service.js";
import { ApiError } from "../exceptions/api-error.js";

// Augment Express Request type globally to support req.user typing
declare global {
  namespace Express {
    interface Request {
      user?: UserTokenPayload;
    }
  }
}

/**
 * Authentication Guard Middleware
 * Restricts route access to verified JWT Access Token holders
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && (req.cookies.access_token || req.cookies.accessToken)) {
    token = req.cookies.access_token || req.cookies.accessToken;
  }

  if (!token) {
    return next(ApiError.unauthorized("Authentication token required."));
  }

  try {
    const decoded = AuthService.verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return next(error);
  }
}

/**
 * Optional Authentication Guard Middleware
 * Attaches verified JWT user payload to req.user if token is present, but does not block requests
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && (req.cookies.access_token || req.cookies.accessToken)) {
    token = req.cookies.access_token || req.cookies.accessToken;
  }

  if (token) {
    try {
      const decoded = AuthService.verifyAccessToken(token);
      req.user = decoded;
    } catch {
      // Ignore token verification errors for optional authentication
    }
  }

  return next();
}

/**
 * Role Authorization Guard Middleware
 * Restricts route access to specified Roles
 */
export function requireRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized("Not authenticated."));
    }

    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());
    const userRole = (req.user.role || "").toUpperCase();
    if (!normalizedAllowed.includes(userRole)) {
      return next(ApiError.forbidden("Access denied. Insufficient permissions."));
    }

    return next();
  };
}

/**
 * Request Validation Middleware using Zod Schema
 * Automatically validates request body, query, and params
 */
export function validateRequest(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Replace original request parts with sanitized parsed data only if specified by schema
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.slice(1).join("."), // removes 'body' or 'query' prefix root
          message: err.message,
        }));
        return next(ApiError.badRequest("Validation failed.", errors));
      }
      return next(error);
    }
  };
}
