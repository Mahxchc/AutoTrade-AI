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

const app = express();


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
            "X-Telegram-InitData"
        ]

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
// Health Check
// =====================================

app.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            status: "online",

            message:
                "AutoTrade AI Backend Running 🚀",

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

            res.json({

                success: true,

                status: "healthy",

                database:
                    "connected",

                timestamp:
                    new Date().toISOString()

            });

        }

        catch (error) {

            console.error(
                "Health check error:",
                error
            );

            res.status(500).json({

                success: false,

                status: "unhealthy"

            });

        }

    }
);


// =====================================
// API Routes
// =====================================

app.use(
    "/api/auth",
    authRoutes
);


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


app.use(
    "/api/currency",
    currencyRoutes
);


app.use(
    "/api/deposit",
    depositRoutes
);


app.use(
    "/api/payment",
    paymentRoutes
);


app.use(
    "/api/withdraw",
    withdrawRoutes
);


// =====================================
// 404 Handler
// =====================================

app.use(
    (req, res) => {

        res.status(404).json({

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

    (error, req, res, next) => {

        console.error(
            "GLOBAL ERROR:",
            error
        );


        if (res.headersSent) {

            return next(error);

        }


        res.status(
            error.status || 500
        ).json({

            success: false,

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
    process.env.PORT || 3000;


async function startServer() {

    try {

        // ---------------------------------
        // Connect MongoDB
        // ---------------------------------

        await connectDatabase();


        console.log(
            "MongoDB connected successfully"
        );


        // ---------------------------------
        // Start Express
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


        process.exit(1);

    }

}


startServer();