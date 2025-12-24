import express from "express";
import { addShow, getNowPlayingMovies, getShow, getShows } from "../controllers/showController.js";
import { authenticateToken, protectAdmin } from "../middleware/auth.js";

const showRouter = express.Router();

showRouter.get('/now-playing', authenticateToken, protectAdmin, getNowPlayingMovies)
showRouter.post('/add', authenticateToken, protectAdmin, addShow)
showRouter.get("/all", getShows)
showRouter.get("/:movieId", getShow)

export default showRouter;