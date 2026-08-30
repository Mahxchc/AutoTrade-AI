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
// Round Money :: M
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
    // Wallet Status :: M
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
    // Exchange Rate :: M
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
    // Calculate Amount :: M
    // =====================================

    let numericAmountToman;

    let numericAmountUSD;


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
    // Validate USD Amount :: M
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
    // Check Balance :: M
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
    // Prevent Multiple Pending :: M
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
    // Atomic Reserve Balance :: M
    // رزرو اتمیک موجودی
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
    // Create Withdraw :: M
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
                        numericAmountUSD

                }

            },

            {

                returnDocument:
                    "after",

                runValidators:
                    true

            }

        );


        throw error;

    }


    // =====================================
    // Return Result :: M
    // =====================================

    return {

        withdraw,

        wallet:
            updatedWallet,

        amountUSD:
            numericAmountUSD,

        amountToman:
            numericAmountToman,

        exchangeRate:
            rate

    };

}


// =====================================
// Get User Withdraws :: M
// دریافت برداشت‌های کاربر
// =====================================

export async function getUserWithdraws(
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


    return await Withdraw.find({

        userId

    })
    .sort({

        createdAt:
            -1

    })
    .limit(100);

}


// =====================================
// Get Withdraw By ID :: M
// دریافت یک برداشت
// =====================================

export async function getWithdrawById({

    withdrawId,

    userId = null

}) {

    if (
        !mongoose.Types.ObjectId.isValid(
            withdrawId
        )
    ) {

        throw new Error(
            "شناسه برداشت نامعتبر است"
        );

    }


    const query = {

        _id:
            withdrawId

    };


    if (
        userId !== null
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


        query.userId =
            userId;

    }


    const withdraw =
        await Withdraw.findOne(
            query
        );


    if (!withdraw) {

        throw new Error(
            "درخواست برداشت پیدا نشد"
        );

    }


    return withdraw;

}


// =====================================
// Approve Withdraw :: M
// تأیید برداشت توسط سیستم/Admin
// =====================================

export async function approveWithdraw({

    withdrawId,

    transactionId = null,

    description = ""

}) {

    if (
        !mongoose.Types.ObjectId.isValid(
            withdrawId
        )
    ) {

        throw new Error(
            "شناسه برداشت نامعتبر است"
        );

    }


    const withdraw =
        await Withdraw.findOneAndUpdate(

            {

                _id:
                    withdrawId,

                status:
                    "PENDING"

            },

            {

                $set: {

                    status:
                        "COMPLETED",

                    processedAt:
                        new Date(),

                    ...(transactionId
                        ? {

                            transactionId:
                                String(
                                    transactionId
                                )

                        }
                        : {}),

                    ...(description
                        ? {

                            description:
                                String(
                                    description
                                )

                        }
                        : {})

                }

            },

            {

                returnDocument:
                    "after",

                runValidators:
                    true

            }

        );


    if (!withdraw) {

        const existing =
            await Withdraw.findById(
                withdrawId
            );


        if (!existing) {

            throw new Error(
                "درخواست برداشت پیدا نشد"
            );

        }


        if (
            existing.status ===
            "COMPLETED"
        ) {

            return {

                withdraw:
                    existing,

                alreadyCompleted:
                    true

            };

        }


        throw new Error(
            "این برداشت قابل تأیید نیست"
        );

    }


    return {

        withdraw,

        alreadyCompleted:
            false

    };

}


// =====================================
// Reject Withdraw :: M
// رد برداشت و برگشت موجودی
// =====================================

export async function rejectWithdraw({

    withdrawId,

    description = ""

}) {

    if (
        !mongoose.Types.ObjectId.isValid(
            withdrawId
        )
    ) {

        throw new Error(
            "شناسه برداشت نامعتبر است"
        );

    }


    const withdraw =
        await Withdraw.findOne({

            _id:
                withdrawId,

            status:
                "PENDING"

        });


    if (!withdraw) {

        const existing =
            await Withdraw.findById(
                withdrawId
            );


        if (!existing) {

            throw new Error(
                "درخواست برداشت پیدا نشد"
            );

        }


        if (
            existing.status ===
            "REJECTED"
        ) {

            return {

                withdraw:
                    existing,

                alreadyRejected:
                    true

            };

        }


        throw new Error(
            "این برداشت قابل رد کردن نیست"
        );

    }


    const amountUSD =
        Number(
            withdraw.amountUSD || 0
        );


    if (
        !Number.isFinite(
            amountUSD
        ) ||
        amountUSD <= 0
    ) {

        throw new Error(
            "مبلغ برداشت نامعتبر است"
        );

    }


    // =====================================
    // Return Reserved Balance :: M
    // برگشت موجودی رزرو شده
    // =====================================

    const wallet =
        await Wallet.findOneAndUpdate(

            {

                _id:
                    withdraw.walletId,

                status:
                    "ACTIVE"

            },

            {

                $inc: {

                    withdrawable:
                        amountUSD

                }

            },

            {

                returnDocument:
                    "after",

                runValidators:
                    true

            }

        );


    if (!wallet) {

        throw new Error(
            "کیف پول برای برگشت موجودی پیدا نشد"
        );

    }


    // =====================================
    // Atomic Reject :: M
    // =====================================

    const rejected =
        await Withdraw.findOneAndUpdate(

            {

                _id:
                    withdrawId,

                status:
                    "PENDING"

            },

            {

                $set: {

                    status:
                        "REJECTED",

                    processedAt:
                        new Date(),

                    ...(description
                        ? {

                            description:
                                String(
                                    description
                                )

                        }
                        : {})

                }

            },

            {

                returnDocument:
                    "after",

                runValidators:
                    true

            }

        );


    if (!rejected) {

        // =================================
        // Rollback Wallet Refund :: M
        // =================================

        await Wallet.findOneAndUpdate(

            {

                _id:
                    withdraw.walletId

            },

            {

                $inc: {

                    withdrawable:
                        -amountUSD

                }

            }

        );


        throw new Error(
            "وضعیت برداشت همزمان تغییر کرده است"
        );

    }


    return {

        withdraw:
            rejected,

        wallet,

        refundedAmountUSD:
            amountUSD,

        alreadyRejected:
            false

    };

}


// =====================================
// Cancel Withdraw :: M
// لغو برداشت توسط کاربر
// =====================================

export async function cancelWithdraw({

    withdrawId,

    userId

}) {

    if (
        !mongoose.Types.ObjectId.isValid(
            withdrawId
        )
    ) {

        throw new Error(
            "شناسه برداشت نامعتبر است"
        );

    }


    if (
        !mongoose.Types.ObjectId.isValid(
            userId
        )
    ) {

        throw new Error(
            "شناسه کاربر نامعتبر است"
        );

    }


    const withdraw =
        await Withdraw.findOne({

            _id:
                withdrawId,

            userId,

            status:
                "PENDING"

        });


    if (!withdraw) {

        throw new Error(
            "این برداشت قابل لغو نیست"
        );

    }


    const amountUSD =
        Number(
            withdraw.amountUSD || 0
        );


    if (
        !Number.isFinite(
            amountUSD
        ) ||
        amountUSD <= 0
    ) {

        throw new Error(
            "مبلغ برداشت نامعتبر است"
        );

    }


    // =====================================
    // Atomic Cancel :: M
    // =====================================

    const cancelled =
        await Withdraw.findOneAndUpdate(

            {

                _id:
                    withdrawId,

                userId,

                status:
                    "PENDING"

            },

            {

                $set: {

                    status:
                        "CANCELLED",

                    processedAt:
                        new Date()

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
            "برداشت همزمان تغییر کرده است"
        );

    }


    // =====================================
    // Return Reserved Balance :: M
    // =====================================

    const wallet =
        await Wallet.findOneAndUpdate(

            {

                _id:
                    withdraw.walletId,

                status:
                    "ACTIVE"

            },

            {

                $inc: {

                    withdrawable:
                        amountUSD

                }

            },

            {

                returnDocument:
                    "after",

                runValidators:
                    true

            }

        );


    if (!wallet) {

        // =================================
        // تلاش برای بازگردانی وضعیت
        // =================================

        await Withdraw.findOneAndUpdate(

            {

                _id:
                    withdrawId,

                status:
                    "CANCELLED"

            },

            {

                $set: {

                    status:
                        "PENDING",

                    processedAt:
                        null

                }

            }

        );


        throw new Error(
            "کیف پول برای برگشت موجودی پیدا نشد"
        );

    }


    return {

        withdraw:
            cancelled,

        wallet,

        refundedAmountUSD:
            amountUSD

    };

}


// =====================================
// Mark Withdraw Processing :: M
// انتقال برداشت به پردازش
// =====================================

export async function markWithdrawProcessing({

    withdrawId

}) {

    if (
        !mongoose.Types.ObjectId.isValid(
            withdrawId
        )
    ) {

        throw new Error(
            "شناسه برداشت نامعتبر است"
        );

    }


    const withdraw =
        await Withdraw.findOneAndUpdate(

            {

                _id:
                    withdrawId,

                status:
                    "PENDING"

            },

            {

                $set: {

                    status:
                        "PROCESSING"

                }

            },

            {

                returnDocument:
                    "after",

                runValidators:
                    true

            }

        );


    if (!withdraw) {

        const existing =
            await Withdraw.findById(
                withdrawId
            );


        if (!existing) {

            throw new Error(
                "درخواست برداشت پیدا نشد"
            );

        }


        if (
            existing.status ===
            "PROCESSING"
        ) {

            return existing;

        }


        throw new Error(
            "این برداشت قابل پردازش نیست"
        );

    }


    return withdraw;

}


// =====================================
// Fail Withdraw :: M
// ناموفق کردن برداشت
// =====================================

export async function failWithdraw({

    withdrawId,

    description = ""

}) {

    if (
        !mongoose.Types.ObjectId.isValid(
            withdrawId
        )
    ) {

        throw new Error(
            "شناسه برداشت نامعتبر است"
        );

    }


    const withdraw =
        await Withdraw.findOne({

            _id:
                withdrawId,

            status: {

                $in: [

                    "PENDING",

                    "PROCESSING"

                ]

            }

        });


    if (!withdraw) {

        const existing =
            await Withdraw.findById(
                withdrawId
            );


        if (!existing) {

            throw new Error(
                "درخواست برداشت پیدا نشد"
            );

        }


        if (
            existing.status ===
            "FAILED"
        ) {

            return existing;

        }


        throw new Error(
            "این برداشت قابل ناموفق کردن نیست"
        );

    }


    const amountUSD =
        Number(
            withdraw.amountUSD || 0
        );


    if (
        !Number.isFinite(
            amountUSD
        ) ||
        amountUSD <= 0
    ) {

        throw new Error(
            "مبلغ برداشت نامعتبر است"
        );

    }


    // =====================================
    // Return Reserved Balance :: M
    // =====================================

    const wallet =
        await Wallet.findOneAndUpdate(

            {

                _id:
                    withdraw.walletId,

                status:
                    "ACTIVE"

            },

            {

                $inc: {

                    withdrawable:
                        amountUSD

                }

            },

            {

                returnDocument:
                    "after",

                runValidators:
                    true

            }

        );


    if (!wallet) {

        throw new Error(
            "کیف پول برای برگشت موجودی پیدا نشد"
        );

    }


    // =====================================
    // Mark Failed :: M
    // =====================================

    const failed =
        await Withdraw.findOneAndUpdate(

            {

                _id:
                    withdrawId,

                status: {

                    $in: [

                        "PENDING",

                        "PROCESSING"

                    ]

                }

            },

            {

                $set: {

                    status:
                        "FAILED",

                    processedAt:
                        new Date(),

                    ...(description
                        ? {

                            description:
                                String(
                                    description
                                )

                        }
                        : {})

                }

            },

            {

                returnDocument:
                    "after",

                runValidators:
                    true

            }

        );


    if (!failed) {

        // =================================
        // Rollback Wallet Refund :: M
        // =================================

        await Wallet.findOneAndUpdate(

            {

                _id:
                    withdraw.walletId

            },

            {

                $inc: {

                    withdrawable:
                        -amountUSD

                }

            }

        );


        throw new Error(
            "وضعیت برداشت همزمان تغییر کرده است"
        );

    }


    return {

        withdraw:
            failed,

        wallet,

        refundedAmountUSD:
            amountUSD

    };

}


// =====================================
// Default Export :: M
// =====================================

export default {

    createWithdrawRequest,

    getUserWithdraws,

    getWithdrawById,

    approveWithdraw,

    rejectWithdraw,

    cancelWithdraw,

    markWithdrawProcessing,

    failWithdraw

};