import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import userRouter from "./routes/user.route.js";
import authRouter from "./routes/auth.route.js";
import movieRouter from "./routes/movie.route.js";
import reviewRouter from "./routes/review.route.js";
import adminRouter from "./routes/admin.route.js";

// Middlewares
import { 
    errorHandler, 
    globalLimiter, 
    authLimiter, 
    securityHeaders 
} from "./configs/middleware.js";

const PORT = process.env.PORT || 5000;
const app = express();

// 1. Security Headers (Helmet)
app.use(securityHeaders);

// 2. Rate Limiting Global
app.use(globalLimiter);

// 3. CORS & Parsing
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());

// 4. Routes (API)

// 'authLimiter' KHUSUS untuk rute auth agar lebih ketat
app.use("/api/v1/auth", authLimiter, authRouter);

app.use("/api/v1/users", userRouter);
app.use("/api/v1/movies", movieRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/admin", adminRouter);

// Default route
app.get("/", (req, res) => {
    res.status(200).json({ message: "Hello World!" });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "not found" });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server started, listening on port ${PORT}`);
});