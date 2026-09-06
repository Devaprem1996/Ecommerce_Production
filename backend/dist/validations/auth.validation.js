"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLoginSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().trim().email("Invalid email address"),
        password: zod_1.z.string().min(8, "Password must be at least 8 characters long").max(100),
        firstName: zod_1.z.string().trim().min(1, "First name is required").max(50),
        lastName: zod_1.z.string().trim().min(1, "Last name is required").max(50),
        phone: zod_1.z.string().trim().optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().trim().email("Invalid email address"),
        password: zod_1.z.string().min(1, "Password is required"),
    }),
});
exports.googleLoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        idToken: zod_1.z.string().min(1, "Google ID token is required"),
    }),
});
