// =====================================
// ..M
// AutoTrade AI
// Withdraw Model
// File: backend/models/Withdraw.js
// =====================================

import mongoose from "mongoose";


// =====================================
// ..M
// Schema
// =====================================

const withdrawSchema = new mongoose.Schema(
    {
        // ---------------------------------
        // ..M
        // کاربر
        // ---------------------------------

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // ---------------------------------
        // ..M
        // کیف پول
        // ---------------------------------

        walletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wallet",
            required: true,
            index: true
        },

        // ---------------------------------
        // ..M
        // مقدار برداشت
        // ---------------------------------

        amountUSD: {
            type: Number,
            required: true,
            min: 0
        },

        amountToman: {
            type: Number,
            required: true,
            min: 0
        },

        // ---------------------------------
        // ..M
        // نرخ تبدیل
        // ---------------------------------

        usdToTomanRate: {
            type: Number,
            required: true,
            min: 0
        },

        // ---------------------------------
        // ..M
        // روش برداشت
        // ---------------------------------

        method: {
            type: String,
            enum: [
                "BANK",
                "GATEWAY",
                "OTHER"
            ],
            default: "BANK",
            required: true
        },

        // ---------------------------------
        // ..M
        // اطلاعات بانکی
        // ---------------------------------

        bankAccount: {
            type: String,
            trim: true,
            default: ""
        },

        accountHolderName: {
            type: String,
            trim: true,
            maxlength: 150,
            default: ""
        },

        // ---------------------------------
        // ..M
        // وضعیت برداشت
        // ---------------------------------

        status: {
            type: String,
            enum: [
                "PENDING",
                "PROCESSING",
                "COMPLETED",
                "FAILED",
                "CANCELLED"
            ],
            default: "PENDING",
            required: true,
            index: true
        },

        // ---------------------------------
        // ..M
        // شناسه تراکنش پرداخت
        // ---------------------------------

        transactionId: {
            type: String,
            trim: true,
            default: ""
        },

        // ---------------------------------
        // ..M
        // توضیحات
        // ---------------------------------

        description: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        },

        // ---------------------------------
        // ..M
        // زمان پردازش
        // ---------------------------------

        processedAt: {
            type: Date,
            default: null
        }
    },

    {
        timestamps: true
    }
);


// =====================================
// ..M
// Indexها
// =====================================

withdrawSchema.index({
    userId: 1,
    createdAt: -1
});

withdrawSchema.index({
    status: 1,
    createdAt: -1
});

withdrawSchema.index({
    walletId: 1,
    createdAt: -1
});


// =====================================
// ..M
// Export
// =====================================

const Withdraw =
    mongoose.models.Withdraw ||
    mongoose.model("Withdraw", withdrawSchema);

export default Withdraw;