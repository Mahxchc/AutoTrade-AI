// =====================================
// AutoTrade AI
// Withdraw Service :: M
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
// Round Number :: M
// =====================================

function round8(
    value
) {

    return Number(
        Number(value).toFixed(8)
    );

}


// =====================================
// Create Withdraw Request :: M
// ایجاد درخواست برداشت
// =====================================
//
// کاربر می‌تواند:
//
// 1. بخشی از موجودی را برداشت کند
// 2. کل موجودی قابل برداشت را برداشت کند
//
// USDT
//   ↓
// USD
//   ↓
// نرخ دلار
//   ↓
// تومان
//
// =====================================

export async function createWithdrawRequest({

    userId,

    amountUSD = null,

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
        wallet.status !==
        "ACTIVE"
    ) {

        throw new Error(
            "کیف پول فعال نیست"
        );

    }


    // =====================================
    // Available Withdrawable :: M
    // =====================================

    const available =
        Number(
            wallet.withdrawable || 0
        );


    if (
        !Number.isFinite(available) ||
        available <= 0
    ) {

        throw new Error(
            "موجودی قابل برداشت وجود ندارد"
        );

    }


    // =====================================
    // Calculate Withdrawal Amount :: M
    // =====================================

    let numericAmount;


    // -------------------------------------
    // برداشت کل
    // -------------------------------------

    if (
        withdrawAll === true
    ) {

        numericAmount =
            round8(
                available
            );

    }

    else {

        numericAmount =
            toPositiveNumber(

                amountUSD,

                "مبلغ برداشت نامعتبر است"

            );

        numericAmount =
            round8(
                numericAmount
            );

    }


    // =====================================
    // Check Maximum Amount :: M
    // =====================================

    if (
        numericAmount >
        available
    ) {

        throw new Error(
            "مبلغ برداشت بیشتر از موجودی قابل برداشت است"
        );

    }


    // =====================================
    // Minimum Precision Check :: M
    // =====================================

    if (
        numericAmount <= 0
    ) {

        throw new Error(
            "مبلغ برداشت باید بیشتر از صفر باشد"
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
    // Calculate Toman :: M
    // =====================================

    const amountToman =
        Math.round(

            numericAmount *
            rate

        );


    if (
        !Number.isFinite(
            amountToman
        ) ||
        amountToman <= 0
    ) {

        throw new Error(
            "مبلغ تومانی برداشت نامعتبر است"
        );

    }


    // =====================================
    // Normalize Method :: M
    // =====================================

    const normalizedMethod =
        String(method)
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
    // Reserve Wallet Balance :: M
    // =====================================
    //
    // این عملیات اتمیک است.
    //
    // فقط زمانی انجام می‌شود که موجودی
    // هنوز برای این برداشت کافی باشد.
    //
    // =====================================

    const updatedWallet =
        await Wallet.findOneAndUpdate(

            {

                _id:
                    wallet._id,

                status:
                    "ACTIVE",

                withdrawable: {

                    $gte:
                        numericAmount

                }

            },

            {

                $inc: {

                    withdrawable:
                        -numericAmount

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
            "موجودی قابل برداشت کافی نیست یا کیف پول تغییر کرده است"
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
                    numericAmount,

                amountToman,

                usdToTomanRate:
                    rate,

                method:
                    normalizedMethod,

                bankAccount:
                    String(
                        bankAccount || ""
                    ),

                accountHolderName:
                    String(
                        accountHolderName || ""
                    ),

                status:
                    "PENDING"

            });

    }

    catch (error) {

        // =================================
        // Rollback Reserved Balance :: M
        // =================================

        await Wallet.findOneAndUpdate(

            {

                _id:
                    wallet._id

            },

            {

                $inc: {

                    withdrawable:
                        numericAmount

                }

            }

        );


        throw error;

    }


    // =====================================
    // Result :: M
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

        amountUSDT:
            withdraw.amountUSD,

        amountToman:
            withdraw.amountToman,

        exchangeRate:
            withdraw.usdToTomanRate,

        method:
            withdraw.method,

        withdrawAll:
            withdrawAll === true,

        remainingWithdrawable:
            round8(
                Number(
                    updatedWallet.withdrawable
                )
            ),

        createdAt:
            withdraw.createdAt

    };

}


// =====================================
// Get Withdraw Status :: M
// دریافت وضعیت برداشت
// =====================================

export async function getWithdrawStatus({

    userId,

    requestId

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
    // Validate Request ID :: M
    // =====================================

    if (
        !mongoose.Types.ObjectId.isValid(
            requestId
        )
    ) {

        throw new Error(
            "شناسه درخواست برداشت نامعتبر است"
        );

    }


    // =====================================
    // Find Request :: M
    // =====================================

    const withdraw =
        await Withdraw.findOne({

            _id:
                requestId,

            userId

        });


    if (!withdraw) {

        throw new Error(
            "درخواست برداشت پیدا نشد"
        );

    }


    // =====================================
    // Result :: M
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

        amountUSDT:
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
// Cancel Withdraw Request :: M
// لغو درخواست برداشت
// =====================================
//
// فقط PENDING قابل لغو است.
//
// موجودی رزروشده دوباره به
// withdrawable برمی‌گردد.
// =====================================

export async function cancelWithdrawRequest({

    userId,

    requestId

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
    // Validate Request ID :: M
    // =====================================

    if (
        !mongoose.Types.ObjectId.isValid(
            requestId
        )
    ) {

        throw new Error(
            "شناسه درخواست برداشت نامعتبر است"
        );

    }


    // =====================================
    // Find Pending Request :: M
    // =====================================

    const withdraw =
        await Withdraw.findOne({

            _id:
                requestId,

            userId,

            status:
                "PENDING"

        });


    if (!withdraw) {

        const existing =
            await Withdraw.findOne({

                _id:
                    requestId,

                userId

            });


        if (!existing) {

            throw new Error(
                "درخواست برداشت پیدا نشد"
            );

        }


        throw new Error(
            "فقط درخواست برداشت در وضعیت PENDING قابل لغو است"
        );

    }


    // =====================================
    // Atomic Status Change :: M
    // =====================================

    const cancelled =
        await Withdraw.findOneAndUpdate(

            {

                _id:
                    requestId,

                userId,

                status:
                    "PENDING"

            },

            {

                $set: {

                    status:
                        "CANCELLED"

                }

            },

            {

                returnDocument:
                    "after",

                runValidators:
                    true

            }

        );


    if (!cancelled) {

        throw new Error(
            "درخواست برداشت همزمان تغییر کرده است"
        );

    }


    // =====================================
    // Return Reserved Balance :: M
    // =====================================

    await Wallet.findOneAndUpdate(

        {

            _id:
                withdraw.walletId

        },

        {

            $inc: {

                withdrawable:
                    Number(
                        withdraw.amountUSD
                    )

            }

        }

    );


    // =====================================
    // Result :: M
    // =====================================

    return {

        success:
            true,

        requestId:
            cancelled._id,

        status:
            cancelled.status,

        returnedAmountUSD:
            Number(
                cancelled.amountUSD
            ),

        returnedAmountUSDT:
            Number(
                cancelled.amountUSD
            ),

        message:
            "درخواست برداشت لغو شد و موجودی رزروشده برگشت داده شد"

    };

}


// =====================================
// Get User Withdrawals :: M
// دریافت لیست برداشت‌ها
// =====================================

export async function getUserWithdrawals(
    userId
) {

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
    // Get Withdrawals :: M
    // =====================================

    const withdrawals =
        await Withdraw.find({

            userId

        })
        .sort({

            createdAt:
                -1

        })
        .limit(100);


    return withdrawals;

}


// =====================================
// Default Export :: M
// =====================================

export default {

    createWithdrawRequest,

    getWithdrawStatus,

    cancelWithdrawRequest,

    getUserWithdrawals

};