import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { generateTicketPDF } from "../utils/generateTicketPDF.js";



const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* =========================
   Helper: Seat availability
========================= */
const checkSeatsAvailability = async (showId, selectedSeats) => {
  const showData = await Show.findById(showId);
  if (!showData) return false;

  return !selectedSeats.some(seat => showData.occupiedSeats[seat]);
};

/* =========================
   CREATE SEAT PAYMENT ORDER
========================= */
export const createSeatPaymentOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { showId, selectedSeats } = req.body;

    // 1️⃣ Seat availability check
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
    if (!isAvailable) {
      return res.json({
        success: false,
        message: "Selected seats already booked"
      });
    }

    // 2️⃣ Fetch trusted data
    const user = await User.findById(userId);
    const show = await Show.findById(showId);

    if (!user || !show) {
      return res.status(404).json({
        success: false,
        message: "Invalid booking data"
      });
    }

    // 3️⃣ Base price calculation
    const seatCount = selectedSeats.length;
    const baseAmount = show.showPrice * seatCount;

    // 4️⃣ Membership discount (SAFE)
    const membership = user.membershipType?.toUpperCase();
    let discount = 0;

    if (membership === "SILVER") discount = baseAmount * 0.05;
    if (membership === "GOLD") discount = baseAmount * 0.10;

    const finalAmount = Math.round(baseAmount - discount);

    // 5️⃣ Razorpay order (DISCOUNTED AMOUNT)
    const order = await razorpay.orders.create({
      amount: finalAmount * 100, // paise
      currency: "INR",
      receipt: `seat_${Date.now()}`
    });

    res.json({
      success: true,
      order,
      key: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error("createSeatPaymentOrder error:", error);
    res.status(500).json({
      success: false,
      message: "Order creation failed"
    });
  }
};

/* =========================
   VERIFY SEAT PAYMENT
========================= */
export const verifySeatPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      showId,
      selectedSeats
    } = req.body;

    // 1️⃣ Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    // 2️⃣ Fetch trusted data
    const show = await Show.findById(showId).populate("movie");
    const user = await User.findById(userId);

    if (!show || !user) {
      return res.status(404).json({
        success: false,
        message: "Invalid booking data"
      });
    }

    // 3️⃣ Recalculate amount (SECURITY)
    const seatCount = selectedSeats.length;
    const baseAmount = show.showPrice * seatCount;

    const membership = user.membershipType?.toUpperCase();
    let discount = 0;

    if (membership === "SILVER") discount = baseAmount * 0.05;
    if (membership === "GOLD") discount = baseAmount * 0.10;

    const finalAmount = Math.round(baseAmount - discount);

    // 4️⃣ Create booking
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: finalAmount,
      bookedSeats: selectedSeats,
      isPaid: true,
      paymentId: razorpay_payment_id
    });

    // 5️⃣ Lock seats
    selectedSeats.forEach(seat => {
      show.occupiedSeats[seat] = userId;
    });

    show.markModified("occupiedSeats");
    await show.save();

    res.json({
      success: true,
      message: "Booking successful",
      booking
    });

  } catch (error) {
    console.error("verifySeatPayment error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
   GET OCCUPIED SEATS
========================= */
export const getOccupiedSeats = async (req, res) => {
  try {
    const show = await Show.findById(req.params.showId);
    res.json({
      success: true,
      occupiedSeats: Object.keys(show.occupiedSeats)
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message
    });
  }


};
export const downloadTicketPDF = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate({
        path: "show",
        populate: { path: "movie" }
      });

    if (!booking || !booking.isPaid) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    generateTicketPDF(booking, res);

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
