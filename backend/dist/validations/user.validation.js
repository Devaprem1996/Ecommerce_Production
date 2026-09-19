"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOrderSchema = exports.updateAddressSchema = exports.createAddressSchema = exports.wishlistSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().trim().min(1, "First name cannot be empty").max(50).optional(),
        lastName: zod_1.z.string().trim().max(50).optional().default(""),
        phone: zod_1.z.string().trim().max(20).optional().nullable(),
        dateOfBirth: zod_1.z.string().optional().nullable(),
        gender: zod_1.z.string().trim().max(20).optional().nullable(),
        avatarUrl: zod_1.z.string().trim().optional().nullable(),
    }),
});
exports.wishlistSchema = zod_1.z.object({
    body: zod_1.z.object({
        productId: zod_1.z.string().min(1, "Product ID is required"),
    }),
});
exports.createAddressSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z.string().trim().min(2, "Full name is required").max(100),
        phone: zod_1.z.string().trim().min(10, "Valid 10-digit phone number is required").max(15),
        addressLine1: zod_1.z.string().trim().min(3, "Address line 1 is required").max(200),
        addressLine2: zod_1.z.string().trim().max(200).optional().nullable(),
        city: zod_1.z.string().trim().min(2, "City is required").max(100),
        state: zod_1.z.string().trim().min(2, "State is required").max(100),
        postalCode: zod_1.z.string().trim().min(4, "Valid postal code is required").max(10),
        country: zod_1.z.string().trim().default("India").optional(),
        landmark: zod_1.z.string().trim().max(150).optional().nullable(),
        isDefault: zod_1.z.boolean().optional().default(false),
    }),
});
exports.updateAddressSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z.string().trim().min(2).max(100).optional(),
        phone: zod_1.z.string().trim().min(10).max(15).optional(),
        addressLine1: zod_1.z.string().trim().min(3).max(200).optional(),
        addressLine2: zod_1.z.string().trim().max(200).optional().nullable(),
        city: zod_1.z.string().trim().min(2).max(100).optional(),
        state: zod_1.z.string().trim().min(2).max(100).optional(),
        postalCode: zod_1.z.string().trim().min(4).max(10).optional(),
        country: zod_1.z.string().trim().optional(),
        landmark: zod_1.z.string().trim().max(150).optional().nullable(),
        isDefault: zod_1.z.boolean().optional(),
    }),
});
exports.createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        addressId: zod_1.z.string().optional(),
        shippingAddress: zod_1.z
            .object({
            name: zod_1.z.string().min(2),
            mobile: zod_1.z.string().min(10),
            addressLine1: zod_1.z.string().min(3),
            addressLine2: zod_1.z.string().optional().nullable(),
            city: zod_1.z.string().min(2),
            state: zod_1.z.string().min(2),
            pincode: zod_1.z.string().min(4),
        })
            .optional(),
        items: zod_1.z
            .array(zod_1.z.object({
            productId: zod_1.z.string().optional(),
            variantId: zod_1.z.string().optional(),
            productName: zod_1.z.string().optional(),
            price: zod_1.z.number().nonnegative().optional(),
            quantity: zod_1.z.number().int().positive().default(1),
        }))
            .min(1, "At least one item is required in the order"),
        paymentMethod: zod_1.z.string().default("upi"),
        couponCode: zod_1.z.string().optional(),
    }),
});
