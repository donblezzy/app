import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import productRoutes from './routes/products.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/order.js';
import paymentRoutes from './routes/payment.js';
import { connectDatabase } from "./config/dbConnect.js";
import errorMiddleware from "./middlewares/error.js";

const app = express();

// Connect to Database
connectDatabase();

app.use(cors({ origin: "http://localhost:5000", credentials: true }));
app.use(express.json({ limit: "10mb", verify: (req, res, buf) => { req.rawBody = buf.toString() } }));
app.use(cookieParser());

// API Routes
app.use('/api', productRoutes);
app.use('/api', authRoutes);
app.use('/api', orderRoutes);
app.use('/api', paymentRoutes);

// Health check endpoint (before frontend wildcard)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Serve frontend in production
if (process.env.NODE_ENV === "PRODUCTION") {
    app.use(express.static(path.join(__dirname, "../frontend/build")));

    app.get("*", (req, res) =>
        res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"))
    );
}

// Error middleware
app.use(errorMiddleware);

// Listen on all interfaces to allow Kubernetes probes
app.listen(process.env.PORT, '0.0.0.0', () => {
    console.log(`Server started on PORT: ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
    console.log(`ERROR: ${err}`);
    console.log(`Shutting down server due to unhandled Promise Rejection`);
    process.exit(1);
});
