// =====================================
// AutoTrade AI
// Trade Model
// =====================================

import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
    {
        // =====================================
        // User
        // =====================================

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // =====================================
        // Market
        // =====================================

        symbol: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            index: true
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
        // Trade Side
        // =====================================

        side: {
            type: String,
            enum: [
                "BUY",
                "SELL"
            ],
            required: true
        },

        // =====================================
        // Quantity
        // =====================================

        quantity: {
            type: Number,
            required: true,
            min: 0
        },

        // =====================================
        // Prices
        // =====================================

        entryPrice: {
            type: Number,
            default: null,
            min: 0
        },

        exitPrice: {
            type: Number,
            default: null,
            min: 0
        },

        // =====================================
        // Profit / Loss
        // =====================================

        profit: {
            type: Number,
            default: 0
        },

        // =====================================
        // Trade Status
        // =====================================

        status: {
            type: String,
            enum: [
                "OPEN",
                "CLOSED",
                "CANCELLED",
                "FAILED"
            ],
            default: "OPEN",
            index: true
        },

        // =====================================
        // External Broker / Exchange
        // =====================================

        externalOrderId: {
            type: String,
            default: null,
            index: true
        },

        externalStatus: {
            type: String,
            default: null
        },

        // =====================================
        // Timestamps
        // =====================================

        openedAt: {
            type: Date,
            default: Date.now
        },

        closedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Trade = mongoose.model(
    "Trade",
    tradeSchema
);

export default Trade;
