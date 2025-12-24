import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);

  // 🚫 Block Admin Access
  useEffect(() => {
    if (user?.role === "admin") {
      toast.error("🚫 You are not allowed to access this page!");
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // Fetch Plans
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}api/membership/plans`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPlans(data.plans);
      });
  }, []);

  // ✅ RAZORPAY FUNCTION
  const handleRazorpay = async (plan) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_BASE_URL}api/membership/create-order`, {
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

        handler: async function (response) {

          const verify = await fetch(`${import.meta.env.VITE_BASE_URL}api/membership/verify-payment`, {
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

          const verifyData = await verify.json();

          if (verifyData.success) {
            toast.success("🎉 Membership Activated!");

            // ✅ AUTO REFRESH LIKE REAL SITES
            setTimeout(() => {
              window.location.href = "/";
            }, 1200);
          } else {
            toast.error("❌ Payment Verification Failed");
          }
        },

        theme: {
          color: "#2563eb"
        }
      };

      const razor = new window.Razorpay(options);
      razor.open();

    } catch (error) {
      console.error(error);
      toast.error("Payment process failed");
    }
  };

  const benefitList = {
    Silver: [
      "15% Ticket Discount",
      "Standard Booking",
      "No Early Access",
      "HD Trailer Access",
    ],
    Gold: [
      "15% Ticket Discount",
      "Early Ticket Access",
      "Priority Customer Support",
      "Exclusive Deals & Promotions",
      "Monthly Cashback Coupons",
    ],
  };

  return (
    <div className="pt-36 px-6 md:px-20 lg:px-36 min-h-screen text-white
      bg-gradient-to-b from-[#0a0a0c] via-[#0d0d10] to-[#0a0a0b]">

      <p className="text-center text-xl md:text-2xl text-blue-400/90 max-w-3xl mx-auto mb-6 leading-relaxed font-medium">
        “Your entertainment journey begins here.
        Choose the membership that unlocks your best movie experience.”
      </p>

      <h1 className="text-center text-5xl font-extrabold mb-16">
        Choose Your Membership
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-center">
        {plans.map((plan, i) => (
          <div
            key={i}
            className="relative bg-[#0f0f11]/70 backdrop-blur-lg rounded-3xl px-10 py-12 
              border border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.7)]
              hover:shadow-[0_0_40px_rgba(0,0,0,0.9)] hover:border-blue-500/40 
              hover:bg-[#111]/80 hover:scale-[1.03] transition cursor-pointer
              min-h-[500px] flex flex-col justify-between group"
          >

            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4 tracking-wide">
                {plan.type}
              </h2>

              <p className="text-blue-400 text-5xl font-extrabold mb-8 drop-shadow-lg">
                ₹{plan.price}
              </p>

              <h3 className="text-2xl font-semibold mb-3 text-blue-300/90">
                Benefits
              </h3>

              <ul className="space-y-3 text-lg text-gray-300">
                {benefitList[plan.type]?.map((b, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="text-green-400 text-xl font-bold">✔</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleRazorpay(plan)}
              className="relative z-10 w-full py-4 rounded-xl bg-red-600 
                hover:bg-red-700 text-xl font-semibold mt-10 shadow-lg"
            >
              Subscribe
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}
