import express from "express";
import { getFavorites, getUserBookings, updateFavorite } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.get('/bookings', authenticateToken, getUserBookings)
userRouter.post('/update-favorite', authenticateToken, updateFavorite)
userRouter.get('/favorites', authenticateToken, getFavorites)

export default userRouter;