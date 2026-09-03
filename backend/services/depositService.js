// =====================================
// ..M
// AutoTrade AI
// Deposit Service
// سرویس مدیریت واریز
// File: backend/services/depositService.js
// =====================================

import mongoose from "mongoose";

import Deposit from "../models/Deposit.js";
import Wallet from "../models/Wallet.js";

import {
    getUsdToIrrRate
} from "./currencyService.js";


// =====================================
// ..M
// Helpers
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
// ..M
// Round Money
// =====================================

function round8(
    value
) {

    return Number(
        Number(value).toFixed(8)
    );

}


// =====================================
// ..M
// Create Deposit
// ایجاد درخواست واریز
// =====================================

export async function createDeposit({

    userId,

    amountToman,

    exchangeRate = null,

    method = "GATEWAY",

    gateway = null

}) {

    // =====================================
    // ..M
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
    // ..M
    // Validate Amount
    // =====================================

    const toman =
        toPositiveNumber(
            amountToman,
            "مبلغ واریز نامعتبر است"
        );


    // =====================================
    // ..M
    // Get Server Exchange Rate
    // =====================================

    let rate;

    try {

        // ---------------------------------
        // ..M
        // نرخ فقط از Currency Service
        // ---------------------------------

        rate =
            await getUsdToIrrRate();

    }

    catch (error) {

        console.error(
            "[DEPOSIT] Currency rate error:",
            error.message
        );


        // ---------------------------------
        // ..M
        // Fallback داخلی
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


    // =====================================
    // ..M
    // Validate Rate
    // =====================================

    rate =
        toPositiveNumber(
            rate,
            "نرخ دلار نامعتبر است"
        );


    // =====================================
    // ..M
    // Validate Payment Method
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
    // ..M
    // Calculate USD
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
    // ..M
    // USD = USDT
    // =====================================

    const amountUSDT =
        round8(
            amountUSD
        );


    // =====================================
    // ..M
    // Create Deposit
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
// ..M
// Confirm Deposit
// تأیید واریز و شارژ کیف پول
// =====================================

export async function confirmDeposit({

    depositId,

    paymentId = null,

    transactionId = null,

    gateway = null

}) {

    // =====================================
    // ..M
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
    // ..M
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
    // ..M
    // Already Credited
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
                    deposit.amountUSDT ??
                    deposit.amountUSD ??
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
    // ..M
    // Validate Status
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
    // ..M
    // Validate Amount
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
    // ..M
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
    // ..M
    // Validate Wallet
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
    // ..M
    // Atomic Deposit Claim
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
    // ..M
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
                latestDeposit.walletCredited === true ||
                latestDeposit.status === "COMPLETED"
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
    // ..M
    // Credit Wallet
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
    // ..M
    // Save Wallet
    // =====================================

    await wallet.save();


    // =====================================
    // ..M
    // Result
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
// ..M
// Get User Deposits
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
// ..M
// Get Deposit By ID
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
    // ..M
    // User Ownership
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
// ..M
// Mark Deposit Processing
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
// ..M
// Fail Deposit
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
// ..M
// Cancel Deposit
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
// ..M
// Default Export
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