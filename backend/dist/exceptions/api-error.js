"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    statusCode;
    errors;
    constructor(statusCode, message, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message, errors = []) {
        return new ApiError(400, message, errors);
    }
    static unauthorized(message = "Unauthorized access.") {
        return new ApiError(401, message);
    }
    static forbidden(message = "Access denied.") {
        return new ApiError(403, message);
    }
    static notFound(message = "Resource not found.") {
        return new ApiError(404, message);
    }
    static conflict(message, errors = []) {
        return new ApiError(409, message, errors);
    }
    static internal(message = "Internal server error.") {
        return new ApiError(500, message);
    }
    static badGateway(message = "Bad gateway / upstream provider error.") {
        return new ApiError(502, message);
    }
    static serviceUnavailable(message = "Service temporarily unavailable.") {
        return new ApiError(503, message);
    }
}
exports.ApiError = ApiError;
