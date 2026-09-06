"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShippingController = void 0;
const shipping_service_js_1 = require("../services/shipping.service.js");
class ShippingController {
    /**
     * Check serviceability for a given pincode
     */
    static async checkPincode(req, res, next) {
        try {
            const { pincode } = req.params;
            const subtotal = req.query.subtotal ? parseFloat(req.query.subtotal) : 0;
            const result = await shipping_service_js_1.ShippingService.checkPincode(pincode, subtotal);
            return res.status(200).json({
                success: true,
                message: "Pincode serviceability checked successfully.",
                data: result,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * List all pincodes (admin function)
     */
    static async listPincodes(req, res, next) {
        try {
            const pincodes = await shipping_service_js_1.ShippingService.listPincodes();
            return res.status(200).json({
                success: true,
                message: "Pincodes fetched successfully.",
                data: { pincodes },
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ShippingController = ShippingController;
