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
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Authentication token required."));
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = AuthService.verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return next(error);
  }
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

    if (!allowedRoles.includes(req.user.role)) {
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
      // Replace original request parts with sanitized parsed data
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;
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
