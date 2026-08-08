// =====================================
// AutoTrade AI
// Wallet Model
// MongoDB / Mongoose
// =====================================

import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
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
        // Balance
        // =====================================

        balance: {
            type: Number,
            default: 0,
            min: 0
        },

        // =====================================
        // Total Profit
        // =====================================

        totalProfit: {
            type: Number,
            default: 0
        },

        // =====================================
        // Total Trades
        // =====================================

        totalTrades: {
            type: Number,
            default: 0,
            min: 0
        },

        // =====================================
        // Withdrawable Balance
        // =====================================

        withdrawable: {
            type: Number,
            default: 0,
            min: 0
        },

        // =====================================
        // Currency
        // =====================================

        currency: {
            type: String,
            default: "USDT",
            uppercase: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Wallet = mongoose.model("Wallet", walletSchema);

export default Wallet;
