// app.js
import 'dotenv/config'; // MUST BE LINE 1 - Loads your .env variables
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import routes from './routes.js';

const app = express();

// --- Debugging (Optional: Remove after testing) ---
console.log("✅ Env Loaded. Cloudinary Key exists:", !!process.env.CLOUDINARY_API_KEY);
// --------------------------------------------------

app.use(helmet());

// CORS configuration - Allows your frontend to send cookies (credentials)
app.use(cors({ 
  origin: process.env.CLIENT_URL || "http://localhost:3000", 
  credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate Limiter to prevent brute force on Login/API
const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: { message: "Too many requests, please try again later." }
});
app.use('/api', limiter);

// API Routes
app.use('/api', routes);

// Global Health Check
app.get('/', (req, res) => res.json({ ok: true, status: "Server is running" }));

// Global Error Handler - Prevents the 500 error from crashing the whole server process
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err.stack);
  res.status(500).json({ 
    message: err.message || "Something went wrong on the server" 
  });
});

export default app;