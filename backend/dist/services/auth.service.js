"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_js_1 = __importDefault(require("../config/db.js"));
const api_error_js_1 = require("../exceptions/api-error.js");
const index_js_1 = __importDefault(require("../logger/index.js"));
class AuthService {
    /**
     * Registers a new user with credentials (email/password)
     */
    static async registerUser(data) {
        const existingUser = await db_js_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw api_error_js_1.ApiError.conflict("User with this email already exists.");
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.passwordHash, 12);
        // Create user and profile in a transaction
        const newUser = await db_js_1.default.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email,
                    passwordHash: hashedPassword,
                    isVerified: false,
                },
            });
            await tx.userProfile.create({
                data: {
                    userId: user.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                },
            });
            return user;
        });
        index_js_1.default.info(`User registered successfully: ${newUser.email} (${newUser.id})`);
        const { passwordHash: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }
    /**
     * Authenticates a user with email/password
     */
    static async loginUser(email, passwordHash) {
        const user = await db_js_1.default.user.findUnique({
            where: { email },
        });
        if (!user || !user.isActive) {
            throw api_error_js_1.ApiError.unauthorized("Invalid email or password.");
        }
        if (!user.passwordHash) {
            // Registered via OAuth but trying to login via password
            throw api_error_js_1.ApiError.unauthorized("Please login using Google authentication.");
        }
        const isPasswordValid = await bcryptjs_1.default.compare(passwordHash, user.passwordHash);
        if (!isPasswordValid) {
            throw api_error_js_1.ApiError.unauthorized("Invalid email or password.");
        }
        // Update last login timestamp
        await db_js_1.default.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    /**
     * Authenticates a user via Google OAuth ID Token
     */
    static async loginWithGoogle(idToken) {
        let payload;
        try {
            // Call Google's tokeninfo API to verify the ID token.
            // This is a robust, dependency-free method suitable for Node.js environments.
            const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
            if (!response.ok) {
                throw new Error("Failed to verify Google token with API");
            }
            payload = await response.json();
        }
        catch (error) {
            index_js_1.default.error("Google token verification failed:", error);
            throw api_error_js_1.ApiError.unauthorized("Invalid Google ID token.");
        }
        const { email, sub: googleId, given_name: firstName, family_name: lastName, picture: avatarUrl } = payload;
        if (!email) {
            throw api_error_js_1.ApiError.unauthorized("Email not provided by Google account.");
        }
        // Upsert User and Profile in a database transaction
        const user = await db_js_1.default.$transaction(async (tx) => {
            let existingUser = await tx.user.findFirst({
                where: {
                    OR: [
                        { googleId },
                        { email }
                    ]
                }
            });
            if (existingUser) {
                // If user existed with email but no Google ID, link Google ID
                if (!existingUser.googleId) {
                    existingUser = await tx.user.update({
                        where: { id: existingUser.id },
                        data: { googleId, isVerified: true },
                    });
                }
            }
            else {
                // Create new Google user
                existingUser = await tx.user.create({
                    data: {
                        email,
                        googleId,
                        isVerified: true,
                    },
                });
                await tx.userProfile.create({
                    data: {
                        userId: existingUser.id,
                        firstName: firstName || "Google",
                        lastName: lastName || "User",
                        avatarUrl: avatarUrl || null,
                    },
                });
            }
            // Update last login timestamp
            return await tx.user.update({
                where: { id: existingUser.id },
                data: { lastLoginAt: new Date() },
            });
        });
        index_js_1.default.info(`Google login successful: ${user.email} (${user.id})`);
        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    /**
     * Generates Access Token and Refresh Token pair
     */
    static generateTokens(payload) {
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "15m",
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "7d",
        });
        return { accessToken, refreshToken };
    }
    /**
     * Verifies Access Token
     */
    static verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        }
        catch (error) {
            throw api_error_js_1.ApiError.unauthorized("Invalid or expired access token.");
        }
    }
    /**
     * Verifies Refresh Token
     */
    static verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, process.env.REFRESH_TOKEN_SECRET);
        }
        catch (error) {
            throw api_error_js_1.ApiError.unauthorized("Invalid or expired refresh token.");
        }
    }
}
exports.AuthService = AuthService;
