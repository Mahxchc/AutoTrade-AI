// ..M server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDatabase from "./database.js";

import userRoutes from "./routes/userRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import tradeRoutes from "./routes/tradeRoutes.js";
import botRoutes from "./routes/botRoutes.js";

dotenv.config();

const app = express();

const PORT =
    process.env.PORT || 3000;


/* =========================================================
   CORS
========================================================= */

app.use(
    cors({
        origin: true,
        credentials: true
    })
);


/* =========================================================
   BODY
========================================================= */

app.use(
    express.json({
        limit: "1mb"
    })
);


/* =========================================================
   DATABASE
========================================================= */

await connectDatabase();


/* =========================================================
   HEALTH CHECK
========================================================= */

app.get(
    "/",
    (req, res) => {

        res.json({
            status: "online",
            message: "AutoTrade AI Backend Running",
            realData: true,
            fakeData: false
        });

    }
);


/* =========================================================
   HEALTH
========================================================= */

app.get(
    "/health",
    (req, res) => {

        res.json({
            status: "online",
            database:
                "connected",
            timestamp:
                new Date().toISOString()
        });

    }
);


/* =========================================================
   EXCHANGE RATE
========================================================= */

/*
   نرخ دلار را از ENV می‌خوانیم.

   مثال Render:

   USD_TOMAN_RATE=95000

   اگر این مقدار تنظیم نشده باشد،
   هیچ نرخ ساختگی نمایش داده نمی‌شود.
*/

app.get(
    "/exchange-rate",
    (req, res) => {

        const rawRate =
            process.env.USD_TOMAN_RATE;


        if (
            !rawRate ||
            Number.isNaN(
                Number(rawRate)
            )
        ) {

            return res.status(503).json({

                success: false,

                message:
                    "Exchange rate is not configured.",

                usd_toman:
                    null

            });

        }


        return res.json({

            success: true,

            usd_toman:
                Number(rawRate),

            currency:
                "IRR",

            unit:
                "toman",

            source:
                "server-config"

        });

    }
);


/* =========================================================
   ROUTES
========================================================= */

app.use(
    "/user",
    userRoutes
);


app.use(
    "/wallet",
    walletRoutes
);


app.use(
    "/trades",
    tradeRoutes
);


app.use(
    "/bot",
    botRoutes
);


/* =========================================================
   404
========================================================= */

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found.",

            path:
                req.originalUrl

        });

    }
);


/* =========================================================
   ERROR HANDLER
========================================================= */

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "SERVER ERROR:",
            error
        );


        if (
            res.headersSent
        ) {

            return next(
                error
            );

        }


        res.status(
            error.status || 500
        ).json({

            success: false,

            message:
                error.message ||
                "Internal server error."

        });

    }
);


/* =========================================================
   START SERVER
========================================================= */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `AutoTrade AI Backend running on port ${PORT}`
        );

    }
);
