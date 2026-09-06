"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_js_1 = require("../services/auth.service.js");
const db_js_1 = __importDefault(require("../config/db.js"));
const api_error_js_1 = require("../exceptions/api-error.js");
const isProduction = process.env.NODE_ENV === "production";
const COOKIE_NAME = "refreshToken";
const getCookieOptions = () => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "strict" : "lax"),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/v1/auth/refresh", // Restrict token transmission path
});
class AuthController {
    /**
     * Register local user
     */
    static async register(req, res, next) {
        try {
            const { email, password, firstName, lastName, phone } = req.body;
            const user = await auth_service_js_1.AuthService.registerUser({
                email,
                passwordHash: password, // AuthService handles hashing
                firstName,
                lastName,
                phone,
            });
            return res.status(201).json({
                success: true,
                message: "User registered successfully.",
                data: { user },
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Login local user
     */
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const user = await auth_service_js_1.AuthService.loginUser(email, password);
            const { accessToken, refreshToken } = auth_service_js_1.AuthService.generateTokens({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            // Write refresh token into secure httpOnly cookie
            res.cookie(COOKIE_NAME, refreshToken, getCookieOptions());
            return res.status(200).json({
                success: true,
                message: "Logged in successfully.",
                data: {
                    accessToken,
                    user,
                },
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Login/Signup via Google OAuth
     */
    static async googleLogin(req, res, next) {
        try {
            const { idToken } = req.body;
            const user = await auth_service_js_1.AuthService.loginWithGoogle(idToken);
            const { accessToken, refreshToken } = auth_service_js_1.AuthService.generateTokens({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            // Write refresh token into secure httpOnly cookie
            res.cookie(COOKIE_NAME, refreshToken, getCookieOptions());
            return res.status(200).json({
                success: true,
                message: "Logged in with Google successfully.",
                data: {
                    accessToken,
                    user,
                },
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Rotate access and refresh tokens
     */
    static async refresh(req, res, next) {
        try {
            const token = req.cookies[COOKIE_NAME];
            if (!token) {
                throw api_error_js_1.ApiError.unauthorized("Session expired or refresh token missing.");
            }
            const decoded = auth_service_js_1.AuthService.verifyRefreshToken(token);
            // Verify user remains active in database
            const user = await db_js_1.default.user.findUnique({
                where: { id: decoded.userId },
            });
            if (!user || !user.isActive) {
                throw api_error_js_1.ApiError.unauthorized("User account is inactive or deleted.");
            }
            // Generate new rotated double token set
            const { accessToken, refreshToken: newRefreshToken } = auth_service_js_1.AuthService.generateTokens({
                userId: user.id,
                email: user.email,
                role: user.role,
            });
            // Write new refresh token into cookie
            res.cookie(COOKIE_NAME, newRefreshToken, getCookieOptions());
            const { passwordHash: _, ...userWithoutPassword } = user;
            return res.status(200).json({
                success: true,
                message: "Token refreshed successfully.",
                data: {
                    accessToken,
                    user: userWithoutPassword,
                },
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Log out user by clearing cookie
     */
    static async logout(req, res, next) {
        try {
            // Clear HTTP-only cookie by setting expiration to 0 on the exact same path
            res.clearCookie(COOKIE_NAME, {
                path: "/api/v1/auth/refresh",
                httpOnly: true,
                secure: isProduction,
                sameSite: (isProduction ? "strict" : "lax"),
            });
            return res.status(200).json({
                success: true,
                message: "Logged out successfully.",
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Fetch current authenticated user's profile info
     */
    static async me(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                throw api_error_js_1.ApiError.unauthorized("Not authenticated.");
            }
            const user = await db_js_1.default.user.findUnique({
                where: { id: userId },
                include: {
                    profile: true,
                    addresses: {
                        where: { deletedAt: null },
                    },
                },
            });
            if (!user || !user.isActive) {
                throw api_error_js_1.ApiError.unauthorized("User session invalid.");
            }
            const { passwordHash: _, ...userWithoutPassword } = user;
            return res.status(200).json({
                success: true,
                message: "User profile fetched successfully.",
                data: { user: userWithoutPassword },
                timestamp: new Date().toISOString(),
                requestId: req.headers["x-request-id"],
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
