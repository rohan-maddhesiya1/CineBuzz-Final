import express from "express";
import { authenticateToken, protectAdmin } from "../middleware/auth.js";
import { getAllBookings, getAllShows, getDashboardData, isAdmin } from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.get('/is-admin', authenticateToken, protectAdmin, isAdmin)
adminRouter.get('/dashboard', authenticateToken, protectAdmin, getDashboardData)
adminRouter.get('/all-shows', authenticateToken, protectAdmin, getAllShows)
adminRouter.get('/all-bookings', authenticateToken, protectAdmin, getAllBookings)

export default adminRouter;