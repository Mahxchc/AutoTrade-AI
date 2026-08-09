// =====================================
// Wallet Model:: M
// AutoTrade AI
// مدل دیتابیس کیف پول
// File: backend/models/Wallet.js
// =====================================

import mongoose from "mongoose";


const walletSchema = new mongoose.Schema(

    {

        // =====================================
        // User Reference:: M
        // ارتباط با کاربر
        // =====================================

        userId: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,

            unique: true,

            index: true

        },


        // =====================================
        // Balance:: M
        // موجودی کل
        // =====================================

        balance: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Withdrawable:: M
        // کل موجودی قابل برداشت
        // =====================================

        withdrawable: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Total Profit:: M
        // مجموع سود و زیان معاملات
        // =====================================

        totalProfit: {

            type: Number,

            default: 0

        },


        // =====================================
        // Total Trades:: M
        // تعداد معاملات
        // =====================================

        totalTrades: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Currency:: M
        // واحد پول
        // =====================================

        currency: {

            type: String,

            default: "USDT",

            uppercase: true,

            trim: true

        },


        // =====================================
        // Wallet Status:: M
        // وضعیت کیف پول
        // =====================================

        status: {

            type: String,

            enum: [

                "ACTIVE",

                "LOCKED"

            ],

            default: "ACTIVE"

        }

    },

    {

        timestamps: true

    }

);


// =====================================
// Wallet Model:: M
// =====================================

const Wallet = mongoose.model(

    "Wallet",

    walletSchema

);


export default Wallet;
