import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(1, "First name cannot be empty").max(50).optional(),
    lastName: z.string().trim().min(1, "Last name cannot be empty").max(50).optional(),
    phone: z.string().trim().max(20).optional().nullable(),
    dateOfBirth: z.string().optional().nullable(),
    gender: z.string().trim().max(20).optional().nullable(),
    avatarUrl: z.string().trim().optional().nullable(),
  }),
});

export const createAddressSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, "Full name is required").max(100),
    phone: z.string().trim().min(10, "Valid 10-digit phone number is required").max(15),
    addressLine1: z.string().trim().min(3, "Address line 1 is required").max(200),
    addressLine2: z.string().trim().max(200).optional().nullable(),
    city: z.string().trim().min(2, "City is required").max(100),
    state: z.string().trim().min(2, "State is required").max(100),
    postalCode: z.string().trim().min(4, "Valid postal code is required").max(10),
    country: z.string().trim().default("India").optional(),
    landmark: z.string().trim().max(150).optional().nullable(),
    isDefault: z.boolean().optional().default(false),
  }),
});

export const updateAddressSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(100).optional(),
    phone: z.string().trim().min(10).max(15).optional(),
    addressLine1: z.string().trim().min(3).max(200).optional(),
    addressLine2: z.string().trim().max(200).optional().nullable(),
    city: z.string().trim().min(2).max(100).optional(),
    state: z.string().trim().min(2).max(100).optional(),
    postalCode: z.string().trim().min(4).max(10).optional(),
    country: z.string().trim().optional(),
    landmark: z.string().trim().max(150).optional().nullable(),
    isDefault: z.boolean().optional(),
  }),
});

export const createOrderSchema = z.object({
  body: z.object({
    addressId: z.string().optional(),
    shippingAddress: z
      .object({
        name: z.string().min(2),
        mobile: z.string().min(10),
        addressLine1: z.string().min(3),
        addressLine2: z.string().optional().nullable(),
        city: z.string().min(2),
        state: z.string().min(2),
        pincode: z.string().min(4),
      })
      .optional(),
    items: z
      .array(
        z.object({
          productId: z.string().optional(),
          variantId: z.string().optional(),
          productName: z.string().optional(),
          price: z.number().nonnegative().optional(),
          quantity: z.number().int().positive().default(1),
        })
      )
      .min(1, "At least one item is required in the order"),
    paymentMethod: z.string().default("upi"),
    couponCode: z.string().optional(),
  }),
});

