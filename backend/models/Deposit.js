// =====================================
// Deposit Model:: M
// AutoTrade AI
// مدل دیتابیس واریز
// File: backend/models/Deposit.js
// =====================================

import mongoose from "mongoose";


const depositSchema = new mongoose.Schema(

    {

        // =====================================
        // User:: M
        // کاربر
        // =====================================

        userId: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,

            index: true

        },


        // =====================================
        // Wallet:: M
        // کیف پول
        // =====================================

        walletId: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "Wallet",

            required: true,

            index: true

        },


        // =====================================
        // Deposit Amount:: M
        // مبلغ واریز
        // =====================================

        amountUSD: {

            type: Number,

            required: true,

            min: 0

        },


        // =====================================
        // Currency Rate:: M
        // نرخ دلار هنگام واریز
        // =====================================

        usdToTomanRate: {

            type: Number,

            required: true,

            min: 0

        },


        // =====================================
        // Toman Amount:: M
        // مبلغ تومانی
        // =====================================

        amountToman: {

            type: Number,

            required: true,

            min: 0

        },


        // =====================================
        // Payment Method:: M
        // روش پرداخت
        // =====================================

        method: {

            type: String,

            enum: [

                "BANK",

                "GATEWAY",

                "CRYPTO",

                "OTHER"

            ],

            default: "BANK"

        },


        // =====================================
        // External Payment ID:: M
        // شناسه پرداخت
        // =====================================

        externalPaymentId: {

            type: String,

            default: null,

            index: true

        },


        // =====================================
        // Status:: M
        // وضعیت واریز
        // =====================================

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

            index: true

        },


        // =====================================
        // Failure Reason:: M
        // دلیل خطا
        // =====================================

        failureReason: {

            type: String,

            default: ""

        },


        // =====================================
        // Payment Reference:: M
        // کد پیگیری پرداخت
        // =====================================

        paymentReference: {

            type: String,

            default: "",

            trim: true

        },


        // =====================================
        // Completed At:: M
        // زمان تکمیل
        // =====================================

        completedAt: {

            type: Date,

            default: null

        }

    },

    {

        timestamps: true

    }

);


// =====================================
// Deposit Model:: M
// =====================================

const Deposit = mongoose.model(

    "Deposit",

    depositSchema

);


export default Deposit;
