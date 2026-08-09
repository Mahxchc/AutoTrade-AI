// =====================================
// AutoTrade AI
// Bot Model
// =====================================

import mongoose from "mongoose";

const botSchema = new mongoose.Schema(
    {
        // =====================================
        // Owner
        // =====================================

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },

        // =====================================
        // Bot Status
        // =====================================

        status: {
            type: String,
            enum: [
                "ACTIVE",
                "STOPPED",
                "ERROR"
            ],
            default: "STOPPED",
            index: true
        },

        // =====================================
        // Trading Strategy
        // =====================================

        strategy: {
            type: String,
            default: "AI Scalping",
            trim: true
        },

        market: {
            type: String,
            enum: [
                "crypto",
                "forex",
                "stocks",
                "other"
            ],
            default: "crypto",
            index: true
        },

        // =====================================
        // Risk
        // =====================================

        riskLevel: {
            type: String,
            enum: [
                "LOW",
                "MEDIUM",
                "HIGH"
            ],
            default: "MEDIUM"
        },

        // =====================================
        // AI Signal
        // =====================================

        lastSignal: {
            type: String,
            enum: [
                "BUY",
                "SELL",
                "HOLD",
                "WAIT"
            ],
            default: "WAIT"
        },

        accuracy: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        confidence: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        // =====================================
        // Engine Monitoring
        // =====================================

        lastRun: {
            type: Date,
            default: null
        },

        lastHeartbeat: {
            type: Date,
            default: null
        },

        lastError: {
            type: String,
            default: null
        },

        // =====================================
        // Statistics
        // =====================================

        totalTrades: {
            type: Number,
            default: 0,
            min: 0
        },

        winningTrades: {
            type: Number,
            default: 0,
            min: 0
        },

        losingTrades: {
            type: Number,
            default: 0,
            min: 0
        },

        totalProfit: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Bot = mongoose.model("Bot", botSchema);

export default Bot;
