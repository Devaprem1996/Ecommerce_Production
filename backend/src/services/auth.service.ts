import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { ApiError } from "../exceptions/api-error.js";
import logger from "../logger/index.js";

export interface UserTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  /**
   * Registers a new user with credentials (email/password)
   */
  static async registerUser(data: {
    email: string;
    passwordHash: string; // Plain password passed, renamed to avoid raw password leak in variable naming
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw ApiError.conflict("User with this email already exists.");
    }

    const hashedPassword = await bcrypt.hash(data.passwordHash, 12);

    // Create user and profile in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
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

    logger.info(`User registered successfully: ${newUser.email} (${newUser.id})`);

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  /**
   * Authenticates a user with email/password
   */
  static async loginUser(email: string, passwordHash: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    if (!user.passwordHash) {
      // Registered via OAuth but trying to login via password
      throw ApiError.unauthorized("Please login using Google authentication.");
    }

    const isPasswordValid = await bcrypt.compare(passwordHash, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized("Invalid email or password.");
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Authenticates a user via Google OAuth ID Token
   */
  static async loginWithGoogle(idToken: string) {
    let payload: any;
    try {
      // Call Google's tokeninfo API to verify the ID token.
      // This is a robust, dependency-free method suitable for Node.js environments.
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (!response.ok) {
        throw new Error("Failed to verify Google token with API");
      }
      payload = await response.json();
    } catch (error) {
      logger.error("Google token verification failed:", error);
      throw ApiError.unauthorized("Invalid Google ID token.");
    }

    const { email, sub: googleId, given_name: firstName, family_name: lastName, picture: avatarUrl } = payload;

    if (!email) {
      throw ApiError.unauthorized("Email not provided by Google account.");
    }

    // Upsert User and Profile in a database transaction
    const user = await prisma.$transaction(async (tx) => {
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
      } else {
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

    logger.info(`Google login successful: ${user.email} (${user.id})`);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Generates Access Token and Refresh Token pair
   */
  static generateTokens(payload: UserTokenPayload) {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  /**
   * Verifies Access Token
   */
  static verifyAccessToken(token: string): UserTokenPayload {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!) as UserTokenPayload;
    } catch (error) {
      throw ApiError.unauthorized("Invalid or expired access token.");
    }
  }

  /**
   * Verifies Refresh Token
   */
  static verifyRefreshToken(token: string): UserTokenPayload {
    try {
      return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as UserTokenPayload;
    } catch (error) {
      throw ApiError.unauthorized("Invalid or expired refresh token.");
    }
  }
}
