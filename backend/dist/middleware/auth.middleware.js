"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireRole = requireRole;
exports.validateRequest = validateRequest;
const zod_1 = require("zod");
const auth_service_js_1 = require("../services/auth.service.js");
const api_error_js_1 = require("../exceptions/api-error.js");
/**
 * Authentication Guard Middleware
 * Restricts route access to verified JWT Access Token holders
 */
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(api_error_js_1.ApiError.unauthorized("Authentication token required."));
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = auth_service_js_1.AuthService.verifyAccessToken(token);
        req.user = decoded;
        return next();
    }
    catch (error) {
        return next(error);
    }
}
/**
 * Role Authorization Guard Middleware
 * Restricts route access to specified Roles
 */
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return next(api_error_js_1.ApiError.unauthorized("Not authenticated."));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(api_error_js_1.ApiError.forbidden("Access denied. Insufficient permissions."));
        }
        return next();
    };
}
/**
 * Request Validation Middleware using Zod Schema
 * Automatically validates request body, query, and params
 */
function validateRequest(schema) {
    return async (req, res, next) => {
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
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path.slice(1).join("."), // removes 'body' or 'query' prefix root
                    message: err.message,
                }));
                return next(api_error_js_1.ApiError.badRequest("Validation failed.", errors));
            }
            return next(error);
        }
    };
}
