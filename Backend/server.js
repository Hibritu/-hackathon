import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import catchRoutes from './routes/catch.js';
import verifyRoutes from './routes/verify.js';
import orderRoutes from './routes/order.js';
import userRoutes from './routes/user.js';
import deliveryRoutes from './routes/delivery.js';
import chapaRoutes from './routes/chapa.js';
import setupSwagger from './swagger.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Docs
setupSwagger(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/catch', catchRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/user', userRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/chapa', chapaRoutes);
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'FishLink API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 FishLink Backend running on http://localhost:${PORT}`);
});

