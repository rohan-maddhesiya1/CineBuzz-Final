import User from "../models/User.js";
import membershipPlans from "../utils/membershipPlans.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// ✅ Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ================== GET ALL PLANS ==================
export const getPlans = (req, res) => {
  try {
    return res.json({ success: true, plans: membershipPlans });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================== STEP 3: CREATE RAZORPAY ORDER ==================
export const createRazorpayOrder = async (req, res) => {
  try {
    const { planType } = req.body;

    const plan = membershipPlans.find(p => p.type === planType);
    if (!plan) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const options = {
      amount: plan.price * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};

// ================== ACTIVATE MEMBERSHIP ==================
export const purchasePlan = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { planType } = req.body;
    const plan = membershipPlans.find((p) => p.type === planType);

    if (!plan) {
      return res.status(400).json({ success: false, message: "Invalid plan type" });
    }

    const paymentId = `PAY-${Date.now()}`;
    const start = new Date();
    let end = new Date(start);

    // ✅ Calendar Accurate Expiry
    if (plan.type === "Gold") {
      end.setMonth(end.getMonth() + 2);
    } else if (plan.type === "Silver") {
      end.setMonth(end.getMonth() + 1);
    } else {
      end = new Date(start.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    }

    end.setUTCHours(23, 59, 59, 999);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isMember: true,
        membershipType: plan.type,
        membershipStart: start,
        membershipEnd: end,
        membershipPaymentId: paymentId
      },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Membership activated successfully",
      paymentId,
      membership: {
        membershipType: updatedUser.membershipType,
        membershipStart: updatedUser.membershipStart,
        membershipEnd: updatedUser.membershipEnd
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ================== VERIFY PAYMENT ==================
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    req.body.planType = planType;
    return purchasePlan(req, res);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Verification error" });
  }
};

// ================== STATUS ==================
export const getStatus = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId).select(
      "isMember membershipType membershipStart membershipEnd membershipPaymentId"
    );

    if (user && user.isMember && user.membershipEnd && new Date() > new Date(user.membershipEnd)) {
      user.isMember = false;
      await user.save();
    }

    return res.json({ success: true, membership: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
