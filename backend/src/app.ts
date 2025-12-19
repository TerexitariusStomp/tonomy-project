// Main Express app setup
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes, { walletCallback } from './routes/auth.routes';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use('/api/auth', authRoutes);
// Public callback endpoint for wallet ESR responses
app.post('/callback', walletCallback);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
