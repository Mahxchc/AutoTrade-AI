import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDatabase from "./BACKEND__database.js";
import { requireTelegramUser, requireApprovedUser } from "./BACKEND__middleware__auth.js";
import { handleTelegramUpdate, setupTelegramWebhook, setupTelegramCommands } from "./BACKEND__bot.js";
import authRoutes from "./BACKEND__routes__auth.js";
import userRoutes from "./BACKEND__routes__user.js";
import adminRoutes from "./BACKEND__routes__admin.js";

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 10000);
app.set("trust proxy", 1);
app.disable("x-powered-by");

const allowedOrigins = [process.env.FRONTEND_URL, process.env.MINI_APP_URL].filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Telegram-Init-Data", "X-Telegram-InitData"]
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (_req, res) => res.json({ success: true, status: "online", message: "AutoTrade AI Backend Running", timestamp: new Date().toISOString() }));
app.get("/health", (_req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({ success: connected, status: connected ? "healthy" : "unhealthy", database: connected ? "connected" : "disconnected", mongoState: mongoose.connection.readyState, timestamp: new Date().toISOString() });
});

// Telegram webhook used only for registration/approval workflow.
app.post("/api/webhook/telegram", async (req, res) => {
  try { await handleTelegramUpdate(req.body); } catch (error) { console.error("TELEGRAM WEBHOOK ERROR:", error); }
  res.status(200).json({ success: true });
});
app.post("/api/telegram/webhook", async (req, res) => {
  try { await handleTelegramUpdate(req.body); } catch (error) { console.error("TELEGRAM WEBHOOK ERROR:", error); }
  res.status(200).json({ success: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", requireTelegramUser, userRoutes);

// Financial/trading routes are intentionally not mounted in this deployment-safe build.
app.get("/api/access", requireTelegramUser, requireApprovedUser, (req, res) => {
  res.json({ success: true, approved: true, telegramId: req.telegramId, admin: !!req.isAdmin, owner: !!req.isOwner });
});

app.use((err, _req, res, _next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ success: false, message: "خطای داخلی سرور" });
});

async function start() {
  try {
    if (process.env.MONGO_URI) {
      await connectDatabase();
      console.log("MongoDB connected");
    } else {
      console.warn("MONGO_URI is not configured; starting without database connection.");
    }
    app.listen(PORT, "0.0.0.0", async () => {
      console.log(`AutoTrade AI backend listening on ${PORT}`);
      try {
        await setupTelegramCommands();
        await setupTelegramWebhook();
      } catch (error) {
        console.error("Telegram setup error:", error.message);
      }
    });
  } catch (error) {
    console.error("Startup error:", error);
    process.exit(1);
  }
}

start();
export default app;
