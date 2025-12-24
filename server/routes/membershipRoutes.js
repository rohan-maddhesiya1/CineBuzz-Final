import express from "express";
import { authenticateToken } from "../middleware/auth.js";

import { 
  getPlans,
  purchasePlan,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getStatus
} from "../controllers/membershipController.js";

const router = express.Router();

router.get("/plans", getPlans);
router.post("/create-order", authenticateToken, createRazorpayOrder);
router.post("/verify-payment", authenticateToken, verifyRazorpayPayment);
router.get("/status", authenticateToken, getStatus);
router.post("/purchase", authenticateToken, purchasePlan);

export default router;
