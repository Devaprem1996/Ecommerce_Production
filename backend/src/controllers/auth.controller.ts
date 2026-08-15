import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import prisma from "../config/db.js";
import { ApiError } from "../exceptions/api-error.js";

const isProduction = process.env.NODE_ENV === "production";

const COOKIE_NAME = "refreshToken";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "strict" : "lax") as "strict" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/api/v1/auth/refresh", // Restrict token transmission path
});

export class AuthController {
  /**
   * Register local user
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, phone } = req.body;
      const user = await AuthService.registerUser({
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login local user
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const user = await AuthService.loginUser(email, password);
      
      const { accessToken, refreshToken } = AuthService.generateTokens({
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login/Signup via Google OAuth
   */
  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { idToken } = req.body;
      const user = await AuthService.loginWithGoogle(idToken);

      const { accessToken, refreshToken } = AuthService.generateTokens({
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rotate access and refresh tokens
   */
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies[COOKIE_NAME];
      if (!token) {
        throw ApiError.unauthorized("Session expired or refresh token missing.");
      }

      const decoded = AuthService.verifyRefreshToken(token);

      // Verify user remains active in database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        throw ApiError.unauthorized("User account is inactive or deleted.");
      }

      // Generate new rotated double token set
      const { accessToken, refreshToken: newRefreshToken } = AuthService.generateTokens({
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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Log out user by clearing cookie
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Clear HTTP-only cookie by setting expiration to 0 on the exact same path
      res.clearCookie(COOKIE_NAME, {
        path: "/api/v1/auth/refresh",
        httpOnly: true,
        secure: isProduction,
        sameSite: (isProduction ? "strict" : "lax") as "strict" | "lax",
      });

      return res.status(200).json({
        success: true,
        message: "Logged out successfully.",
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch current authenticated user's profile info
   */
  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw ApiError.unauthorized("Not authenticated.");
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          addresses: {
            where: { deletedAt: null },
          },
        },
      });

      if (!user || !user.isActive) {
        throw ApiError.unauthorized("User session invalid.");
      }

      const { passwordHash: _, ...userWithoutPassword } = user;

      return res.status(200).json({
        success: true,
        message: "User profile fetched successfully.",
        data: { user: userWithoutPassword },
        timestamp: new Date().toISOString(),
        requestId: req.headers["x-request-id"],
      });
    } catch (error) {
      next(error);
    }
  }
}
