// ..M server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDatabase from "./database.js";

import userRoutes from "./routes/User.js";
import walletRoutes from "./routes/Wallet.js";
import tradeRoutes from "./routes/Trade.js";
import botRoutes from "./routes/Bot.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// =========================================================
// ..M CORS
// =========================================================

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// =========================================================
// ..M BODY
// =========================================================

app.use(
  express.json({
    limit: "1mb"
  })
);

// =========================================================
// ..M DATABASE
// =========================================================

await connectDatabase();

// =========================================================
// ..M HEALTH CHECK
// =========================================================

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "AutoTrade AI Backend Running",
    realData: true,
    fakeData: false
  });
});

// =========================================================
// ..M HEALTH
// =========================================================

app.get("/health", (req, res) => {
  res.json({
    status: "online",
    database: "connected",
    timestamp: new Date().toISOString()
  });
});

// =========================================================
// ..M EXCHANGE RATE
// =========================================================

app.get("/exchange-rate", (req, res) => {
  const rawRate = process.env.USD_TOMAN_RATE;

  if (
    !rawRate ||
    Number.isNaN(Number(rawRate))
  ) {
    return res.status(503).json({
      success: false,
      message: "Exchange rate is not configured.",
      usd_toman: null
    });
  }

  return res.json({
    success: true,
    usd_toman: Number(rawRate),
    currency: "IRR",
    unit: "toman",
    source: "server-config"
  });
});

// =========================================================
// ..M ROUTES
// =========================================================

app.use("/user", userRoutes);

app.use("/wallet", walletRoutes);

app.use("/trades", tradeRoutes);

app.use("/bot", botRoutes);

// =========================================================
// ..M 404
// =========================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
    path: req.originalUrl
  });
});

// =========================================================
// ..M ERROR HANDLER
// =========================================================

app.use(
  (error, req, res, next) => {
    console.error(
      "SERVER ERROR:",
      error
    );

    if (res.headersSent) {
      return next(error);
    }

    res.status(error.status || 500).json({
      success: false,
      message:
        error.message ||
        "Internal server error."
    });
  }
);

// =========================================================
// ..M START SERVER
// =========================================================

app.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `AutoTrade AI Backend running on port ${PORT}`
    );
  }
);
