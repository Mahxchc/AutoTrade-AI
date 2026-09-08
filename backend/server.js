// =====================================
// ..M AutoTrade AI Backend
// Main Server
// File: backend/server.js
// =====================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";


// =====================================
// ..M Load Environment
// =====================================

dotenv.config();


// =====================================
// ..M Database
// =====================================

import connectDatabase
    from "./database.js";

import mongoose from "mongoose";


// =====================================
// ..M Authentication Middleware
// =====================================

import {
    requireTelegramUser,
    requireApprovedUser
} from "./middleware/auth.js";


// =====================================
// ..M Telegram Bot
// =====================================

import {
    handleTelegramUpdate,
    setupTelegramWebhook,
    setupTelegramCommands
} from "./bot.js";


// =====================================
// ..M Routes
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

import adminRoutes
    from "./routes/admin.js";


// =====================================
// ..M Express App
// =====================================

const app =
    express();


// =====================================
// ..M Trust Proxy
// =====================================

app.set(
    "trust proxy",
    1
);


// =====================================
// ..M Basic Security
// =====================================

app.disable(
    "x-powered-by"
);


// =====================================
// ..M CORS
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
            // ..M Server-to-server
            // ---------------------------------

            if (!origin) {

                return callback(
                    null,
                    true
                );

            }


            // ---------------------------------
            // ..M No configured origins
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
            // ..M Allowed origin
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
// ..M Body Parser
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
// ..M Request Time
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
// ..M Root Health
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
// ..M Real Health Check
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
// ..M Telegram Webhook
// =====================================
//
// Telegram -> Render
//
// POST /api/webhook/telegram
//
// این مسیر عمومی است چون درخواست
// مستقیماً از Telegram Bot API می‌آید.
//
// =====================================

app.post(
    "/api/webhook/telegram",
    async (
        req,
        res
    ) => {

        try {

            // ---------------------------------
            // ..M Validate Telegram Update
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
            // ..M Handle Telegram Update
            // ---------------------------------

            await handleTelegramUpdate(
                req.body
            );


            // ---------------------------------
            // ..M Telegram Success
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


            // Telegram should receive 200
            // so it does not repeatedly retry
            return res.status(200).json({

                success:
                    false

            });

        }

    }
);


// =====================================
// ..M Telegram Webhook Compatibility
// =====================================
//
// مسیر قدیمی را هم نگه می‌داریم تا اگر
// جایی هنوز از آدرس قبلی استفاده شد،
// Webhook از کار نیفتد.
//
// POST /api/telegram/webhook
//
// =====================================

app.post(
    "/api/telegram/webhook",
    async (
        req,
        res
    ) => {

        try {

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


            await handleTelegramUpdate(
                req.body
            );


            return res.status(200).json({

                success:
                    true

            });

        }

        catch (error) {

            console.error(
                "TELEGRAM COMPATIBILITY WEBHOOK ERROR:",
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
// ..M Telegram Authentication
// =====================================
//
// این مسیر قبل از تأیید مدیریت
// قابل استفاده است.
//
// =====================================

app.use(
    "/api/auth",
    authRoutes
);


// =====================================
// ..M Public Currency Route
// =====================================

app.use(
    "/api/currency",
    currencyRoutes
);


// =====================================
// ..M Admin Routes
// =====================================
//
// Admin Route داخل خودش:
//
// requireTelegramUser
// +
// requireAdmin
//
// را انجام می‌دهد.
//
// =====================================

app.use(
    "/api/admin",
    adminRoutes
);


// =====================================
// ..M Users Routes
// =====================================
//
// احراز هویت Telegram لازم است.
//
// اما برای ثبت‌نام و تکمیل اطلاعات
// نباید requireApprovedUser بگذاریم.
//
// =====================================

app.use(
    "/api/users",
    requireTelegramUser,
    userRoutes
);


// =====================================
// ..M APPROVED USER APIs
// =====================================
//
// از این قسمت به بعد کاربر باید:
//
// accessEnabled = true
// approvalStatus = APPROVED
// status = ACTIVE
//
// باشد.
//
// =====================================


// =====================================
// ..M Wallet
// =====================================

app.use(
    "/api/wallet",
    requireApprovedUser,
    walletRoutes
);


// =====================================
// ..M Trades
// =====================================

app.use(
    "/api/trades",
    requireApprovedUser,
    tradeRoutes
);


// =====================================
// ..M Bot API
// =====================================

app.use(
    "/api/bot",
    requireApprovedUser,
    botRoutes
);


// =====================================
// ..M Deposits
// =====================================

app.use(
    "/api/deposit",
    requireApprovedUser,
    depositRoutes
);


// =====================================
// ..M Payments
// =====================================

app.use(
    "/api/payment",
    requireApprovedUser,
    paymentRoutes
);


// =====================================
// ..M Withdrawals
// =====================================

app.use(
    "/api/withdraw",
    requireApprovedUser,
    withdrawRoutes
);


// =====================================
// ..M 404 Handler
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
// ..M Global Error Handler
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
// ..M Start Server
// =====================================

const PORT =
    Number(
        process.env.PORT
    ) || 3000;


async function startServer() {

    try {

        // ---------------------------------
        // ..M MongoDB
        // ---------------------------------

        await connectDatabase();


        console.log(
            "MongoDB connected successfully"
        );


        // ---------------------------------
        // ..M Telegram Bot Commands
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
        // ..M Telegram Webhook
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
        // ..M Express
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
// ..M Start Application
// =====================================

startServer();


// =====================================
// ..M Export App
// =====================================

export default app;