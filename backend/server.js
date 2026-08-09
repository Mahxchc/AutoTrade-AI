// =====================================
// AutoTrade AI
// Backend Server:: M
// سرور اصلی بک‌اند
// File: backend/server.js
// =====================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDatabase } from "./database.js";

import userRoutes from "./routes/User.js";
import walletRoutes from "./routes/Wallet.js";
import tradeRoutes from "./routes/Trade.js";
import botRoutes from "./routes/Bot.js";
import withdrawRoutes from "./routes/withdraw.js";
import depositRoutes from "./routes/Deposit.js";
import currencyRoutes from "./routes/Currency.js";
import paymentRoutes from "./routes/Payment.js";


// =====================================
// Environment:: M
// تنظیمات محیط
// =====================================

dotenv.config();


// =====================================
// App:: M
// =====================================

const app =
    express();


// =====================================
// Middleware:: M
// =====================================

app.use(
    cors()
);

app.use(
    express.json()
);


// =====================================
// Health Check:: M
// بررسی آنلاین بودن سرور
// =====================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success:
                true,

            status:
                "online",

            message:
                "AutoTrade AI Backend Running 🚀"

        });

    }
);


// =====================================
// API Routes:: M
// مسیرهای API
// =====================================

app.use(
    "/api/users",
    userRoutes
);


app.use(
    "/api/wallet",
    walletRoutes
);


app.use(
    "/api/trades",
    tradeRoutes
);


app.use(
    "/api/bot",
    botRoutes
);


// =====================================
// Withdraw Routes:: M
// مسیرهای برداشت
// =====================================

app.use(
    "/api/withdraw",
    withdrawRoutes
);


// =====================================
// Deposit Routes:: M
// مسیرهای واریز
// =====================================

app.use(
    "/api/deposit",
    depositRoutes
);


// =====================================
// Currency Routes:: M
// مسیرهای نرخ دلار و تومان
// =====================================

app.use(
    "/api/currency",
    currencyRoutes
);


// =====================================
// Payment Routes:: M
// مسیرهای پرداخت
// =====================================

app.use(
    "/api/payment",
    paymentRoutes
);


// =====================================
// 404:: M
// مسیر پیدا نشد
// =====================================

app.use(
    (req, res) => {

        res.status(404).json({

            success:
                false,

            message:
                "API endpoint not found"

        });

    }
);


// =====================================
// Error Handler:: M
// مدیریت خطا
// =====================================

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "Server Error:",
            error
        );


        res.status(500).json({

            success:
                false,

            message:
                "Internal server error"

        });

    }
);


// =====================================
// Server:: M
// راه‌اندازی سرور
// =====================================

const PORT =
    process.env.PORT ||
    3000;


// =====================================
// Start Server:: M
// شروع سرور
// =====================================

async function startServer() {

    try {

        // =====================================
        // اتصال دیتابیس:: M
        // =====================================

        await connectDatabase();


        // =====================================
        // اجرای سرور:: M
        // =====================================

        app.listen(
            PORT,
            () => {

                console.log(
                    `AutoTrade AI Backend running on port ${PORT}`
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Server Start Error:",
            error.message
        );


        process.exit(
            1
        );

    }

}


startServer();
