"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingService = void 0;
const db_js_1 = __importDefault(require("../config/db.js"));
const api_error_js_1 = require("../exceptions/api-error.js");
const index_js_1 = __importDefault(require("../logger/index.js"));
class ShippingService {
    /**
     * Check pincode serviceability and return estimated shipping cost & delivery timeline
     */
    static async checkPincode(pincode, orderSubtotal = 0) {
        if (!pincode || pincode.trim().length !== 6) {
            throw api_error_js_1.ApiError.badRequest("Invalid pincode format. Please provide a 6-digit Indian pincode.");
        }
        const record = await db_js_1.default.pincode.findUnique({
            where: { pincode: pincode.trim() },
        });
        if (!record || !record.available) {
            return {
                serviceable: false,
                pincode: pincode.trim(),
                message: "Delivery is currently unavailable for this pincode.",
            };
        }
        const freeThreshold = Number(record.freeDeliveryThreshold);
        const standardCharge = Number(record.shippingCharge);
        // Calculate shipping charge based on order subtotal threshold
        const shippingCharge = orderSubtotal >= freeThreshold ? 0 : standardCharge;
        index_js_1.default.info(`Pincode check: ${pincode} - Serviceable (${record.city}, ${record.state})`);
        return {
            serviceable: true,
            pincode: record.pincode,
            city: record.city,
            state: record.state,
            estimatedDays: record.estimatedDays,
            shippingCharge,
            freeDeliveryThreshold: freeThreshold,
            isFreeDelivery: shippingCharge === 0,
        };
    }
    /**
     * List all serviceable pincodes (admin function)
     */
    static async listPincodes() {
        return await db_js_1.default.pincode.findMany({
            orderBy: { pincode: "asc" },
        });
    }
}
exports.ShippingService = ShippingService;
