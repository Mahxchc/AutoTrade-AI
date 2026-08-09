// =====================================
// Withdraw Service:: M
// AutoTrade AI
// سرویس مدیریت برداشت
// File: backend/services/withdrawService.js
// =====================================

import mongoose from "mongoose";

import Withdraw from "../models/Withdraw.js";
import Wallet from "../models/Wallet.js";

import {
    getUsdToTomanRate
} from "./currencyService.js";


// =====================================
// ایجاد درخواست برداشت:: M
// =====================================

export async function createWithdrawRequest({

    userId,

    amountUSD,

    method = "BANK",

    bankAccount = "",

    accountHolderName = ""

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
    // بررسی مبلغ برداشت:: M
    // =====================================

    const numericAmount =
        Number(amountUSD);


    if (
        !Number.isFinite(
            numericAmount
        ) ||
        numericAmount <= 0
    ) {

        throw new Error(
            "Invalid withdrawal amount"
        );

    }


    // =====================================
    // پیدا کردن کیف پول:: M
    // =====================================

    const wallet =
        await Wallet.findOne({

            userId

        });


    if (!wallet) {

        throw new Error(
            "Wallet not found"
        );

    }


    // =====================================
    // موجودی قابل برداشت:: M
    // =====================================

    const withdrawable =
        Number(
            wallet.withdrawable
        );


    if (
        !Number.isFinite(
            withdrawable
        ) ||
        withdrawable <= 0
    ) {

        throw new Error(
            "No withdrawable balance available"
        );

    }


    // =====================================
    // بررسی سقف برداشت:: M
    // =====================================

    if (
        numericAmount >
        withdrawable
    ) {

        throw new Error(
            "Withdrawal amount exceeds available balance"
        );

    }


    // =====================================
    // دریافت نرخ دلار:: M
    // =====================================

    const exchange =
        await getUsdToTomanRate();


    // =====================================
    // محاسبه مبلغ تومانی:: M
    // =====================================

    const amountToman =
        Math.round(

            numericAmount *
            exchange.rate

        );


    // =====================================
    // ایجاد درخواست برداشت:: M
    // =====================================

    const withdraw =
        await Withdraw.create({

            userId,

            walletId:
                wallet._id,

            amountUSD:
                Number(
                    numericAmount.toFixed(8)
                ),

            usdToTomanRate:
                exchange.rate,

            amountToman,

            method,

            bankAccount,

            accountHolderName,

            status:
                "PENDING"

        });


    // =====================================
    // رزرو موجودی برداشت:: M
    // =====================================
    //
    // مبلغ از موجودی اصلی کم نمی‌شود.
    // فقط از withdrawable کم می‌شود تا
    // دوباره قابل برداشت نباشد.
    // =====================================

    wallet.withdrawable =
        Number(
            (
                withdrawable -
                numericAmount
            ).toFixed(8)
        );


    await wallet.save();


    // =====================================
    // نتیجه:: M
    // =====================================

    return {

        success:
            true,

        requestId:
            withdraw._id,

        status:
            withdraw.status,

        amountUSD:
            withdraw.amountUSD,

        amountToman:
            withdraw.amountToman,

        exchangeRate:
            withdraw.usdToTomanRate,

        method:
            withdraw.method,

        createdAt:
            withdraw.createdAt

    };

}


// =====================================
// بررسی وضعیت برداشت:: M
// =====================================

export async function getWithdrawStatus({

    userId,

    requestId

}) {

    // =====================================
    // بررسی شناسه‌ها:: M
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


    if (
        !mongoose.Types.ObjectId.isValid(
            requestId
        )
    ) {

        throw new Error(
            "Invalid withdrawal request ID"
        );

    }


    // =====================================
    // پیدا کردن درخواست:: M
    // =====================================

    const withdraw =
        await Withdraw.findOne({

            _id:
                requestId,

            userId

        });


    if (!withdraw) {

        throw new Error(
            "Withdrawal request not found"
        );

    }


    // =====================================
    // نتیجه:: M
    // =====================================

    return {

        success:
            true,

        requestId:
            withdraw._id,

        status:
            withdraw.status,

        amountUSD:
            withdraw.amountUSD,

        amountToman:
            withdraw.amountToman,

        exchangeRate:
            withdraw.usdToTomanRate,

        method:
            withdraw.method,

        externalPaymentId:
            withdraw.externalPaymentId,

        failureReason:
            withdraw.failureReason,

        createdAt:
            withdraw.createdAt,

        processedAt:
            withdraw.processedAt

    };

}


// =====================================
// لغو درخواست برداشت:: M
// =====================================
//
// فقط درخواست PENDING قابل لغو است.
// =====================================

export async function cancelWithdrawRequest({

    userId,

    requestId

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
            requestId
        )
    ) {

        throw new Error(
            "Invalid withdrawal request ID"
        );

    }


    const withdraw =
        await Withdraw.findOne({

            _id:
                requestId,

            userId

        });


    if (!withdraw) {

        throw new Error(
            "Withdrawal request not found"
        );

    }


    if (
        withdraw.status !==
        "PENDING"
    ) {

        throw new Error(
            "Only pending withdrawals can be cancelled"
        );

    }


    // =====================================
    // برگرداندن موجودی رزروشده:: M
    // =====================================

    const wallet =
        await Wallet.findById(
            withdraw.walletId
        );


    if (!wallet) {

        throw new Error(
            "Wallet not found"
        );

    }


    wallet.withdrawable =
        Number(
            (
                Number(
                    wallet.withdrawable
                ) +
                Number(
                    withdraw.amountUSD
                )
            ).toFixed(8)
        );


    await wallet.save();


    // =====================================
    // تغییر وضعیت درخواست:: M
    // =====================================

    withdraw.status =
        "CANCELLED";


    await withdraw.save();


    return {

        success:
            true,

        requestId:
            withdraw._id,

        status:
            withdraw.status,

        message:
            "Withdrawal request cancelled successfully"

    };

}
