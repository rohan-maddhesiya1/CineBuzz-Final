import express from 'express'
import {
  getOccupiedSeats,
  createSeatPaymentOrder,
  verifySeatPayment,
  downloadTicketPDF
} from '../controllers/bookingController.js'
import { authenticateToken } from '../middleware/auth.js'


const bookingRouter = express.Router()

bookingRouter.get('/seats/:showId', getOccupiedSeats)
bookingRouter.post('/create-seat-order', authenticateToken, createSeatPaymentOrder)
bookingRouter.post('/verify-seat-payment', authenticateToken, verifySeatPayment)
bookingRouter.get(
  "/:bookingId/ticket",
  
  downloadTicketPDF
);


export default bookingRouter
