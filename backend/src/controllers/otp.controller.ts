import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { SmsService } from "../services/sms.service.js";
import { AuthService } from "../services/auth.service.js";
import { ApiError } from "../exceptions/api-error.js";
import logger from "../logger/index.js";

const isProduction = process.env.NODE_ENV === "production";
const COOKIE_NAME = "refreshToken";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: (isProduction ? "strict" : "lax") as "strict" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/api/v1/auth/refresh",
});

export class OtpController {
  /**
   * POST /api/v1/auth/otp/send
   * Generate & send a 6-digit OTP to mobile
   */
  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, purpose = "CHECKOUT" } = req.body;
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);

      // Check for flood protection (must wait at least 30s before generating another)
      const recentOtp = await prisma.otpVerification.findFirst({
        where: {
          phone: cleanPhone,
          purpose,
          createdAt: {
            gt: new Date(Date.now() - 30 * 1000), // Within last 30s
          },
        },
      });

      if (recentOtp) {
        throw ApiError.badRequest("Please wait 30 seconds before requesting another OTP.");
      }

      // Generate secure 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpHash = await bcrypt.hash(otp, 10);

      // Invalidate existing unused OTPs for this phone & purpose
      await prisma.otpVerification.deleteMany({
        where: {
          phone: cleanPhone,
          purpose,
          isVerified: false,
        },
      });

      // Store in database with 5-minute expiry
      await prisma.otpVerification.create({
        data: {
          phone: cleanPhone,
          otpHash,
          purpose,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      // Dispatch SMS
      await SmsService.sendOtp({
        phone: cleanPhone,
        otp,
        purpose,
      });

      return res.status(200).json({
        success: true,
        message: `OTP sent successfully to +91 ${cleanPhone}.`,
        resendAfterSeconds: 30,
        devOtp: !isProduction ? otp : undefined,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/otp/verify
   * Verify entered OTP and generate authentication session
   */
  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, otp, purpose = "CHECKOUT", name, email } = req.body;
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);

      // Find active verification record
      const otpRecord = await prisma.otpVerification.findFirst({
        where: {
          phone: cleanPhone,
          purpose,
          isVerified: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
      });

      if (!otpRecord) {
        throw ApiError.badRequest("Verification code expired or not found. Please request a new OTP.");
      }

      if (otpRecord.attempts >= 5) {
        throw ApiError.badRequest("Maximum verification attempts exceeded. Please request a new OTP.");
      }

      // Verify OTP hash
      const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
      if (!isValid) {
        await prisma.otpVerification.update({
          where: { id: otpRecord.id },
          data: { attempts: { increment: 1 } },
        });
        throw ApiError.badRequest("Invalid verification code. Please check and try again.");
      }

      // Mark OTP as verified
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { isVerified: true },
      });

      // If purpose is ORDER_TRACKING only, return success without logging in
      if (purpose === "ORDER_TRACKING") {
        return res.status(200).json({
          success: true,
          message: "Mobile number verified successfully.",
          data: {
            phone: cleanPhone,
            verified: true,
          },
        });
      }

      // For CHECKOUT or LOGIN: find or create User record
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: cleanPhone },
            ...(email ? [{ email: email.trim().toLowerCase() }] : []),
          ],
        },
        include: { profile: true },
      });

      if (!user) {
        // Create lightweight phone-verified user (isGuest if checkout)
        user = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              phone: cleanPhone,
              email: email ? email.trim().toLowerCase() : `guest_${cleanPhone}@customer.yathu.local`,
              role: "CUSTOMER",
              isGuest: purpose === "CHECKOUT",
              isVerified: true,
              lastLoginAt: new Date(),
            },
          });

          await tx.userProfile.create({
            data: {
              userId: newUser.id,
              firstName: name || "Customer",
              lastName: "",
              phone: cleanPhone,
            },
          });

          return (await tx.user.findUnique({
            where: { id: newUser.id },
            include: { profile: true },
          })) as any;
        });

        if (!user) {
          throw ApiError.internal("Failed to provision guest user.");
        }

        logger.info(`Provisioned guest customer: +91${cleanPhone} (${user.id})`);
      } else {
        // Update user phone / login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: {
            phone: user.phone || cleanPhone,
            isVerified: true,
            lastLoginAt: new Date(),
          },
        });
      }

      if (!user) {
        throw ApiError.internal("User account not accessible.");
      }

      // Generate JWT Access & Refresh Token
      const { accessToken, refreshToken } = AuthService.generateTokens({
        userId: user.id,
        email: user.email || `phone_${cleanPhone}`,
        role: user.role,
      });

      // Write refresh token into secure cookie
      res.cookie(COOKIE_NAME, refreshToken, getCookieOptions());

      const userProfile = (user as any).profile;
      const displayName =
        userProfile?.firstName ||
        (user.email ? user.email.split("@")[0] : `Customer ${cleanPhone.slice(-4)}`);

      const { passwordHash: _, ...userWithoutPassword } = user as any;

      return res.status(200).json({
        success: true,
        message: "Mobile verified successfully.",
        data: {
          accessToken,
          user: {
            ...userWithoutPassword,
            name: displayName,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
