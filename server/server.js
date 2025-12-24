import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import showRouter from './routes/showRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import userRouter from './routes/userRoutes.js';
import authRouter from './routes/authRoutes.js';
import membershipRouter from './routes/membershipRoutes.js'; // ✅ NEW import
import chatRouter from './routes/chatRoutes.js'; // ✅ NEW import

const app = express();
const port = 3000;

await connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// API Routes
app.get('/', (req, res) => res.send('Server is Live!'));
app.use('/api/auth', authRouter);
app.use('/api/show', showRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/admin', adminRouter);
app.use('/api/user', userRouter);
app.use('/api/membership', membershipRouter); // ✅ NEW route registration
app.use('/api/chat', chatRouter); // ✅ NEW route registration

app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
