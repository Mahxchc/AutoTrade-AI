// =====================================
// AutoTrade AI Backend
// Main Server
// File: backend/server.js
// =====================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// =====================================
// Database
// =====================================

import connectDatabase from "./database.js";

// =====================================
// Telegram Authentication
// =====================================

import {
    validateTelegramInitData
} from "./utils/telegramAuth.js";

// =====================================
// Routes
// =====================================

import authRoutes from "./routes/auth.js";
import botRoutes from "./routes/bot.js";
import currencyRoutes from "./routes/currency.js";
import depositRoutes from "./routes/deposit.js";
import paymentRoutes from "./routes/payment.js";
import tradeRoutes from "./routes/trade.js";
import userRoutes from "./routes/user.js";
import walletRoutes from "./routes/wallet.js";
import withdrawRoutes from "./routes/withdraw.js";

// =====================================
// Environment
// =====================================

dotenv.config();

// =====================================
// App
// =====================================

const app = express();


// =====================================
// PORT
// =====================================

const PORT =
    process.env.PORT || 3000;


// =====================================
// CORS
// =====================================

const allowedOrigins = [

    process.env.FRONTEND_URL,

    "https://web.telegram.org",

    "https://t.me"

].filter(Boolean);


app.use(

    cors({

        origin: function (origin, callback) {

            // Allow requests without Origin
            // such as health checks/server requests

            if (!origin) {

                return callback(null, true);

            }


            // Development / configured origins

            if (
                allowedOrigins.includes(origin)
            ) {

                return callback(null, true);

            }


            // Allow Telegram WebApp requests

            if (
                origin.startsWith(
                    "https://web.telegram.org"
                )
            ) {

                return callback(null, true);

            }


            return callback(
                new Error("CORS not allowed")
            );

        },

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
            "X-Telegram-Init-Data"

        ],

        credentials: true

    })

);


// =====================================
// Body Parser
// =====================================

app.use(

    express.json({

        limit: "1mb"

    })

);


// =====================================
// URL Encoded
// =====================================

app.use(

    express.urlencoded({

        extended: true,

        limit: "1mb"

    })

);


// =====================================
// Request Logger
// =====================================

app.use(

    (req, res, next) => {

        console.log(
            `[API] ${req.method} ${req.originalUrl}`
        );

        next();

    }

);


// =====================================
// Root
// =====================================

app.get(

    "/",

    (req, res) => {

        res.json({

            success: true,

            status: "online",

            message:
                "AutoTrade AI Backend Running 🚀",

            environment:
                process.env.NODE_ENV || "production",

            timestamp:
                new Date().toISOString()

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

            const mongoose =
                await import("mongoose");

            const dbState =
                mongoose.default.connection.readyState;


            const database =
                dbState === 1
                    ? "connected"
                    : "disconnected";


            return res.json({

                success: true,

                status: "healthy",

                database,

                timestamp:
                    new Date().toISOString()

            });

        }

        catch (error) {

            console.error(
                "[HEALTH ERROR]",
                error
            );

            return res.status(500).json({

                success: false,

                status: "unhealthy",

                database: "unknown",

                message:
                    "Health check failed"

            });

        }

    }

);


// =====================================
// Telegram WebApp Authentication
// =====================================
//
// Frontend sends:
//
// POST /api/auth/telegram
//
// Header:
//
// X-Telegram-Init-Data: <Telegram initData>
//
// OR:
//
// body:
//
// {
//     "initData": "..."
// }
//
// =====================================

app.post(

    "/api/auth/telegram",

    async (req, res) => {

        try {

            const initData =
                req.headers[
                    "x-telegram-init-data"
                ] ||
                req.body?.initData;


            if (!initData) {

                return res.status(401).json({

                    success: false,

                    authenticated: false,

                    message:
                        "Telegram initData is required"

                });

            }


            const validation =
                validateTelegramInitData(
                    initData
                );


            if (!validation.valid) {

                return res.status(401).json({

                    success: false,

                    authenticated: false,

                    message:
                        validation.message ||
                        "Invalid Telegram authentication"

                });

            }


            const telegramUser =
                validation.user;


            // =================================
            // Find or Create User
            // =================================

            const User =
                (await import(
                    "./models/User.js"
                )).default;


            let user =
                await User.findOne({

                    telegramId:
                        String(telegramUser.id)

                });


            if (!user) {

                user =
                    await User.create({

                        telegramId:
                            String(
                                telegramUser.id
                            ),

                        username:
                            telegramUser.username ||
                            "",

                        firstName:
                            telegramUser.first_name ||
                            "",

                        lastName:
                            telegramUser.last_name ||
                            "",

                        accessEnabled:
                            false,

                        approvalStatus:
                            "PENDING",

                        botAccess:
                            false,

                        botActive:
                            false,

                        status:
                            "PENDING",

                        lastLogin:
                            new Date()

                    });

            }

            else {

                // =================================
                // Update Telegram Information
                // =================================

                user.username =
                    telegramUser.username ||
                    user.username ||
                    "";

                user.firstName =
                    telegramUser.first_name ||
                    user.firstName ||
                    "";

                user.lastName =
                    telegramUser.last_name ||
                    user.lastName ||
                    "";

                user.lastLogin =
                    new Date();


                await user.save();

            }


            return res.json({

                success: true,

                authenticated: true,

                message:
                    "Telegram authentication successful",

                user: {

                    id: user._id,

                    telegramId:
                        user.telegramId,

                    username:
                        user.username,

                    firstName:
                        user.firstName,

                    lastName:
                        user.lastName,

                    accessEnabled:
                        user.accessEnabled,

                    approvalStatus:
                        user.approvalStatus,

                    botAccess:
                        user.botAccess,

                    botActive:
                        user.botActive,

                    status:
                        user.status

                }

            });

        }

        catch (error) {

            console.error(
                "[TELEGRAM AUTH ERROR]",
                error
            );


            return res.status(500).json({

                success: false,

                authenticated: false,

                message:
                    "Telegram authentication failed"

            });

        }

    }

);


// =====================================
// Routes
// =====================================

// Authentication
app.use(
    "/api/auth",
    authRoutes
);


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


// Bot
app.use(
    "/api/bot",
    botRoutes
);


// Currency
app.use(
    "/api/currency",
    currencyRoutes
);


// Deposit
app.use(
    "/api/deposit",
    depositRoutes
);


// Payment
app.use(
    "/api/payment",
    paymentRoutes
);


// Withdraw
app.use(
    "/api/withdraw",
    withdrawRoutes
);


// =====================================
// 404 Handler
// =====================================

app.use(

    (req, res) => {

        return res.status(404).json({

            success: false,

            message: "API route not found",

            path: req.originalUrl

        });

    }

);


// =====================================
// Global Error Handler
// =====================================

app.use(

    (error, req, res, next) => {

        console.error(
            "[GLOBAL ERROR]",
            error
        );


        if (
            error.message ===
            "CORS not allowed"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "CORS origin not allowed"

            });

        }


        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

);


// =====================================
// Start Server
// =====================================

async function startServer() {

    try {

        console.log(
            "====================================="
        );

        console.log(
            "🚀 Starting AutoTrade AI Backend"
        );

        console.log(
            "=====================================");


        // =================================
        // Check Telegram Token
        // =================================

        if (
            !process.env.TELEGRAM_BOT_TOKEN
        ) {

            console.warn(
                "⚠️ TELEGRAM_BOT_TOKEN is NOT configured"
            );

        }

        else {

            console.log(
                "🤖 Telegram Bot Token: configured"
            );

        }


        // =================================
        // Connect MongoDB
        // =================================

        await connectDatabase();


        console.log(
            "✅ MongoDB connected successfully."
        );


        // =================================
        // Start HTTP Server
        // =================================

        app.listen(

            PORT,

            "0.0.0.0",

            () => {

                console.log(
                    "====================================="
                );

                console.log(
                    "🚀 AutoTrade AI Backend"
                );

                console.log(
                    `🌐 Server running on port ${PORT}`
                );

                console.log(
                    `🌍 Environment: ${
                        process.env.NODE_ENV ||
                        "production"
                    }`
                );

                console.log(
                    "🗄️ MongoDB: Connected"
                );

                console.log(
                    "🔐 Telegram WebApp Auth: Enabled"
                );

                console.log(
                    "====================================="
                );

            }

        );

    }

    catch (error) {

        console.error(
            "====================================="
        );

        console.error(
            "❌ SERVER STARTUP FAILED"
        );

        console.error(
            error
        );

        console.error(
            "====================================="
        );


        process.exit(1);

    }

}


// =====================================
// Start
// =====================================

startServer();


// =====================================
// Export App
// =====================================

export default app;