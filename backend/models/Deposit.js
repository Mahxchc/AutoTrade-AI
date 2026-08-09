// =====================================
// AutoTrade AI
// Deposit Model:: M
// مدل واریز
// File: backend/models/Deposit.js
// =====================================

import mongoose from "mongoose";


// =====================================
// Deposit Schema:: M
// ساختار اطلاعات واریز
// =====================================

const depositSchema =
    new mongoose.Schema(

        {

            // =====================================
            // User:: M
            // کاربر
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
            // Amount USD:: M
            // مبلغ دلار
            // =====================================

            amountUSD: {

                type:
                    Number,

                required:
                    true,

                min:
                    0

            },


            // =====================================
            // USD To Toman Rate:: M
            // نرخ دلار به تومان
            // =====================================

            usdToTomanRate: {

                type:
                    Number,

                required:
                    true,

                min:
                    0

            },


            // =====================================
            // Amount Toman:: M
            // مبلغ معادل تومان
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
            // Payment Method:: M
            // روش پرداخت
            // =====================================

            method: {

                type:
                    String,

                enum: [

                    "BANK",

                    "CARD",

                    "ONLINE",

                    "CRYPTO",

                    "OTHER"

                ],

                default:
                    "BANK"

            },


            // =====================================
            // Deposit Status:: M
            // وضعیت واریز
            // =====================================

            status: {

                type:
                    String,

                enum: [

                    "PENDING",

                    "PROCESSING",

                    "COMPLETED",

                    "FAILED",

                    "CANCELLED"

                ],

                default:
                    "PENDING",

                index:
                    true

            },


            // =====================================
            // Payment ID:: M
            // شناسه پرداخت
            // =====================================

            paymentId: {

                type:
                    String,

                default:
                    null,

                index:
                    true

            },


            // =====================================
            // Transaction ID:: M
            // شناسه تراکنش
            // =====================================

            transactionId: {

                type:
                    String,

                default:
                    null,

                index:
                    true

            },


            // =====================================
            // Gateway:: M
            // درگاه پرداخت
            // =====================================

            gateway: {

                type:
                    String,

                default:
                    null

            },


            // =====================================
            // Wallet Credited:: M
            // آیا موجودی شارژ شده؟
            // =====================================

            walletCredited: {

                type:
                    Boolean,

                default:
                    false,

                index:
                    true

            },


            // =====================================
            // Confirmed At:: M
            // زمان تأیید
            // =====================================

            confirmedAt: {

                type:
                    Date,

                default:
                    null

            },


            // =====================================
            // Failure Reason:: M
            // دلیل شکست
            // =====================================

            failureReason: {

                type:
                    String,

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
// Deposit Model:: M
// مدل واریز
// =====================================

const Deposit =
    mongoose.model(

        "Deposit",

        depositSchema

    );


// =====================================
// Export:: M
// خروجی مدل
// =====================================

export default Deposit;
