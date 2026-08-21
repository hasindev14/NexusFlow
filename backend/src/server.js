import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log(`🚀 Server Running`);
            console.log(`🌍 http://localhost:${PORT}`);
            console.log(`🌱 ${process.env.NODE_ENV}`);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        });
    } catch (error) {
        console.error("Server Startup Failed");
        console.error(error);
    }
};

startServer();