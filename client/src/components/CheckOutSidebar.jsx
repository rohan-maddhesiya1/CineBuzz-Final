const CheckoutSidebar = ({
  open,
  onClose,
  movie,
  time,
  seats,
  seatPrice,
  baseAmount,
  discount,
  membership,
  total,
  onPay,
  processing
}) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose}>
      <div
        className="absolute right-0 top-0 w-96 h-full bg-[#0b0f1a] p-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">Booking Summary</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {membership && baseAmount > 0 && (
          <div className="mb-4 p-3 rounded bg-green-500/10 border border-green-500/30">
          <p className="text-sm font-semibold text-green-400">
          🎉 {membership.toUpperCase()} Member Benefit Applied
          </p>
          <p className="text-xs text-gray-300">
          You get {membership === 'Gold' ? '15%' : '10%'} off on every booking
    </p>
  </div>
)}


        <p><b>Movie:</b> {movie}</p>
        <p className="mt-1">
          <b>Time:</b>{" "}
          {new Date(time).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short"
          })}
        </p>

        <div className="mt-3">
          <p className="font-medium mb-1">Seats</p>
          <div className="flex flex-wrap gap-2">
            {seats.map(seat => (
              <span
                key={seat}
                className="px-2 py-1 text-xs rounded bg-primary/20 border border-primary"
              >
                {seat}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 mt-4 pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Ticket Price</span>
            <span>₹{seatPrice} × {seats.length}</span>
          </div>

          <div className="flex justify-between font-medium">
            <span>Subtotal</span>
            <span>₹{baseAmount}</span>
          </div>

          {membership && discount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>{membership} Discount</span>
              <span>-₹{discount}</span>
            </div>
          )}

          <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-semibold">
            <span>Total Payable</span>
            <span>₹{total}</span>
          </div>

          {membership && discount > 0 && (
            <p className="text-xs text-green-400">
              You saved ₹{discount} with your {membership} subscription 🎉
            </p>
          )}
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4 bg-[#0b0f1a] border-t border-white/10">
          <button
            disabled={processing}
            onClick={onPay}
            className="w-full py-3 bg-primary rounded-lg font-medium"
          >
            {processing ? "Processing..." : `Pay ₹${total}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CheckoutSidebar
