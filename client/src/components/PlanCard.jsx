import React from "react";

const PlanCard = ({ plan, onSubscribe }) => {
  const colors = {
    Silver: "from-gray-400 to-gray-600 text-black",
    Gold: "from-yellow-400 to-yellow-600 text-black",
    Platinum: "from-blue-400 to-indigo-600 text-black",
  };

  const gradient = colors[plan.type] || "from-gray-500 to-gray-700";

  // Benefits based on plan type
  const benefits = {
    Silver: [
      "15% Ticket Discount",
      "No Early Access to Booking",
    ],
    Gold: [
      "15% Ticket Discount",
      "Early Access to Ticket Booking",
    ],
    Platinum: [
      "20% Ticket Discount",
      "Early Access + Exclusive Deals",
    ],
  };

  return (
    <div
      className={`w-72 min-h-[420px] rounded-2xl shadow-lg bg-gradient-to-br ${gradient} flex flex-col justify-between p-6 transform hover:scale-105 transition`}
    >
      <div>
        <h2 className="text-3xl font-bold mb-4">{plan.type} Plan</h2>
        <p className="text-xl font-semibold mb-2">₹{plan.price}</p>
        <p className="text-sm mb-4">{plan.durationDays} days duration</p>

        {/* BENEFITS SECTION */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Benefits:</h3>
          <ul className="space-y-1 text-sm">
            {benefits[plan.type]?.map((b, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="font-bold">✔</span> {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        onClick={onSubscribe}
        className="bg-black text-white rounded-lg py-3 text-sm font-semibold hover:bg-opacity-80 mt-4"
      >
        Subscribe Now
      </button>
    </div>
  );
};

export default PlanCard;
