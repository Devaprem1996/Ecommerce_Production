"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shipping_controller_js_1 = require("../controllers/shipping.controller.js");
const router = (0, express_1.Router)();
// Check pincode serviceability (Public)
router.get("/pincode/:pincode", shipping_controller_js_1.ShippingController.checkPincode);
// List all pincodes (Public/Admin)
router.get("/pincodes", shipping_controller_js_1.ShippingController.listPincodes);
exports.default = router;
