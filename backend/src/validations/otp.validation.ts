import { z } from "zod";

export const sendOtpSchema = z.object({
  body: z.object({
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
    purpose: z
      .enum(["CHECKOUT", "LOGIN", "ORDER_TRACKING"])
      .default("CHECKOUT"),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
    otp: z
      .string()
      .trim()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only numbers"),
    purpose: z
      .enum(["CHECKOUT", "LOGIN", "ORDER_TRACKING"])
      .default("CHECKOUT"),
    name: z.string().trim().max(100).optional(),
    email: z.string().trim().email("Invalid email format").optional().nullable(),
  }),
});

export const trackByOtpSchema = z.object({
  body: z.object({
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
    otp: z
      .string()
      .trim()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^\d{6}$/, "OTP must contain only numbers"),
  }),
});
