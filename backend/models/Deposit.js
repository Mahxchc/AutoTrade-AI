 // =====================================
 // AutoTrade AI
 // Deposit Model :: M
 // مدل دیتابیس واریز
 // File: backend/models/Deposit.js
 // =====================================

import mongoose from "mongoose";


const depositSchema =
    new mongoose.Schema(

        {

            // =====================================
            // User Reference :: M
            // کاربر صاحب واریز
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
            // Amount Toman :: M
            // مبلغ پرداختی به تومان
            // =====================================

            amountToman: {

                type:
                    Number,

                required:
                    true,

                min:
                    0.01

            },


            // =====================================
            // Amount USD :: M
            // معادل دلار
            // =====================================

            amountUSD: {

                type:
                    Number,

                required:
                    true,

                min:
                    0.00000001

            },


            // =====================================
            // Amount USDT :: M
            // مقدار نهایی USDT
            // =====================================

            amountUSDT: {

                type:
                    Number,

                required:
                    true,

                min:
                    0.00000001

            },


            // =====================================
            // Exchange Rate :: M
            // نرخ دلار در زمان ایجاد واریز
            // =====================================

            exchangeRate: {

                type:
                    Number,

                required:
                    true,

                min:
                    0.00000001

            },


            // =====================================
            // Payment Method :: M
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
                    "GATEWAY",

                uppercase:
                    true,

                trim:
                    true

            },


            // =====================================
            // Gateway :: M
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
            // Payment ID :: M
            // شناسه پرداخت
            // =====================================

            paymentId: {

                type:
                    String,

                default:
                    null,

                trim:
                    true,

                index:
                    true

            },


            // =====================================
            // Transaction ID :: M
            // شناسه تراکنش
            // =====================================

            transactionId: {

                type:
                    String,

                default:
                    null,

                trim:
                    true,

                index:
                    true

            },


            // =====================================
            // Deposit Status :: M
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
            // Wallet Credited :: M
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
            // Confirmed At :: M
            // زمان تأیید پرداخت
            // =====================================

            confirmedAt: {

                type:
                    Date,

                default:
                    null

            },


            // =====================================
            // Description :: M
            // توضیحات
            // =====================================

            description: {

                type:
                    String,

                default:
                    "",

                trim:
                    true,

                maxlength:
                    1000

            }

        },

        {

            timestamps:
                true

        }

    );


// =====================================
// Deposit Indexes :: M
// =====================================

depositSchema.index({

    userId:
        1,

    createdAt:
        -1

});


depositSchema.index({

    status:
        1,

    walletCredited:
        1

});


// =====================================
// Deposit Model :: M
// =====================================

const Deposit =
    mongoose.model(

        "Deposit",

        depositSchema

    );


export default Deposit;