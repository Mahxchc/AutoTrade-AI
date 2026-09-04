// =====================================
// ..M AutoTrade AI Backend
// Main Server
// File: backend/server.js
// =====================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";


// =====================================
// Load Environment :: M
// =====================================

dotenv.config();


// =====================================
// Database :: M
// =====================================

import connectDatabase
    from "./database.js";

import mongoose from "mongoose";


// =====================================
// Authentication Middleware :: M
// =====================================

import {
    requireTelegramUser
} from "./middleware/auth.js";


// =====================================
// Telegram Bot :: M
// =====================================

import {
    handleTelegramUpdate,
    setupTelegramWebhook,
    setupTelegramCommands
} from "./bot.js";


// =====================================
// Routes :: M
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
// Admin Routes :: M
// =====================================
//
// فقط سازنده / Admin
// اجازه استفاده از این مسیرها را دارد.
//
// /api/admin
//
// =====================================

import adminRoutes
    from "./routes/admin.js";


// =====================================
// Express App :: M
// =====================================

const app =
    express();


// =====================================
// Trust Proxy :: M
// =====================================

app.set(
    "trust proxy",
    1
);


// =====================================
// Basic Security :: M
// =====================================

app.disable(
    "x-powered-by"
);


// =====================================
// CORS :: M
// =====================================

const allowedOrigins = [

    process.env.FRONTEND_URL,

    process.env.MINI_APP_URL

].filter(Boolean);


app.use(

    cors({

        origin(
            origin,
            callback
        ) {

            // ---------------------------------
            // Server-to-server
            // ---------------------------------

            if (!origin) {

                return callback(
                    null,
                    true
                );

            }


            // ---------------------------------
            // No configured origins
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
            // Allowed origin
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
// Body Parser :: M
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
// Request Time :: M
// =====================================

app.use(
    (
        req,
        res,
        next
    ) => {

        req.requestTime =
            new Date();

        next();

    }
);


// =====================================
// Root Health :: M
// =====================================

app.get(
    "/",
    (
        req,
        res
    ) => {

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
// Real Health Check :: M
// =====================================

app.get(
    "/health",
    (
        req,
        res
    ) => {

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
// Telegram Webhook :: M
// =====================================
//
// Telegram -> Render
//
// POST /api/telegram/webhook
//
// این مسیر نباید با
// requireTelegramUser
// محافظت شود.
//
// چون درخواست مستقیم از Telegram
// Bot API دریافت می‌شود.
//
// =====================================

app.post(
    "/api/telegram/webhook",
    async (
        req,
        res
    ) => {

        try {

            // ---------------------------------
            // Validate update body
            // ---------------------------------

            if (
                !req.body ||
                typeof req.body !== "object"
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid Telegram update"

                });

            }


            // ---------------------------------
            // Process Telegram update
            // ---------------------------------

            await handleTelegramUpdate(
                req.body
            );


            // ---------------------------------
            // Telegram expects successful response
            // ---------------------------------

            return res.status(200).json({

                success:
                    true

            });

        }

        catch (error) {

            console.error(
                "TELEGRAM WEBHOOK ERROR:",
                error
            );


            return res.status(200).json({

                success:
                    false

            });

        }

    }
);


// =====================================
// Telegram Authentication :: M
// =====================================
//
// POST /api/auth/telegram
//
// خود auth.js احراز هویت را انجام می‌دهد.
//
// =====================================

app.use(
    "/api/auth",
    authRoutes
);


// =====================================
// Public Currency Route :: M
// =====================================

app.use(
    "/api/currency",
    currencyRoutes
);


// =====================================
// Admin Routes :: M
// =====================================
//
// مهم:
//
// این Route داخل خودش:
//
// requireTelegramUser
// +
// requireAdmin
//
// را اجرا می‌کند.
//
// بنابراین فقط سازنده اجازه دسترسی دارد.
//
// =====================================

app.use(
    "/api/admin",
    adminRoutes
);


// =====================================
// Protected API Routes :: M
// =====================================


// =====================================
// Users :: M
// =====================================

app.use(
    "/api/users",
    requireTelegramUser,
    userRoutes
);


// =====================================
// Wallet :: M
// =====================================

app.use(
    "/api/wallet",
    requireTelegramUser,
    walletRoutes
);


// =====================================
// Trades :: M
// =====================================

app.use(
    "/api/trades",
    requireTelegramUser,
    tradeRoutes
);


// =====================================
// Bot API :: M
// =====================================

app.use(
    "/api/bot",
    requireTelegramUser,
    botRoutes
);


// =====================================
// Deposits :: M
// =====================================

app.use(
    "/api/deposit",
    requireTelegramUser,
    depositRoutes
);


// =====================================
// Payments :: M
// =====================================

app.use(
    "/api/payment",
    requireTelegramUser,
    paymentRoutes
);


// =====================================
// Withdrawals :: M
// =====================================

app.use(
    "/api/withdraw",
    requireTelegramUser,
    withdrawRoutes
);


// =====================================
// 404 Handler :: M
// =====================================

app.use(
    (
        req,
        res
    ) => {

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
// Global Error Handler :: M
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
// Start Server :: M
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
        // Telegram Bot Commands
        // ---------------------------------

        try {

            await setupTelegramCommands();

            console.log(
                "Telegram bot commands configured successfully"
            );

        }

        catch (error) {

            console.error(
                "TELEGRAM COMMAND SETUP ERROR:",
                error
            );

        }


        // ---------------------------------
        // Telegram Webhook
        // ---------------------------------

        try {

            await setupTelegramWebhook();

            console.log(
                "Telegram webhook configured successfully"
            );

        }

        catch (error) {

            console.error(
                "TELEGRAM WEBHOOK SETUP ERROR:",
                error
            );

        }


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
// Start Application :: M
// =====================================

startServer();


// =====================================
// Export App :: M
// =====================================

export default app;