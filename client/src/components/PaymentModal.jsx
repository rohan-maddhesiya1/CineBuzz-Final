import React from "react";
import toast from "react-hot-toast";

const PaymentModal = ({ plan, onClose }) => {

  const handleRazorpayPayment = async () => {
    try {
      const token = localStorage.getItem("token");

      // 👉 STEP 1: Create Razorpay Order
      const res = await fetch("http://localhost:3000/api/membership/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ planType: plan.type })
      });

      const data = await res.json();

      if (!data.success) {
        toast.error("Failed to create payment order");
        return;
      }

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "CineBuzz",
        description: `${plan.type} Membership`,
        order_id: data.order.id,
        theme: {
          color: "#e50914"
        },
        handler: async function (response) {

          // 👉 STEP 2: VERIFY PAYMENT
          const verifyRes = await fetch("http://localhost:3000/api/membership/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType: plan.type
            })
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            toast.success("✅ Membership Activated Successfully!");
            onClose();
            window.location.reload();
          } else {
            toast.error("Payment verification failed");
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error(error);
      toast.error("Payment error occurred");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#111] p-8 rounded-2xl w-[400px] text-white">

        <h2 className="text-2xl font-bold mb-4 text-center">
          Confirm {plan.type} Membership
        </h2>

        <p className="text-center mb-6 text-gray-300">
          Amount: ₹{plan.price}
        </p>

        <button
          onClick={handleRazorpayPayment}
          className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition"
        >
          Pay with Razorpay
        </button>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-gray-400 hover:text-white"
        >
          Cancel
        </button>

      </div>
    </div>
  );
};

export default PaymentModal;
