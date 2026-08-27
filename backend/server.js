// =====================================
// AutoTrade AI Backend :: M
// Main Server
// File: backend/server.js
// =====================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";


// =====================================
// Load Environment
// =====================================

dotenv.config();


// =====================================
// Database
// =====================================

import connectDatabase
    from "./database.js";


// =====================================
// Database Connection
// =====================================

import mongoose from "mongoose";


// =====================================
// Authentication Middleware
// =====================================

import {
    requireTelegramUser
} from "./middleware/auth.js";


// =====================================
// Routes
// =====================================

import userRoutes
    from "./routes/user.js";

import authRoutes
    from "./routes/auth.js";

import walletRoutes
    from "./routes/wallet.js";

import tradeRoutes
    from "./routes/trade.js";

import botRoutes
    from "./routes/bot.js";

import currencyRoutes
    from "./routes/currency.js";

import depositRoutes
    from "./routes/deposit.js";

import paymentRoutes
    from "./routes/payment.js";

import withdrawRoutes
    from "./routes/withdraw.js";


// =====================================
// Express App
// =====================================

const app =
    express();


// =====================================
// Trust Proxy
// =====================================

app.set(
    "trust proxy",
    1
);


// =====================================
// Basic Security
// =====================================

app.disable(
    "x-powered-by"
);


// =====================================
// CORS
// =====================================

const allowedOrigins = [

    process.env.FRONTEND_URL,

    process.env.MINI_APP_URL

].filter(Boolean);


app.use(

    cors({

        origin(origin, callback) {

            // ---------------------------------
            // Allow server-to-server requests
            // ---------------------------------

            if (!origin) {

                return callback(
                    null,
                    true
                );

            }


            // ---------------------------------
            // If no origins configured
            // ---------------------------------

            if (
                allowedOrigins.length === 0
            ) {

                return callback(
                    null,
                    true
                );

            }


            // ---------------------------------
            // Check allowed origin
            // ---------------------------------

            if (
                allowedOrigins.includes(
                    origin
                )
            ) {

                return callback(
                    null,
                    true
                );

            }


            return callback(
                new Error(
                    "CORS origin not allowed"
                )
            );

        },

        credentials:
            true,

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
            "X-Telegram-InitData"

        ]

    })

);


// =====================================
// Body Parser
// =====================================

app.use(

    express.json({

        limit:
            "1mb"

    })

);


app.use(

    express.urlencoded({

        extended:
            true,

        limit:
            "1mb"

    })

);


// =====================================
// Request Time
// =====================================

app.use(
    (req, res, next) => {

        req.requestTime =
            new Date();

        next();

    }
);


// =====================================
// Root Health
// =====================================

app.get(
    "/",
    (req, res) => {

        return res.status(200).json({

            success:
                true,

            status:
                "online",

            message:
                "AutoTrade AI Backend Running 🚀",

            timestamp:
                new Date().toISOString()

        });

    }
);


// =====================================
// Real Health Check
// =====================================

app.get(
    "/health",
    (req, res) => {

        const readyState =
            mongoose.connection.readyState;


        const databaseConnected =
            readyState === 1;


        return res.status(
            databaseConnected
                ? 200
                : 503
        ).json({

            success:
                databaseConnected,

            status:
                databaseConnected
                    ? "healthy"
                    : "unhealthy",

            database:
                databaseConnected
                    ? "connected"
                    : "disconnected",

            mongoState:
                readyState,

            timestamp:
                new Date().toISOString()

        });

    }
);


// =====================================
// Telegram Authentication
// =====================================
//
// POST /api/auth/telegram
//
// این مسیر خودش middleware احراز هویت
// مخصوص Telegram را داخل auth.js دارد.
// =====================================

app.use(
    "/api/auth",
    authRoutes
);


// =====================================
// Public Currency Route
// =====================================

app.use(
    "/api/currency",
    currencyRoutes
);


// =====================================
// Protected API Routes
// =====================================
//
// تمام مسیرهای زیر نیاز به Telegram
// initData معتبر دارند.
//
// =====================================


// =====================================
// Users
// =====================================

app.use(
    "/api/users",
    requireTelegramUser,
    userRoutes
);


// =====================================
// Wallet
// =====================================

app.use(
    "/api/wallet",
    requireTelegramUser,
    walletRoutes
);


// =====================================
// Trades
// =====================================

app.use(
    "/api/trades",
    requireTelegramUser,
    tradeRoutes
);


// =====================================
// Bot
// =====================================

app.use(
    "/api/bot",
    requireTelegramUser,
    botRoutes
);


// =====================================
// Deposits
// =====================================

app.use(
    "/api/deposit",
    requireTelegramUser,
    depositRoutes
);


// =====================================
// Payments
// =====================================

app.use(
    "/api/payment",
    requireTelegramUser,
    paymentRoutes
);


// =====================================
// Withdrawals
// =====================================

app.use(
    "/api/withdraw",
    requireTelegramUser,
    withdrawRoutes
);


// =====================================
// 404 Handler
// =====================================

app.use(
    (req, res) => {

        return res.status(404).json({

            success:
                false,

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
            "GLOBAL ERROR:",
            error
        );


        if (
            res.headersSent
        ) {

            return next(
                error
            );

        }


        const statusCode =
            Number(
                error.status
            ) || 500;


        return res.status(
            statusCode
        ).json({

            success:
                false,

            message:
                error.message ||
                "Internal server error"

        });

    }

);


// =====================================
// Start Server
// =====================================

const PORT =
    Number(
        process.env.PORT
    ) || 3000;


async function startServer() {

    try {

        // ---------------------------------
        // MongoDB
        // ---------------------------------

        await connectDatabase();


        console.log(
            "MongoDB connected successfully"
        );


        // ---------------------------------
        // Express
        // ---------------------------------

        app.listen(

            PORT,

            "0.0.0.0",

            () => {

                console.log(
                    `AutoTrade AI Backend running on port ${PORT}`
                );

            }

        );

    }

    catch (error) {

        console.error(
            "SERVER START ERROR:",
            error
        );


        process.exit(
            1
        );

    }

}


// =====================================
// Start Application
// =====================================

startServer();


// =====================================
// Export App
// =====================================

export default app;