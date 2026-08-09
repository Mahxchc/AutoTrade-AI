// =====================================
// AutoTrade AI
// Deposit Service:: M
// سرویس مدیریت واریز
// File: backend/services/depositService.js
// =====================================

import mongoose from "mongoose";

import Deposit from "../models/Deposit.js";
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";

import {
    getUsdToTomanRate
} from "./currencyService.js";


// =====================================
// ایجاد درخواست واریز:: M
// =====================================

export async function createDeposit({
    userId,
    amountToman,
    method = "BANK"
}) {

    // =====================================
    // بررسی شناسه کاربر:: M
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
    // بررسی مبلغ:: M
    // =====================================

    const numericToman =
        Number(
            amountToman
        );


    if (
        !Number.isFinite(
            numericToman
        ) ||
        numericToman <= 0
    ) {

        throw new Error(
            "مبلغ واریز نامعتبر است"
        );

    }


    // =====================================
    // بررسی کاربر:: M
    // =====================================

    const user =
        await User.findById(
            userId
        );


    if (!user) {

        throw new Error(
            "کاربر پیدا نشد"
        );

    }


    // =====================================
    // دریافت نرخ دلار:: M
    // =====================================

    const currency =
        await getUsdToTomanRate();


    const rate =
        Number(
            currency.rate
        );


    if (
        !Number.isFinite(rate) ||
        rate <= 0
    ) {

        throw new Error(
            "نرخ دلار معتبر نیست"
        );

    }


    // =====================================
    // تبدیل تومان به دلار:: M
    // =====================================

    const amountUSD =
        numericToman /
        rate;


    // =====================================
    // ایجاد درخواست واریز:: M
    // =====================================

    const deposit =
        await Deposit.create({

            userId,

            amountUSD:
                Number(
                    amountUSD.toFixed(8)
                ),

            usdToTomanRate:
                rate,

            amountToman:
                Math.round(
                    numericToman
                ),

            method,

            status:
                "PENDING",

            walletCredited:
                false

        });


    return deposit;

}


// =====================================
// تأیید واریز:: M
// =====================================
//
// مهم:
// این تابع فقط زمانی باید اجرا شود که
// پرداخت واقعاً توسط درگاه/سیستم پرداخت
// تأیید شده باشد.
// =====================================

export async function confirmDeposit({
    depositId,
    paymentId = null,
    transactionId = null,
    gateway = null
}) {

    // =====================================
    // بررسی شناسه واریز:: M
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
    // پیدا کردن واریز:: M
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
    // جلوگیری از شارژ دوباره:: M
    // =====================================

    if (
        deposit.walletCredited === true ||
        deposit.status === "COMPLETED"
    ) {

        return {

            success:
                true,

            alreadyCredited:
                true,

            deposit

        };

    }


    // =====================================
    // وضعیت واریز:: M
    // =====================================

    if (
        deposit.status === "CANCELLED" ||
        deposit.status === "FAILED"
    ) {

        throw new Error(
            "این درخواست واریز قابل تأیید نیست"
        );

    }


    // =====================================
    // پیدا کردن کیف پول:: M
    // =====================================

    const wallet =
        await Wallet.findOne({
            userId:
                deposit.userId
        });


    // =====================================
    // ساخت کیف پول در صورت نبودن:: M
    // =====================================

    const targetWallet =
        wallet ||
        await Wallet.create({

            userId:
                deposit.userId,

            balance:
                0,

            totalProfit:
                0,

            totalTrades:
                0,

            withdrawable:
                0,

            currency:
                "USDT",

            status:
                "ACTIVE"

        });


    // =====================================
    // بررسی وضعیت کیف پول:: M
    // =====================================

    if (
        targetWallet.status !==
        "ACTIVE"
    ) {

        throw new Error(
            "کیف پول فعال نیست"
        );

    }


    // =====================================
    // شارژ موجودی:: M
    // =====================================

    targetWallet.balance +=
        deposit.amountUSD;


    // =====================================
    // ذخیره کیف پول:: M
    // =====================================

    await targetWallet.save();


    // =====================================
    // ثبت تأیید واریز:: M
    // =====================================

    deposit.status =
        "COMPLETED";

    deposit.walletCredited =
        true;

    deposit.paymentId =
        paymentId;

    deposit.transactionId =
        transactionId;

    deposit.gateway =
        gateway;

    deposit.confirmedAt =
        new Date();


    await deposit.save();


    return {

        success:
            true,

        alreadyCredited:
            false,

        deposit,

        wallet:
            targetWallet

    };

}


// =====================================
// دریافت واریزها:: M
// =====================================

export async function getUserDeposits(
    userId
) {

    if (
        !mongoose.Types.ObjectId.isValid(
            userId
        )
    ) {

        throw new Error(
            "شناسه کاربر نامعتبر است"
        );

    }


    return await Deposit.find({

        userId

    })

    .sort({

        createdAt:
            -1

    })

    .limit(100);

}
