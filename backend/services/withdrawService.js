// =====================================
// ..M AutoTrade AI
// Withdraw Service :: M
// سرویس مدیریت برداشت تومان
// File: backend/services/withdrawService.js
// =====================================

import mongoose from "mongoose";

import Withdraw from "../models/Withdraw.js";
import Wallet from "../models/Wallet.js";

import {
    getUsdToTomanRate
} from "./currencyService.js";


// =====================================
// Helpers :: M
// =====================================

function toPositiveNumber(
    value,
    message
) {

    const number =
        Number(value);

    if (
        !Number.isFinite(number) ||
        number <= 0
    ) {

        throw new Error(
            message
        );

    }

    return number;

}


// =====================================
// Round USD / USDT :: M
// =====================================

function round8(
    value
) {

    return Number(
        Number(value).toFixed(8)
    );

}


// =====================================
// Normalize Toman Amount :: M
// =====================================

function normalizeToman(
    value
) {

    const number =
        Number(
            String(value)
                .replace(/,/g, "")
                .replace(/\s/g, "")
        );

    if (
        !Number.isFinite(number) ||
        number <= 0
    ) {

        throw new Error(
            "مبلغ برداشت نامعتبر است"
        );

    }

    return Math.floor(number);

}


// =====================================
// Normalize Bank Account :: M
// =====================================

function normalizeBankAccount(
    value
) {

    return String(
        value || ""
    )
        .trim();

}


// =====================================
// Create Withdraw Request :: M
// ایجاد درخواست برداشت
// =====================================
//
// کاربر مبلغ را فقط به تومان وارد می‌کند.
//
// تومان
//   ↓
// نرخ دلار
//   ↓
// USD / USDT
//   ↓
// رزرو از Wallet.withdrawable
//   ↓
// ایجاد درخواست PENDING
//
// =====================================

export async function createWithdrawRequest({

    userId,

    amountToman,

    withdrawAll = false,

    method = "BANK",

    bankAccount = "",

    accountHolderName = ""

}) {

    // =====================================
    // Validate User ID :: M
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
    // Find Wallet :: M
    // =====================================

    const wallet =
        await Wallet.findOne({

            userId

        });


    if (!wallet) {

        throw new Error(
            "کیف پول پیدا نشد"
        );

    }


    // =====================================
    // Check Wallet Status :: M
    // =====================================

    if (
        wallet.status &&
        wallet.status !== "ACTIVE"
    ) {

        throw new Error(
            "کیف پول فعال نیست"
        );

    }


    // =====================================
    // Available Withdrawable :: M
    // موجودی قابل برداشت
    // واحد داخلی: USD / USDT
    // =====================================

    const available =
        Number(
            wallet.withdrawable || 0
        );


    if (
        !Number.isFinite(
            available
        ) ||
        available <= 0
    ) {

        throw new Error(
            "موجودی قابل برداشت وجود ندارد"
        );

    }


    // =====================================
    // Get USD/Toman Rate :: M
    // =====================================

    const exchange =
        await getUsdToTomanRate();


    const rate =
        toPositiveNumber(

            exchange?.rate ??
            exchange,

            "نرخ دلار برای برداشت نامعتبر است"

        );


    // =====================================
    // Calculate Withdrawal Amount :: M
    // =====================================

    let numericAmountToman;

    let numericAmountUSD;


    // -------------------------------------
    // برداشت کل موجودی
    // -------------------------------------

    if (
        withdrawAll === true
    ) {

        numericAmountUSD =
            round8(
                available
            );


        numericAmountToman =
            Math.floor(
                numericAmountUSD *
                rate
            );

    }

    // -------------------------------------
    // برداشت مبلغ مشخص به تومان
    // -------------------------------------

    else {

        numericAmountToman =
            normalizeToman(
                amountToman
            );


        numericAmountUSD =
            round8(

                numericAmountToman /
                rate

            );

    }


    // =====================================
    // Validate Calculated USD
    // =====================================

    if (
        !Number.isFinite(
            numericAmountUSD
        ) ||
        numericAmountUSD <= 0
    ) {

        throw new Error(
            "مبلغ معادل دلاری برداشت نامعتبر است"
        );

    }


    // =====================================
    // Check Available Balance :: M
    // =====================================

    if (
        numericAmountUSD >
        available
    ) {

        throw new Error(
            "موجودی قابل برداشت برای این مبلغ کافی نیست"
        );

    }


    // =====================================
    // Minimum Withdrawal :: M
    // حداقل برداشت
    // =====================================

    const MIN_WITHDRAW_TOMAN =
        100000;


    if (
        numericAmountToman <
        MIN_WITHDRAW_TOMAN
    ) {

        throw new Error(

            `حداقل مبلغ برداشت ${MIN_WITHDRAW_TOMAN.toLocaleString("fa-IR")} تومان است`

        );

    }


    // =====================================
    // Normalize Method :: M
    // =====================================

    const normalizedMethod =
        String(
            method || "BANK"
        )
            .toUpperCase()
            .trim();


    const allowedMethods = [

        "BANK",

        "GATEWAY",

        "OTHER"

    ];


    if (
        !allowedMethods.includes(
            normalizedMethod
        )
    ) {

        throw new Error(
            "روش برداشت نامعتبر است"
        );

    }


    // =====================================
    // Bank Account :: M
    // =====================================

    const normalizedBankAccount =
        normalizeBankAccount(
            bankAccount
        );


    if (
        normalizedMethod === "BANK" &&
        !normalizedBankAccount
    ) {

        throw new Error(
            "شماره شبا یا حساب بانکی وارد نشده است"
        );

    }


    // =====================================
    // Account Holder :: M
    // =====================================

    const normalizedHolderName =
        String(
            accountHolderName || ""
        )
            .trim();


    // =====================================
    // Prevent Multiple Pending Requests :: M
    // =====================================

    const pendingWithdraw =
        await Withdraw.findOne({

            userId,

            status:
                "PENDING"

        });


    if (pendingWithdraw) {

        throw new Error(
            "شما یک درخواست برداشت در حال بررسی دارید"
        );

    }


    // =====================================
    // Reserve Wallet Balance :: M
    // رزرو اتمیک موجودی
    // =====================================

    const updatedWallet =
        await Wallet.findOneAndUpdate(

            {

                _id:
                    wallet._id,

                ...(wallet.status
                    ? {
                        status:
                            "ACTIVE"
                    }
                    : {}),

                withdrawable: {

                    $gte:
                        numericAmountUSD

                }

            },

            {

                $inc: {

                    withdrawable:
                        -numericAmountUSD

                }

            },

            {

                returnDocument:
                    "after",

                runValidators:
                    true

            }

        );


    if (!updatedWallet) {

        throw new Error(
            "موجودی کافی نیست یا کیف پول همزمان تغییر کرده است"
        );

    }


    // =====================================
    // Create Withdraw Request :: M
    // =====================================

    let withdraw;


    try {

        withdraw =
            await Withdraw.create({

                userId,

                walletId:
                    wallet._id,

                amountUSD:
                    numericAmountUSD,

                amountToman:
                    numericAmountToman,

                usdToTomanRate:
                    rate,

                method:
                    normalizedMethod,

                bankAccount:
                    normalizedBankAccount,

                accountHolderName:
                    normalizedHolderName,

                status:
                    "PENDING"

            });

    }

    catch (error) {

        // =================================
        //