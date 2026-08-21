// ..M server.js
// AutoTrade AI Backend
// Main Server

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDatabase from "./database.js";

import userRoutes from "./routes/User.js";
import walletRoutes from "./routes/Wallet.js";
import tradeRoutes from "./routes/Trade.js";
import botRoutes from "./routes/Bot.js";
import currencyRoutes from "./routes/Currency.js";
import depositRoutes from "./routes/Deposit.js";
import paymentRoutes from "./routes/Payment.js";
import withdrawRoutes from "./routes/withdraw.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// =========================================================
// ..M CORS
// =========================================================

app.use(
    cors({
        origin: "*",
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
        ]
    })
);

// =========================================================
// ..M BODY PARSER
// =========================================================

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true
    })
);

// =========================================================
// ..M REQUEST LOGGER
// =========================================================

app.use((req, res, next) => {

    console.log(
        `[API] ${req.method} ${req.originalUrl}`
    );

    next();

});

// =========================================================
// ..M HEALTH
// =========================================================

app.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        status: "online",

        message:
            "AutoTrade AI Backend Running 🚀",

        version: "1.0.0",

        timestamp:
            new Date().toISOString()

    });

});


app.get("/health", (req, res) => {

    res.status(200).json({

        success: true,

        status: "healthy",

        database:
            "connected",

        timestamp:
            new Date().toISOString()

    });

});

// =========================================================
// ..M USER
// =========================================================

app.use(
    "/user",
    userRoutes
);

// =========================================================
// ..M WALLET
// =========================================================

app.use(
    "/wallet",
    walletRoutes
);

// =========================================================
// ..M TRADES
// =========================================================

// مسیر اصلی
app.use(
    "/trade",
    tradeRoutes
);

// مسیر سازگار با Mini App
app.use(
    "/trades",
    tradeRoutes
);

// =========================================================
// ..M BOT
// =========================================================

app.use(
    "/bot",
    botRoutes
);

// =========================================================
// ..M CURRENCY
// =========================================================

app.use(
    "/currency",
    currencyRoutes
);

// مسیر سازگار با Mini App
app.use(
    "/exchange-rate",
    currencyRoutes
);

// =========================================================
// ..M DEPOSIT
// =========================================================

app.use(
    "/deposit",
    depositRoutes
);

// =========================================================
// ..M PAYMENT
// =========================================================

app.use(
    "/payment",
    paymentRoutes
);

// =========================================================
// ..M WITHDRAW
// =========================================================

app.use(
    "/withdraw",
    withdrawRoutes
);

// سازگاری با Frontend
app.use(
    "/wallet/withdraw",
    withdrawRoutes
);

// =========================================================
// ..M 404
// =========================================================

app.use((req, res) => {

    console.warn(
        `[404] ${req.method} ${req.originalUrl}`
    );

    res.status(404).json({

        success: false,

        message:
            "API route not found",

        path:
            req.originalUrl

    });

});

// =========================================================
// ..M ERROR HANDLER
// =========================================================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        console.error(
            "❌ Server Error:",
            err
        );

        res.status(
            err.status || 500
        ).json({

            success: false,

            message:
                err.message ||
                "Internal server error"

        });

    }
);

// =========================================================
// ..M START SERVER
// =========================================================

const startServer = async () => {

    try {

        await connectDatabase();

        app.listen(
            PORT,
            "0.0.0.0",
            () => {

                console.log(
                    "========================================"
                );

                console.log(
                    "🚀 AutoTrade AI Backend"
                );

                console.log(
                    `🌐 Server running on port ${PORT}`
                );

                console.log(
                    `📡 Environment: ${
                        process.env.NODE_ENV ||
                        "production"
                    }`
                );

                console.log(
                    "🗄️ MongoDB: Connected"
                );

                console.log(
                    "========================================"
                );

            }
        );

    } catch (error) {

        console.error(
            "❌ Failed to start server:"
        );

        console.error(
            error
        );

        process.exit(1);

    }

};

startServer();