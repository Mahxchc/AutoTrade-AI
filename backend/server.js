// =====================================
// AutoTrade AI
// Backend Server
// =====================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDatabase } from "./database.js";

import userRoutes from "./routes/User.js";
import walletRoutes from "./routes/Wallet.js";
import tradeRoutes from "./routes/Trade.js";
import botRoutes from "./routes/Bot.js";


// =====================================
// Environment
// =====================================

dotenv.config();


// =====================================
// App
// =====================================

const app = express();


// =====================================
// Middleware
// =====================================

app.use(cors());

app.use(express.json());


// =====================================
// Health Check
// =====================================

app.get("/", (req, res) => {

    res.json({

        status: "online",

        message: "AutoTrade AI Backend Running 🚀"

    });

});


// =====================================
// API Routes
// =====================================

app.use("/api/users", userRoutes);

app.use("/api/wallet", walletRoutes);

app.use("/api/trades", tradeRoutes);

app.use("/api/bot", botRoutes);


// =====================================
// 404
// =====================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "API endpoint not found"

    });

});


// =====================================
// Error Handler
// =====================================

app.use((error, req, res, next) => {

    console.error("Server Error:", error);

    res.status(500).json({

        success: false,

        message: "Internal server error"

    });

});


// =====================================
// Server
// =====================================

const PORT = process.env.PORT || 3000;


async function startServer() {

    try {

        await connectDatabase();

        app.listen(PORT, () => {

            console.log(
                `AutoTrade AI Backend running on port ${PORT}`
            );

        });

    }

    catch (error) {

        console.error(
            "Server Start Error:",
            error.message
        );

        process.exit(1);

    }

}


startServer();
