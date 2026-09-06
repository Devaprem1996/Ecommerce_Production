"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = errorMiddleware;
const api_error_js_1 = require("../exceptions/api-error.js");
const index_js_1 = __importDefault(require("../logger/index.js"));
function errorMiddleware(err, req, res, next) {
    const timestamp = new Date().toISOString();
    const requestId = req.headers["x-request-id"] ?? "N/A";
    if (err instanceof api_error_js_1.ApiError) {
        index_js_1.default.warn({
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
    // Handle default unhandled exceptions
    index_js_1.default.error({
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
