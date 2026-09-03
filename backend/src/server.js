import dotenv from "dotenv";

dotenv.config();

console.log("Cloudinary config check:", {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY
        ? "LOADED"
        : "MISSING",
    apiSecret: process.env.CLOUDINARY_API_SECRET
        ? "LOADED"
        : "MISSING",
});

import app from "./app.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(
                `🚀 Server running on http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "❌ Failed to start server:",
            error.message
        );

        process.exit(1);
    }
};

startServer();