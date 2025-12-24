import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  show: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Show" },
  amount: { type: Number, required: true },
  bookedSeats: { type: [String], required: true },
  isPaid: { type: Boolean, default: false },

  paymentId: { type: String },       // Razorpay payment id
  orderId: { type: String },         // Razorpay order id (optional)

}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
