// =====================================
// AutoTrade AI
// Deposit Service:: M
// سرویس مدیریت واریز
// File: backend/services/depositService.js
// =====================================

import mongoose from "mongoose";

import Deposit from "../models/Deposit.js";
import Wallet from "../models/Wallet.js";


// =====================================
// Create Deposit:: M
// ایجاد درخواست واریز
// =====================================

export async function createDeposit({

    userId,

    amountToman,

    exchangeRate,

    method = "GATEWAY",

    gateway = null

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

    const toman =
        Number(amountToman);


    if (
        !Number.isFinite(toman) ||
        toman <= 0
    ) {

        throw new Error(
            "مبلغ واریز نامعتبر است"
        );

    }


    // =====================================
    // بررسی نرخ دلار:: M
    // =====================================

    const rate =
        Number(exchangeRate);


    if (
        !Number.isFinite(rate) ||
        rate <= 0
    ) {

        throw new Error(
            "نرخ دلار نامعتبر است"
        );

    }


    // =====================================
    // محاسبه معادل دلار:: M
    // =====================================

    const amountUSD =
        Number(
            (
                toman / rate
            ).toFixed(8)
        );


    // =====================================
    // ایجاد درخواست واریز:: M
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

            gateway,

            status:
                "PENDING",

            walletCredited:
                false

        });


    return deposit;

}


// =====================================
// Confirm Deposit:: M
// تأیید و شارژ کیف پول
// =====================================
//
// مهم:
//
// این تابع فقط بعد از تأیید واقعی پرداخت
// توسط درگاه باید فراخوانی شود.
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
    // پیدا کردن کیف پول:: M
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
    // شارژ کیف پول:: M
    // =====================================

    wallet.balance =
        Number(wallet.balance || 0) +
        Number(deposit.amountUSD || 0);


    // =====================================
    // ذخیره کیف پول:: M
    // =====================================

    await wallet.save();


    // =====================================
    // تکمیل واریز:: M
    // =====================================

    deposit.status =
        "COMPLETED";

    deposit.walletCredited =
        true;

    deposit.confirmedAt =
        new Date();


    if (paymentId) {

        deposit.paymentId =
            paymentId;

    }


    if (transactionId) {

        deposit.transactionId =
            transactionId;

    }


    if (gateway) {

        deposit.gateway =
            gateway;

    }


    await deposit.save();


    return {

        deposit,

        wallet,

        alreadyCredited:
            false

    };

}


// =====================================
// Get User Deposits:: M
// دریافت واریزهای کاربر
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


    const deposits =
        await Deposit.find({
            userId
        })
        .sort({
            createdAt: -1
        })
        .limit(100);


    return deposits;

}
