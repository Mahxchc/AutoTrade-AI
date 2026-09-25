// =====================================
// ..M
// AutoTrade AI
// Wallet Model
// File: backend/models/Wallet.js
// =====================================

import mongoose from "mongoose";


// =====================================
// ..M
// Wallet Schema
// =====================================

const walletSchema = new mongoose.Schema(
    {
        // ---------------------------------
        // ..M
        // مالک کیف پول
        // ---------------------------------

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },

        // ---------------------------------
        // ..M
        // موجودی اصلی
        // ---------------------------------

        balance: {
            type: Number,
            default: 0,
            min: 0
        },

        // ---------------------------------
        // ..M
        // سود کل
        // ---------------------------------

        totalProfit: {
            type: Number,
            default: 0
        },

        // ---------------------------------
        // ..M
        // تعداد معاملات
        // ---------------------------------

        totalTrades: {
            type: Number,
            default: 0,
            min: 0
        },

        // ---------------------------------
        // ..M
        // موجودی قابل برداشت
        // ---------------------------------

        withdrawable: {
            type: Number,
            default: 0,
            min: 0
        },

        // ---------------------------------
        // ..M
        // واحد پول
        // ---------------------------------

        currency: {
            type: String,
            enum: [
                "USDT",
                "USD"
            ],
            default: "USDT"
        },

        // ---------------------------------
        // ..M
        // وضعیت کیف پول
        // ---------------------------------

        status: {
            type: String,
            enum: [
                "ACTIVE",
                "BLOCKED",
                "FROZEN"
            ],
            default: "ACTIVE",
            index: true
        }
    },
    {
        timestamps: true
    }
);


// =====================================
// ..M
// Index
// =====================================

walletSchema.index({
    userId: 1
});


// =====================================
// ..M
// جلوگیری از مقدار NaN
// =====================================

walletSchema.pre("save", function(next) {

    const fields = [
        "balance",
        "totalProfit",
        "totalTrades",
        "withdrawable"
    ];

    for (const field of fields) {
        const value = Number(this[field]);

        if (!Number.isFinite(value)) {
            return next(
                new Error(
                    `Invalid wallet value: ${field}`
                )
            );
        }
    }

    next();
});


// =====================================
// ..M
// Export
// =====================================

const Wallet =
    mongoose.models.Wallet ||
    mongoose.model("Wallet", walletSchema);

export default Wallet;