// =====================================
// Server:: M
// AutoTrade AI
// Main Backend Server
// File: backend/server.js
// =====================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDatabase from "./database.js";

import userRoutes from "./routes/user.js";
import walletRoutes from "./routes/wallet.js";
import tradeRoutes from "./routes/trade.js";
import botRoutes from "./routes/bot.js";


// =====================================
// Load Environment Variables
// =====================================

dotenv.config();


// =====================================
// Create Express Application
// =====================================

const app = express();


// =====================================
// Configuration
// =====================================

const PORT =
    process.env.PORT || 3000;

const NODE_ENV =
    process.env.NODE_ENV || "production";


// =====================================
// CORS
// =====================================

app.use(
    cors({
        origin: true,
        credentials: true,
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Telegram-Init-Data",
            "X-User-Id"
        ]
    })
);


// =====================================
// Body Parsers
// =====================================

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);


// =====================================
// Basic Security Headers
// =====================================

app.disable("x-powered-by");


// =====================================
// Request Logger
// =====================================

app.use(
    (req, res, next) => {

        const startedAt =
            Date.now();

        res.on(
            "finish",
            () => {

                const duration =
                    Date.now() -
                    startedAt;

                console.log(
                    `[API] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
                );

            }
        );

        next();

    }
);


// =====================================
// Root Route
// =====================================

app.get(
    "/",
    (req, res) => {

        return res.json({

            success: true,

            service:
                "AutoTrade AI Backend",

            status:
                "online",

            environment:
                NODE_ENV,

            message:
                "AutoTrade AI Backend Running 🚀"

        });

    }
);


// =====================================
// Health Check
// =====================================

app.get(
    "/health",
    async (req, res) => {

        try {

            return res.json({

                success: true,

                status:
                    "healthy",

                database:
                    "connected",

                environment:
                    NODE_ENV,

                timestamp:
                    new Date().toISOString()

            });

        }

        catch (error) {

            console.error(
                "[HEALTH ERROR]",
                error
            );

            return res.status(503).json({

                success: false,

                status:
                    "unhealthy",

                database:
                    "unknown",

                timestamp:
                    new Date().toISOString()

            });

        }

    }
);


// =====================================
// API Routes
// =====================================

// Users
app.use(
    "/api/users",
    userRoutes
);


// Wallet
app.use(
    "/api/wallet",
    walletRoutes
);


// Trades
app.use(
    "/api/trades",
    tradeRoutes
);


// AI Trading Bot
app.use(
    "/api/bot",
    botRoutes
);


// =====================================
// 404 Handler
// =====================================

app.use(
    (req, res) => {

        return res.status(404).json({

            success: false,

            message:
                "API route not found",

            path:
                req.originalUrl

        });

    }
);


// =====================================
// Global Error Handler
// =====================================

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "[SERVER ERROR]",
            error
        );

        if (
            res.headersSent
        ) {

            return next(error);

        }

        return res.status(500).json({

            success: false,

            message:
                "Internal server error",

            ...(NODE_ENV !== "production"
                ? {
                    error:
                        error.message
                }
                : {})

        });

    }
);


// =====================================
// Start Server
// =====================================

async function startServer() {

    try {

        // ---------------------------------
        // Connect MongoDB
        // ---------------------------------

        await connectDatabase();


        // ---------------------------------
        // Start HTTP Server
        // ---------------------------------

        app.listen(
            PORT,
            "0.0.0.0",
            () => {

                console.log(
                    "===================================="
                );

                console.log(
                    "🚀 AutoTrade AI Backend"
                );

                console.log(
                    `🌐 Server running on port ${PORT}`
                );

                console.log(
                    `⚙️ Environment: ${NODE_ENV}`
                );

                console.log(
                    "🗄️ MongoDB: Connected"
                );

                console.log(
                    "===================================="
                );

            }
        );

    }

    catch (error) {

        console.error(
            "❌ Failed to start AutoTrade AI Backend"
        );

        console.error(
            error
        );

        process.exit(1);

    }

}


// =====================================
// Start Application
// =====================================

startServer();