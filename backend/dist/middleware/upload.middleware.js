"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const api_error_js_1 = require("../exceptions/api-error.js");
// Store file in memory buffer
const storage = multer_1.default.memoryStorage();
// Validate file type
const fileFilter = (req, file, callback) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
    }
    else {
        callback(api_error_js_1.ApiError.badRequest("Invalid file type. Only JPEG, JPG, PNG, and WEBP images are allowed."));
    }
};
// Expose multer upload middleware instance
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
