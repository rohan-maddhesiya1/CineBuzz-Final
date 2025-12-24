import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRightIcon, ClockIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import BlurCircle from '../components/BlurCircle'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'
import CheckoutSidebar from '../components/CheckOutSidebar'

const SeatLayout = () => {

  // ORIGINAL seat grouping (unchanged)
  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", "J"]]

  const { id, date } = useParams()

  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)
  const [occupiedSeats, setOccupiedSeats] = useState([])
  const [processing, setProcessing] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const { axios, getToken, user } = useAppContext()

  /* ================= FETCH SHOW ================= */
  useEffect(() => {
    const fetchShow = async () => {
      try {
        const { data } = await axios.get(`/api/show/${id}`)
        if (data.success) setShow(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchShow()
  }, [id, axios])

  /* ================= OCCUPIED SEATS ================= */
  useEffect(() => {
    if (!selectedTime) return
    const fetchSeats = async () => {
      try {
        const { data } = await axios.get(
          `/api/booking/seats/${selectedTime.showId}`
        )
        if (data.success) setOccupiedSeats(data.occupiedSeats)
      } catch (err) {
        console.error(err)
      }
    }
    fetchSeats()
  }, [selectedTime, axios])

  /* ================= SEAT CLICK ================= */
  const handleSeatClick = (seatId) => {
    if (!selectedTime) return toast("Please select time first")
    if (occupiedSeats.includes(seatId)) return toast("Seat already booked")
    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5)
      return toast("You can only select 5 seats")

    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    )
  }

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      {Array.from({ length: count }).map((_, i) => {
        const seatId = `${row}${i + 1}`
        return (
          <button
            key={seatId}
            onClick={() => handleSeatClick(seatId)}
            className={`h-8 w-8 rounded border border-primary/60 text-xs
              ${selectedSeats.includes(seatId) && "bg-primary text-white"}
              ${occupiedSeats.includes(seatId) && "opacity-50 cursor-not-allowed"}`}
          >
            {seatId}
          </button>
        )
      })}
    </div>
  )

  /* ================= PRICE ================= */
console.log("selectedTime:", selectedTime)

const seatPrice = Number(selectedTime?.price ?? 0)
const ticketCount = selectedSeats.length
const baseAmount = seatPrice * ticketCount

const membership = user?.membershipType || null
let discount = 0
if (membership === 'Silver') discount = Math.round(baseAmount * 0.10)
if (membership === 'Gold')   discount = Math.round(baseAmount * 0.15)


const finalAmount = Math.round(baseAmount - discount)


  /* ================= PAYMENT ================= */
  const bookTickets = async () => {
    try {
      if (!user) return toast.error("Please login to proceed")
      if (!selectedTime || !selectedSeats.length)
        return toast.error("Please select time and seats")

      setProcessing(true)
      const token = await getToken()

      const { data } = await axios.post(
        "/api/booking/create-seat-order",
        { showId: selectedTime.showId, selectedSeats },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: "INR",
        name: "CineBuzz",
        order_id: data.order.id,
        handler: async (res) => {
          await axios.post(
            "/api/booking/verify-seat-payment",
            {
              ...res,
              showId: selectedTime.showId,
              selectedSeats
            },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          toast.success("🎉 Booking Confirmed")
          window.location.href = "/my-bookings"
        }
      }

      new window.Razorpay(options).open()
    } catch (err) {
      toast.error("Payment failed")
    } finally {
      setProcessing(false)
    }
  }

  if (!show) return <Loading />

  /* ================= UI (ORIGINAL LOOK RESTORED) ================= */
  return (
    <>
      <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 pt-32">

        {/* TIMINGS (LEFT PANEL – ORIGINAL) */}
        <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-32">
          <p className="text-lg font-semibold px-6">Available Timings</p>
          <div className="mt-5 space-y-1">
            {show.dateTime?.[date]?.map(t => (
              <div
                key={t.time}
                onClick={() => setSelectedTime(t)}
                className={`flex items-center gap-2 px-6 py-2 cursor-pointer
                ${selectedTime?.time === t.time
                  ? "bg-primary text-white"
                  : "hover:bg-primary/20"}`}
              >
                <ClockIcon className="w-4 h-4" />
                <p className="text-sm">{isoTimeFormat(t.time)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SEATS (CENTER – ORIGINAL ALIGNMENT) */}
        <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
          <BlurCircle top="-100px" left="-100px" />
          <BlurCircle bottom="0" right="0" />

          <h1 className="text-2xl font-semibold mb-4">Select your seat</h1>
          <img src={assets.screenImage} alt="screen" />
          <p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>

          <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
            <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
              {groupRows[0].map(row => renderSeats(row))}
            </div>

            <div className="grid grid-cols-2 gap-11">
              {groupRows.slice(1).map((group, idx) => (
                <div key={idx}>
                  {group.map(row => renderSeats(row))}
                </div>
              ))}
            </div>
          </div>

          <button
            disabled={!selectedSeats.length || processing}
            onClick={() => setIsCheckoutOpen(true)}
            className="flex items-center gap-1 mt-20 px-10 py-3 text-sm rounded-full
                       bg-primary hover:bg-primary-dull disabled:opacity-50"
          >
            Proceed to Checkout
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <CheckoutSidebar
        open={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        movie={show.movie.title}
        time={selectedTime?.time}
        seats={selectedSeats}
        seatPrice={seatPrice}
        baseAmount={baseAmount}
        discount={discount}
        membership={membership}
        total={finalAmount}
        onPay={bookTickets}
        processing={processing}
      />
    </>
  )
}

export default SeatLayout
