// =====================================
// AutoTrade AI
// Deposit Service :: M
// سرویس مدیریت واریز
// File: backend/services/depositService.js
// =====================================

import mongoose from "mongoose";

import Deposit from "../models/Deposit.js";
import Wallet from "../models/Wallet.js";


// =====================================
// Helpers
// =====================================

function toPositiveNumber(value, message) {

    const number =
        Number(value);

    if (
        !Number.isFinite(number) ||
        number <= 0
    ) {

        throw new Error(message);

    }

    return number;

}


// =====================================
// Create Deposit
// ایجاد درخواست واریز
// =====================================
//
// تومان -> USDT
//
// نکته:
// در این مرحله Wallet شارژ نمی‌شود.
// فقط بعد از تأیید واقعی پرداخت شارژ خواهد شد.
// =====================================

export async function createDeposit({

    userId,

    amountToman,

    exchangeRate,

    method = "GATEWAY",

    gateway = null

}) {

    // =====================================
    // Validate User ID
    // =====================================

    if (
        !mongoose.Types.ObjectId.isValid(
            userId
        )
    ) {

        throw new Error(
            "شناسه کاربر نامعتبر است"
        );

    }


    // =====================================
    // Validate Amount
    // =====================================

    const toman =
        toPositiveNumber(
            amountToman,
            "مبلغ واریز نامعتبر است"
        );


    // =====================================
    // Validate Exchange Rate
    // =====================================

    const rate =
        toPositiveNumber(
            exchangeRate,
            "نرخ دلار نامعتبر است"
        );


    // =====================================
    // Validate Payment Method
    // =====================================

    const allowedMethods = [

        "BANK",
        "GATEWAY",
        "OTHER"

    ];


    if (
        !allowedMethods.includes(
            method
        )
    ) {

        throw new Error(
            "روش پرداخت نامعتبر است"
        );

    }


    // =====================================
    // Calculate USDT
    // =====================================

    const amountUSD =
        Number(
            (
                toman / rate
            ).toFixed(8)
        );


    if (
        !Number.isFinite(amountUSD) ||
        amountUSD <= 0
    ) {

        throw new Error(
            "مبلغ معادل دلار نامعتبر است"
        );

    }


    // =====================================
    // Create Deposit
    // =====================================

    const deposit =
        await Deposit.create({

            userId,

            amountToman:
                toman,

            amountUSD,

            exchangeRate:
                rate,

            method,

            gateway:
                gateway || null,

            status:
                "PENDING",

            walletCredited:
                false,

            confirmedAt:
                null

        });


    return deposit;

}


// =====================================
// Confirm Deposit
// تأیید و شارژ کیف پول
// =====================================
//
// این تابع فقط باید بعد از تأیید واقعی
// پرداخت توسط سیستم پرداخت اجرا شود.
//
// PENDING
//    ↓
// COMPLETED
//    ↓
// Wallet + amountUSD
//
// =====================================

export async function confirmDeposit({

    depositId,

    paymentId = null,

    transactionId = null,

    gateway = null

}) {

    // =====================================
    // Validate Deposit ID
    // =====================================

    if (
        !mongoose.Types.ObjectId.isValid(
            depositId
        )
    ) {

        throw new Error(
            "شناسه واریز نامعتبر است"
        );

    }


    // =====================================
    // Find Deposit
    // =====================================

    const deposit =
        await Deposit.findById(
            depositId
        );


    if (!deposit) {

        throw new Error(
            "درخواست واریز پیدا نشد"
        );

    }


    // =====================================
    // Already Credited
    // =====================================
    //
    // جلوگیری از شارژ دوباره کیف پول
    //
    // =====================================

    if (
        deposit.walletCredited === true ||
        deposit.status === "COMPLETED"
    ) {

        const wallet =
            await Wallet.findOne({

                userId:
                    deposit.userId

            });


        return {

            deposit,

            wallet,

            alreadyCredited:
                true

        };

    }


    // =====================================
    // Only Pending / Processing
    // =====================================

    if (
        deposit.status !== "PENDING" &&
        deposit.status !== "PROCESSING"
    ) {

        throw new Error(
            "این درخواست واریز قابل تأیید نیست"
        );

    }


    // =====================================
    // Validate Deposit Amount
    // =====================================

    const amountUSD =
        Number(
            deposit.amountUSD
        );


    if (
        !Number.isFinite(amountUSD) ||
        amountUSD <= 0
    ) {

        throw new Error(
            "مبلغ دلاری واریز نامعتبر است"
        );

    }


    // =====================================
    // Find Wallet
    // =====================================

    const wallet =
        await Wallet.findOne({

            userId:
                deposit.userId

        });


    if (!wallet) {

        throw new Error(
            "کیف پول کاربر پیدا نشد"
        );

    }


    // =====================================
    // Current Wallet Balance
    // =====================================

    const currentBalance =
        Number(
            wallet.balance || 0
        );


    if (
        !Number.isFinite(
            currentBalance
        ) ||
        currentBalance < 0
    ) {

        throw new Error(
            "موجودی کیف پول نامعتبر است"
        );

    }


    // =====================================
    // Credit Wallet
    // =====================================

    const newBalance =
        Number(
            (
                currentBalance +
                amountUSD
            ).toFixed(8)
        );


    wallet.balance =
        newBalance;


    // =====================================
    // Save Wallet
    // =====================================

    await wallet.save();


    // =====================================
    // Complete Deposit
    // =====================================

    deposit.status =
        "COMPLETED";


    deposit.walletCredited =
        true;


    deposit.confirmedAt =
        new Date();


    // =====================================
    // Payment Information
    // =====================================

    if (paymentId) {

        deposit.paymentId =
            String(paymentId);

    }


    if (transactionId) {

        deposit.transactionId =
            String(transactionId);

    }


    if (gateway) {

        deposit.gateway =
            String(gateway);

    }


    // =====================================
    // Save Deposit
    // =====================================

    await deposit.save();


    // =====================================
    // Result
    // =====================================

    return {

        deposit,

        wallet,

        alreadyCredited:
            false,

        creditedAmountUSD:
            amountUSD,

        newBalanceUSD:
            newBalance

    };

}


// =====================================
// Get User Deposits
// دریافت واریزهای کاربر
// =====================================

export async function getUserDeposits(
    userId
) {

    // =====================================
    // Validate User ID
    // =====================================

    if (
        !mongoose.Types.ObjectId.isValid(
            userId
        )
    ) {

        throw new Error(
            "شناسه کاربر نامعتبر است"
        );

    }


    // =====================================
    // Get Deposits
    // =====================================

    const deposits =
        await Deposit.find({

            userId

        })
        .sort({

            createdAt:
                -1

        })
        .limit(100);


    return deposits;

}


// =====================================
// Get Single Deposit
// دریافت یک واریز
// =====================================

export async function getDepositById({

    depositId,

    userId = null

}) {

    // =====================================
    // Validate Deposit ID
    // =====================================

    if (
        !mongoose.Types.ObjectId.isValid(
            depositId
        )
    ) {

        throw new Error(
            "شناسه واریز نامعتبر است"
        );

    }


    // =====================================
    // Build Query
    // =====================================

    const query = {

        _id:
            depositId

    };


    if (userId !== null) {

        if (
            !mongoose.Types.ObjectId.isValid(
                userId
            )
        ) {

            throw new Error(
                "شناسه کاربر نامعتبر است"
            );

        }


        query.userId =
            userId;

    }


    // =====================================
    // Find Deposit
    // =====================================

    const deposit =
        await Deposit.findOne(
            query
        );


    if (!deposit) {

        throw new Error(
            "واریز پیدا نشد"
        );

    }


    return deposit;

}


// =====================================
// Mark Deposit Processing
// انتقال واریز به حالت پردازش
// =====================================

export async function markDepositProcessing({

    depositId

}) {

    if (
        !mongoose.Types.ObjectId.isValid(
            depositId
        )
    ) {

        throw new Error(
            "شناسه واریز نامعتبر است"
        );

    }


    const deposit =
        await Deposit.findById(
            depositId
        );


    if (!deposit) {

        throw new Error(
            "واریز پیدا نشد"
        );

    }


    if (
        deposit.walletCredited === true
    ) {

        return deposit;

    }


    if (
        deposit.status !== "PENDING"
    ) {

        throw new Error(
            "این واریز در وضعیت قابل پردازش نیست"
        );

    }


    deposit.status =
        "PROCESSING";


    await deposit.save();


    return deposit;

}


// =====================================
// Fail Deposit
// ناموفق کردن واریز
// =====================================

export async function failDeposit({

    depositId,

    description = ""

}) {

    if (
        !mongoose.Types.ObjectId.isValid(
            depositId
        )
    ) {

        throw new Error(
            "شناسه واریز نامعتبر است"
        );

    }


    const deposit =
        await Deposit.findById(
            depositId
        );


    if (!deposit) {

        throw new Error(
            "واریز پیدا نشد"
        );

    }


    // =====================================
    // Never Fail Credited Deposit
    // =====================================

    if (
        deposit.walletCredited === true ||
        deposit.status === "COMPLETED"
    ) {

        throw new Error(
            "واریز تکمیل شده را نمی‌توان ناموفق کرد"
        );

    }


    deposit.status =
        "FAILED";


    if (description) {

        deposit.description =
            String(description);

    }


    await deposit.save();


    return deposit;

}


// =====================================
// Cancel Deposit
// لغو واریز
// =====================================

export async function cancelDeposit({

    depositId,

    description = ""

}) {

    if (
        !mongoose.Types.ObjectId.isValid(
            depositId
        )
    ) {

        throw new Error(
            "شناسه واریز نامعتبر است"
        );

    }


    const deposit =
        await Deposit.findById(
            depositId
        );


    if (!deposit) {

        throw new Error(
            "واریز پیدا نشد"
        );

    }


    // =====================================
    // Prevent Cancelling Completed Deposit
    // =====================================

    if (
        deposit.walletCredited === true ||
        deposit.status === "COMPLETED"
    ) {

        throw new Error(
            "واریز تکمیل شده را نمی‌توان لغو کرد"
        );

    }


    deposit.status =
        "CANCELLED";


    if (description) {

        deposit.description =
            String(description);

    }


    await deposit.save();


    return deposit;

}