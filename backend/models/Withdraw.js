// =====================================
// Withdraw Model:: M
// AutoTrade AI
// مدل درخواست برداشت
// File: backend/models/Withdraw.js
// =====================================

import mongoose from "mongoose";


const withdrawSchema = new mongoose.Schema(

    {

        // =====================================
        // کاربر:: M
        // =====================================

        userId: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref:
                "User",

            required:
                true,

            index:
                true

        },


        // =====================================
        // کیف پول:: M
        // =====================================

        walletId: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref:
                "Wallet",

            required:
                true,

            index:
                true

        },


        // =====================================
        // مبلغ برداشت به دلار:: M
        // =====================================

        amountUSD: {

            type:
                Number,

            required:
                true,

            min:
                0.01

        },


        // =====================================
        // نرخ دلار هنگام درخواست:: M
        // =====================================

        usdToTomanRate: {

            type:
                Number,

            required:
                true,

            min:
                1

        },


        // =====================================
        // مبلغ معادل به تومان:: M
        // =====================================

        amountToman: {

            type:
                Number,

            required:
                true,

            min:
                0

        },


        // =====================================
        // روش برداشت:: M
        // =====================================

        method: {

            type:
                String,

            enum: [

                "BANK",

                "CARD",

                "OTHER"

            ],

            default:
                "BANK"

        },


        // =====================================
        // شماره حساب / شبا:: M
        // =====================================

        bankAccount: {

            type:
                String,

            default:
                "",

            trim:
                true

        },


        // =====================================
        // نام صاحب حساب:: M
        // =====================================

        accountHolderName: {

            type:
                String,

            default:
                "",

            trim:
                true

        },


        // =====================================
        // وضعیت درخواست:: M
        // =====================================

        status: {

            type:
                String,

            enum: [

                "PENDING",

                "PROCESSING",

                "COMPLETED",

                "REJECTED",

                "CANCELLED",

                "FAILED"

            ],

            default:
                "PENDING",

            index:
                true

        },


        // =====================================
        // شناسه پرداخت خارجی:: M
        // =====================================

        externalPaymentId: {

            type:
                String,

            default:
                null,

            index:
                true

        },


        // =====================================
        // دلیل رد یا خطا:: M
        // =====================================

        failureReason: {

            type:
                String,

            default:
                ""

        },


        // =====================================
        // زمان پردازش:: M
        // =====================================

        processedAt: {

            type:
                Date,

            default:
                null

        }

    },

    {

        timestamps:
            true

    }

);


// =====================================
// Withdraw Model:: M
// ساخت مدل برداشت
// =====================================

const Withdraw =
    mongoose.model(

        "Withdraw",

        withdrawSchema

    );


export default Withdraw;
