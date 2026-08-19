// ..M server.js

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
// ..M MIDDLEWARE
// =========================================================

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================================================
// ..M HEALTH CHECK
// =========================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    status: "online",
    message: "AutoTrade AI Backend Running 🚀",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// =========================================================
// ..M API ROUTES
// =========================================================

app.use("/user", userRoutes);
app.use("/wallet", walletRoutes);
app.use("/trade", tradeRoutes);
app.use("/bot", botRoutes);
app.use("/currency", currencyRoutes);
app.use("/deposit", depositRoutes);
app.use("/payment", paymentRoutes);
app.use("/withdraw", withdrawRoutes);

// =========================================================
// ..M 404 HANDLER
// =========================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

// =========================================================
// ..M ERROR HANDLER
// =========================================================

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// =========================================================
// ..M DATABASE + START SERVER
// =========================================================

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, "0.0.0.0", () => {
      console.log("========================================");
      console.log("🚀 AutoTrade AI Backend");
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || "production"}`);
      console.log("========================================");
    });
  } catch (error) {
    console.error("❌ Failed to start server:");
    console.error(error);

    process.exit(1);
  }
};

startServer();
