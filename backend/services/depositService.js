// =====================================
// Deposit Service:: M
// AutoTrade AI
// سرویس مدیریت واریز
// File: backend/services/depositService.js
// =====================================

import mongoose from "mongoose";

import Deposit from "../models/Deposit.js";
import Wallet from "../models/Wallet.js";


// =====================================
// Create Deposit Request:: M
// ایجاد درخواست واریز
// =====================================

export async function createDepositRequest({

    userId,

    amountUSD,

    usdToTomanRate,

    method = "BANK"

}) {

    // =====================================
    // بررسی User ID:: M
    // =====================================

    if (
        !mongoose.Types.ObjectId.isValid(
            userId
        )
    ) {

        throw new Error(
            "Invalid user ID"
        );

    }


    // =====================================
    // بررسی مبلغ دلار:: M
    // =====================================

    const numericAmountUSD =
        Number(amountUSD);


    if (
        !Number.isFinite(
            numericAmountUSD
        ) ||
        numericAmountUSD <= 0
    ) {

        throw new Error(
            "Deposit amount must be greater than zero"
        );

    }


    // =====================================
    // بررسی نرخ دلار:: M
    // =====================================

    const numericRate =
        Number(usdToTomanRate);


    if (
        !Number.isFinite(
            numericRate
        ) ||
        numericRate <= 0
    ) {

        throw new Error(
            "Invalid USD to Toman exchange rate"
        );

    }


    // =====================================
    // محاسبه مبلغ تومان:: M
    // =====================================

    const amountToman =
        Number(
            (
                numericAmountUSD *
                numericRate
            ).toFixed(0)
        );


    // =====================================
    // پیدا کردن کیف پول:: M
    // =====================================

    let wallet =
        await Wallet.findOne({

            userId

        });


    // =====================================
    // ساخت کیف پول در صورت نبودن:: M
    // =====================================

    if (!wallet) {

        wallet =
            await Wallet.create({

                userId,

                balance:
                    0,

                withdrawable:
                    0,

                totalProfit:
                    0,

                totalTrades:
                    0,

                currency:
                    "USDT",

                status:
                    "ACTIVE"

            });

    }


    // =====================================
    // ایجاد درخواست واریز:: M
    // =====================================

    const deposit =
        await Deposit.create({

            userId,

            walletId:
                wallet._id,

            amountUSD:
                numericAmountUSD,

            usdToTomanRate:
                numericRate,

            amountToman,

            method,

            status:
                "PENDING"

        });


    return deposit;

}


// =====================================
// Confirm Deposit:: M
// تأیید واریز
// =====================================
//
// IMPORTANT:
// فقط سیستم پرداخت معتبر باید این تابع را
// بعد از تأیید واقعی پرداخت صدا بزند.
// =====================================

export async function confirmDeposit({

    depositId,

    externalPaymentId = null,

    paymentReference = ""

}) {

    // =====================================
    // بررسی Deposit ID:: M
    // =====================================

    if (
        !mongoose.Types.ObjectId.isValid(
            depositId
        )
    ) {

        throw new Error(
            "Invalid deposit ID"
        );

    }


    // =====================================
    // پیدا کردن واریز:: M
    // =====================================

    const deposit =
        await Deposit.findById(
            depositId
        );


    if (!deposit) {

        throw new Error(
            "Deposit not found"
        );

    }


    // =====================================
    // جلوگیری از دوباره ثبت شدن:: M
    // =====================================

    if (
        deposit.status ===
        "COMPLETED"
    ) {

        return deposit;

    }


    // =====================================
    // فقط واریز در انتظار:: M
    // =====================================

    if (
        deposit.status !==
        "PENDING" &&
        deposit.status !==
        "PROCESSING"
    ) {

        throw new Error(
            "Deposit cannot be confirmed"
        );

    }


    // =====================================
    // پیدا کردن کیف پول:: M
    // =====================================

    const wallet =
        await Wallet.findById(
            deposit.walletId
        );


    if (!wallet) {

        throw new Error(
            "Wallet not found"
        );

    }


    // =====================================
    // بروزرسانی واریز:: M
    // =====================================

    deposit.status =
        "COMPLETED";


    deposit.externalPaymentId =
        externalPaymentId;


    deposit.paymentReference =
        paymentReference;


    deposit.completedAt =
        new Date();


    await deposit.save();


    // =====================================
    // افزایش موجودی دلار:: M
    // =====================================

    wallet.balance +=
        deposit.amountUSD;


    // =====================================
    // موجودی قابل برداشت:: M
    // =====================================

    wallet.withdrawable =
        wallet.balance;


    await wallet.save();


    return {

        deposit,

        wallet

    };

}


// =====================================
// Get Deposit:: M
// دریافت یک واریز
// =====================================

export async function getDeposit({

    userId,

    depositId

}) {

    if (
        !mongoose.Types.ObjectId.isValid(
            userId
        )
    ) {

        throw new Error(
            "Invalid user ID"
        );

    }


    if (
        !mongoose.Types.ObjectId.isValid(
            depositId
        )
    ) {

        throw new Error(
            "Invalid deposit ID"
        );

    }


    const deposit =
        await Deposit.findOne({

            _id:
                depositId,

            userId

        });


    if (!deposit) {

        throw new Error(
            "Deposit not found"
        );

    }


    return deposit;

}


// =====================================
// Get User Deposits:: M
// دریافت تاریخچه واریزها
// =====================================

export async function getUserDeposits({

    userId,

    limit = 50

}) {

    if (
        !mongoose.Types.ObjectId.isValid(
            userId
        )
    ) {

        throw new Error(
            "Invalid user ID"
        );

    }


    const safeLimit =
        Math.min(
            Math.max(
                Number(limit) || 50,
                1
            ),
            100
        );


    return Deposit.find({

        userId

    })
        .sort({
            createdAt: -1
        })
        .limit(
            safeLimit
        );

}
