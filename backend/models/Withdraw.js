// =====================================
// ..M AutoTrade AI
// Withdraw Model
// مدل برداشت تومان
// File: backend/models/Withdraw.js
// =====================================

import mongoose from "mongoose";


// =====================================
// WITHDRAW SCHEMA
// =====================================

const withdrawSchema = new mongoose.Schema(
    {

        // =====================================
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
        // مبلغ برداشت
        // واحد: تومان
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
        // شماره شبا
        // =====================================

        iban: {

            type:
                String,

            required:
                true,

            trim:
                true,

            uppercase:
                true

        },


        // =====================================
        // توضیحات کاربر
        // =====================================

        description: {

            type:
                String,

            default:
                "",

            trim:
                true,

            maxlength:
                500

        },


        // =====================================
        // وضعیت برداشت
        // =====================================

        status: {

            type:
                String,

            enum: [

                "PENDING",

                "APPROVED",

                "REJECTED",

                "PAID"

            ],

            default:
                "PENDING",

            index:
                true

        },


        // =====================================
        // شناسه تراکنش پرداخت
        // در صورت پرداخت واقعی
        // =====================================

        transactionId: {

            type:
                String,

            default:
                null,

            trim:
                true

        },


        // =====================================
        // دلیل رد شدن
        // =====================================

        rejectionReason: {

            type:
                String,

            default:
                null,

            trim:
                true,

            maxlength:
                500

        },


        // =====================================
        // زمان پردازش
        // =====================================

        processedAt: {

            type:
                Date,

            default:
                null

        },


        // =====================================
        // زمان پرداخت واقعی
        // =====================================

        paidAt: {

            type:
                Date,

            default:
                null

        }

    },

    {

        // =====================================
        // زمان ایجاد و بروزرسانی
        // =====================================

        timestamps:
            true

    }
);


// =====================================
// INDEX
// جستجوی سریع برداشت‌های کاربر
// =====================================

withdrawSchema.index({

    userId:
        1,

    createdAt:
        -1

});


// =====================================
// جلوگیری از مدل تکراری در محیط توسعه
// =====================================

const Withdraw =
    mongoose.models.Withdraw ||
    mongoose.model(
        "Withdraw",
        withdrawSchema
    );


// =====================================
// EXPORT
// =====================================

export default Withdraw;