// app.js
import 'dotenv/config'; // MUST BE LINE 1 - Loads your .env variables
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import routes from './routes.js';

const app = express();

// When running behind a proxy (e.g., Render, Heroku, Vercel), express must
// trust the proxy so it correctly reads the client IP from `X-Forwarded-For`.
// This is required for `express-rate-limit` and other middleware to see
// the real client IP instead of the proxy's address.
// Explicitly trust the first proxy.
app.set('trust proxy', 1);

// --- Debugging (Optional: Remove after testing) ---
console.log("✅ Env Loaded. Cloudinary Key exists:", !!process.env.CLOUDINARY_API_KEY);
if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
  console.warn('⚠️ Cloudinary env vars appear missing or incomplete. Uploads will fail with 401/Invalid Signature.');
}
// --------------------------------------------------

app.use(helmet());

// CORS configuration - allows the frontend to send cookies (credentials)
const allowedOrigin =
  process.env.CLIENT_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://favedelicacy.store'
    : 'http://localhost:3000');

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiter to prevent brute force on Login/API
const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." }
});
app.use('/api', limiter);

// API Routes
app.use('/api', routes);

// Global Health Check
app.get('/', (req, res) => res.json({ ok: true, environment: process.env.NODE_ENV }));

// Global Error Handler - Prevents the 500 error from crashing the whole server process
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err && err.message, err);
  const message = err && (err.message || err.toString()) || "Something went wrong on the server";
  res.status(err.status || 500).json({
    message,
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
});

export default app;