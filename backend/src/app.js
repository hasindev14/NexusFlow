import express from "express";
import ApiError from "./core/ApiError.js";
import notFound from "./middlewares/notFound.middleware.js";
import errorHandler from "./middlewares/error.middleware.js";
import authRoutes from "./modules/auth/routes/auth.routes.js";


const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "🚀 NexusFlow Backend API is Running...",
    });
});

app.use("/api/v1/auth", authRoutes);


// Test error route
app.get("/api/v1/test-error", (req, res, next) => {
    next(new ApiError(400, "Test error from NexusFlow"));
});

// 404 Middleware
app.use(notFound);

// Global Error Middleware
app.use(errorHandler);

export default app;