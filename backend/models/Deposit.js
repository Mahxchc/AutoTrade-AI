// =====================================
// AutoTrade AI
// Deposit Model:: M
// مدل واریز
// File: backend/models/Deposit.js
// =====================================

import mongoose from "mongoose";


const depositSchema =
    new mongoose.Schema(

        {

            // =====================================
            // User Reference:: M
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
            // Amount Toman:: M
            // مبلغ به تومان
            // =====================================

            amountToman: {

                type:
                    Number,

                required:
                    true,

                min:
                    1

            },


            // =====================================
            // Amount USD:: M
            // مبلغ معادل دلار
            // =====================================

            amountUSD: {

                type:
                    Number,

                default:
                    0,

                min:
                    0

            },


            // =====================================
            // Exchange Rate:: M
            // نرخ تبدیل دلار
            // =====================================

            exchangeRate: {

                type:
                    Number,

                default:
                    0,

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

                    "GATEWAY",

                    "OTHER"

                ],

                default:
                    "GATEWAY"

            },


            // =====================================
            // Payment Gateway:: M
            // درگاه پرداخت
            // =====================================

            gateway: {

                type:
                    String,

                default:
                    null,

                trim:
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
                    true,

                trim:
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
                    true,

                trim:
                    true

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
            // Wallet Credited:: M
            // آیا کیف پول شارژ شده؟
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
            // Confirmation Time:: M
            // زمان تأیید
            // =====================================

            confirmedAt: {

                type:
                    Date,

                default:
                    null

            },


            // =====================================
            // Description:: M
            // توضیحات
            // =====================================

            description: {

                type:
                    String,

                default:
                    "",

                trim:
                    true

            }

        },

        {

            timestamps:
                true

        }

    );


// =====================================
// Deposit Model:: M
// مدل نهایی
// =====================================

const Deposit =
    mongoose.model(
        "Deposit",
        depositSchema
    );


export default Deposit;
