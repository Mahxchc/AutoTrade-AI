// =====================================
// AutoTrade AI
// Deposit Service :: M
// سرویس مدیریت واریز
// File: backend/services/depositService.js
// =====================================

import mongoose from "mongoose";

import Deposit from "../models/Deposit.js";
import Wallet from "../models/Wallet.js";

import {
    getUsdIrrRate
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
// Create Deposit :: M
// ایجاد درخواست واریز
// =====================================
//
// تومان
//   ↓
// نرخ واقعی سرور
//   ↓
// USD
//   ↓
// USDT
//
// Wallet در این مرحله شارژ نمی‌شود.
// =====================================

export async function createDeposit({

    userId,

    amountToman,

    exchangeRate = null,

    method = "GATEWAY",

    gateway = null

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
    // Validate Amount :: M
    // =====================================

    const toman =
        toPositiveNumber(
            amountToman,
            "مبلغ واریز نامعتبر است"
        );


    // =====================================
    // Get Server Exchange Rate :: M
    // =====================================
    //
    // اگر نرخ از Mini App ارسال شود،
    // به آن اعتماد نمی‌کنیم.
    //
    // نرخ معتبر از سرور دریافت می‌شود.
    // =====================================

    let rate;


    try {

        rate =
            await getUsdIrrRate();

    }

    catch (error) {

        console.error(
            "[DEPOSIT] Currency rate error:",
            error.message
        );


        // ---------------------------------
        // فقط برای سازگاری داخلی
        // ---------------------------------

        if (
            exchangeRate !== null &&
            Number.isFinite(
                Number(exchangeRate)
            ) &&
            Number(exchangeRate) > 0
        ) {

            rate =
                Number(exchangeRate);

        }

        else {

            throw new Error(
                "نرخ تبدیل دلار در دسترس نیست"
            );

        }

    }


    rate =
        toPositiveNumber(
            rate,
            "نرخ دلار نامعتبر است"
        );


    // =====================================
    // Validate Payment Method :: M
    // =====================================

    const allowedMethods = [

        "BANK",

        "GATEWAY",

        "OTHER"

    ];


    const normalizedMethod =
        String(method)
            .toUpperCase()
            .trim();


    if (
        !allowedMethods.includes(
            normalizedMethod
        )
    ) {

        throw new Error(
            "روش پرداخت نامعتبر است"
        );

    }


    // =====================================
    // Calculate USD :: M
    // =====================================

    const amountUSD =
        round8(
            toman / rate
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
    // USDT = USD :: M
    // =====================================
    //
    // در سیستم فعلی:
    //
    // 1 USD = 1 USDT
    //
    // =====================================

    const amountUSDT =
        round8(
            amountUSD
        );


    // =====================================
    // Create Deposit :: M
    // =====================================

    const deposit =
        await Deposit.create({

            userId,

            amountToman:
                toman,

            amountUSD,

            amountUSDT,

            exchangeRate:
                rate,

            method:
                normalizedMethod,

            gateway:
                gateway
                    ? String(gateway)
                    : null,

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
// Confirm Deposit :: M
// تأیید واقعی و شارژ کیف پول
// =====================================
//
// هشدار:
//
// این تابع نباید مستقیماً توسط Mini App
// قابل دسترسی باشد.
//
// فقط Webhook / Callback معتبر درگاه
// یا سیستم داخلی مورد اعتماد باید آن را
// فراخوانی کند.
//
// =====================================

export async function confirmDeposit({

    depositId,

    paymentId = null,

    transactionId = null,

    gateway = null

}) {

    // =====================================
    // Validate Deposit ID :: M
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
    // Find Deposit :: M
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
    // Already Credited :: M
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
                true,

            creditedAmountUSD:
                Number(
                    deposit.amountUSD || 0
                ),

            creditedAmountUSDT:
                Number(
                    deposit.amountUSDT ||
                    deposit.amountUSD ||
                    0
                ),

            newBalanceUSD:
                wallet
                    ? Number(
                        wallet.balance || 0
                    )
                    : 0

        };

    }


    // =====================================
    // Validate Status :: M
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
    // Validate Amount :: M
    // =====================================

    const amountUSDT =
        Number(
            deposit.amountUSDT ??
            deposit.amountUSD
        );


    if (
        !Number.isFinite(amountUSDT) ||
        amountUSDT <= 0
    ) {

        throw new Error(
            "مبلغ USDT واریز نامعتبر است"
        );

    }


    // =====================================
    // Find Wallet :: M
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
    // Validate Wallet :: M
    // =====================================

    if (
        wallet.status !== "ACTIVE"
    ) {

        throw new Error(
            "کیف پول کاربر فعال نیست"
        );

    }


    const currentBalance =
        Number(
            wallet.balance || 0
        );


    const currentWithdrawable =
        Number(
            wallet.withdrawable || 0
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


    if (
        !Number.isFinite(
            currentWithdrawable
        ) ||
        currentWithdrawable < 0
    ) {

        throw new Error(
            "موجودی قابل برداشت نامعتبر است"
        );

    }


    // =====================================
    // Atomic Deposit Claim :: M
    // گرفتن مالکیت عملیات تأیید
    // =====================================
    //
    // فقط اولین درخواست می‌تواند Deposit
    // را از PENDING/PROCESSING به COMPLETED
    // تغییر دهد.
    //
    // درخواست تکراری دیگر وارد شارژ Wallet
    // نمی‌شود.
    // =====================================

    const claimedDeposit =
        await Deposit.findOneAndUpdate(

            {

                _id:
                    depositId,

                walletCredited:
                    false,

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
                        "COMPLETED",

                    walletCredited:
                        true,

                    confirmedAt:
                        new Date(),

                    ...(paymentId
                        ? {
                            paymentId:
                                String(
                                    paymentId
                                )
                        }
                        : {}),

                    ...(transactionId
                        ? {
                            transactionId:
                                String(
                                    transactionId
                                )
                        }
                        : {}),

                    ...(gateway
                        ? {
                            gateway:
                                String(
                                    gateway
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


    // =====================================
    // Another Request Already Confirmed
    // =====================================

    if (!claimedDeposit) {

        const latestDeposit =
            await Deposit.findById(
                depositId
            );


        const latestWallet =
            await Wallet.findOne({

                userId:
                    deposit.userId

            });


        if (
            latestDeposit &&
            (
                latestDeposit.walletCredited ===
                true ||
                latestDeposit.status ===
                "COMPLETED"
            )
        ) {

            return {

                deposit:
                    latestDeposit,

                wallet:
                    latestWallet,

                alreadyCredited:
                    true,

                creditedAmountUSD:
                    Number(
                        latestDeposit.amountUSD ||
                        0
                    ),

                creditedAmountUSDT:
                    Number(
                        latestDeposit.amountUSDT ??
                        latestDeposit.amountUSD ??
                        0
                    ),

                newBalanceUSD:
                    latestWallet
                        ? Number(
                            latestWallet.balance ||
                            0
                        )
                        : 0

            };

        }


        throw new Error(
            "تأیید واریز همزمان یا نامعتبر است"
        );

    }


    // =====================================
    // Credit Wallet :: M
    // =====================================

    const newBalance =
        round8(
            currentBalance +
            amountUSDT
        );


    const newWithdrawable =
        round8(
            currentWithdrawable +
            amountUSDT
        );


    wallet.balance =
        newBalance;


    wallet.withdrawable =
        newWithdrawable;


    // =====================================
    // Save Wallet :: M
    // =====================================

    await wallet.save();


    // =====================================
    // Result :: M
    // =====================================

    return {

        deposit:
            claimedDeposit,

        wallet,

        alreadyCredited:
            false,

        creditedAmountUSD:
            Number(
                claimedDeposit.amountUSD ||
                amountUSDT
            ),

        creditedAmountUSDT:
            amountUSDT,

        newBalanceUSD:
            newBalance,

        newBalanceUSDT:
            newBalance

    };

}


// =====================================
// Get User Deposits :: M
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

            createdAt:
                -1

        })
        .limit(100);


    return deposits;

}


// =====================================
// Get Deposit By ID :: M
// دریافت یک واریز
// =====================================

export async function getDepositById({

    depositId,

    userId = null

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


    const query = {

        _id:
            depositId

    };


    // =====================================
    // User Ownership :: M
    // =====================================

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
// Mark Deposit Processing :: M
// انتقال به پردازش
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
        await Deposit.findOneAndUpdate(

            {

                _id:
                    depositId,

                status:
                    "PENDING",

                walletCredited:
                    false

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


    if (!deposit) {

        const existing =
            await Deposit.findById(
                depositId
            );


        if (!existing) {

            throw new Error(
                "واریز پیدا نشد"
            );

        }


        if (
            existing.walletCredited === true ||
            existing.status === "PROCESSING"
        ) {

            return existing;

        }


        throw new Error(
            "این واریز در وضعیت قابل پردازش نیست"
        );

    }


    return deposit;

}


// =====================================
// Fail Deposit :: M
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
        await Deposit.findOneAndUpdate(

            {

                _id:
                    depositId,

                walletCredited:
                    false,

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


    if (!deposit) {

        const existing =
            await Deposit.findById(
                depositId
            );


        if (!existing) {

            throw new Error(
                "واریز پیدا نشد"
            );

        }


        if (
            existing.walletCredited === true ||
            existing.status === "COMPLETED"
        ) {

            throw new Error(
                "واریز تکمیل شده را نمی‌توان ناموفق کرد"
            );

        }


        throw new Error(
            "این واریز قابل ناموفق کردن نیست"
        );

    }


    return deposit;

}


// =====================================
// Cancel Deposit :: M
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
        await Deposit.findOneAndUpdate(

            {

                _id:
                    depositId,

                walletCredited:
                    false,

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
                        "CANCELLED",

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


    if (!deposit) {

        const existing =
            await Deposit.findById(
                depositId
            );


        if (!existing) {

            throw new Error(
                "واریز پیدا نشد"
            );

        }


        if (
            existing.walletCredited === true ||
            existing.status === "COMPLETED"
        ) {

            throw new Error(
                "واریز تکمیل شده را نمی‌توان لغو کرد"
            );

        }


        throw new Error(
            "این واریز قابل لغو کردن نیست"
        );

    }


    return deposit;

}


// =====================================
// Default Export :: M
// =====================================

export default {

    createDeposit,

    confirmDeposit,

    getUserDeposits,

    getDepositById,

    markDepositProcessing,

    failDeposit,

    cancelDeposit

};