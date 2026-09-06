import { Router } from "express";
import { ShippingController } from "../controllers/shipping.controller.js";

const router = Router();

// Check pincode serviceability (Public)
router.get("/pincode/:pincode", ShippingController.checkPincode);

// List all pincodes (Public/Admin)
router.get("/pincodes", ShippingController.listPincodes);

export default router;
