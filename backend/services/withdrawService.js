// =====================================
// ..M
// AutoTrade AI
// Withdraw Service
// File: backend/services/withdrawService.js
// =====================================

import mongoose from "mongoose";

import Withdraw from "../models/Withdraw.js";
import Wallet from "../models/Wallet.js";

import {
    getUsdToTomanRate
} from "./currencyService.js";


// =====================================
// ..M
// تنظیمات
// =====================================

const MIN_WITHDRAW_TOMAN = 100000;

const MAX_DECIMALS = 8;

const WITHDRAW_METHODS = [
    "BANK",
    "GATEWAY",
    "OTHER"
];


// =====================================
// ..M
// تبدیل عدد
// =====================================

function toPositiveNumber(value, fieldName) {
    const number = Number(value);

    if (!Number.isFinite(number) || number <= 0) {
        const error = new Error(
            `${fieldName} must be greater than zero`
        );

        error.statusCode = 400;

        throw error;
    }

    return number;
}


// =====================================
// ..M
// گرد کردن مقدار
// =====================================

function round8(value) {
    return Math.round(
        (Number(value) + Number.EPSILON) *
        10 ** MAX_DECIMALS
    ) / 10 ** MAX_DECIMALS;
}


// =====================================
// ..M
// نرمال‌سازی شماره حساب
// =====================================

function normalizeBankAccount(value) {
    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .trim()
        .replace(/\s+/g, "");
}


// =====================================
// ..M
// نرمال‌سازی شبا
// =====================================

function normalizeIban(value) {
    if (!value) {
        return "";
    }

    return String(value)
        .trim()
        .replace(/\s+/g, "")
        .toUpperCase();
}


// =====================================
// ..M
// اعتبارسنجی شبا
// =====================================

function isValidIranianIban(value) {
    const iban = normalizeIban(value);

    return /^IR\d{24}$/.test(iban);
}


// =====================================
// ..M
// اعتبارسنجی ObjectId
// =====================================

function validateObjectId(id, fieldName) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        const error = new Error(
            `Invalid ${fieldName}`
        );

        error.statusCode = 400;

        throw error;
    }
}


// =====================================
// ..M
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
    validateObjectId(userId, "user ID");

    // ---------------------------------
    // ..M
    // بررسی روش برداشت
    // ---------------------------------

    const normalizedMethod =
        String(method || "BANK")
            .trim()
            .toUpperCase();

    if (!WITHDRAW_METHODS.includes(normalizedMethod)) {
        const error = new Error(
            "Invalid withdrawal method"
        );

        error.statusCode = 400;

        throw error;
    }


    // ---------------------------------
    // ..M
    // پیدا کردن کیف پول
    // ---------------------------------

    const wallet = await Wallet.findOne({
        userId
    });

    if (!wallet) {
        const error = new Error(
            "Wallet not found"
        );

        error.statusCode = 404;

        throw error;
    }


    // ---------------------------------
    // ..M
    // بررسی وضعیت کیف پول
    // ---------------------------------

    if (
        wallet.status &&
        String(wallet.status).toUpperCase() !== "ACTIVE"
    ) {
        const error = new Error(
            "Wallet is not active"
        );

        error.statusCode = 403;

        throw error;
    }


    // ---------------------------------
    // ..M
    // دریافت نرخ واقعی سرور
    // ---------------------------------

    const usdToTomanRate =
        await getUsdToTomanRate();

    const rate = Number(usdToTomanRate);

    if (!Number.isFinite(rate) || rate <= 0) {
        const error = new Error(
            "Unable to determine current USD to Toman rate"
        );

        error.statusCode = 503;

        throw error;
    }


    // ---------------------------------
    // ..M
    // موجودی قابل برداشت
    // ---------------------------------

    const withdrawable =
        Number(wallet.withdrawable || 0);

    if (
        !Number.isFinite(withdrawable) ||
        withdrawable <= 0
    ) {
        const error = new Error(
            "Insufficient withdrawable balance"
        );

        error.statusCode = 400;

        throw error;
    }


    // ---------------------------------
    // ..M
    // محاسبه مبلغ برداشت
    // ---------------------------------

    let requestedToman;

    if (withdrawAll === true) {
        requestedToman =
            round8(withdrawable * rate);
    } else {
        requestedToman =
            toPositiveNumber(
                amountToman,
                "amountToman"
            );
    }


    // ---------------------------------
    // ..M
    // حداقل برداشت
    // ---------------------------------

    if (
        requestedToman <
        MIN_WITHDRAW_TOMAN
    ) {
        const error = new Error(
            `Minimum withdrawal is ${MIN_WITHDRAW_TOMAN.toLocaleString("en-US")} Toman`
        );

        error.statusCode = 400;

        throw error;
    }


    // ---------------------------------
    // ..M
    // تبدیل تومان به USD
    // ---------------------------------

    let amountUSD =
        requestedToman / rate;

    amountUSD = round8(amountUSD);


    // ---------------------------------
    // ..M
    // بررسی موجودی
    // ---------------------------------

    if (amountUSD <= 0) {
        const error = new Error(
            "Invalid withdrawal amount"
        );

        error.statusCode = 400;

        throw error;
    }

    if (amountUSD > withdrawable) {
        const error = new Error(
            "Withdrawal amount exceeds withdrawable balance"
        );

        error.statusCode = 400;

        throw error;
    }


    // ---------------------------------
    // ..M
    // اطلاعات بانکی
    // ---------------------------------

    const normalizedBank =
        normalizeBankAccount(bankAccount);

    const normalizedHolder =
        String(accountHolderName || "")
            .trim();


    // ---------------------------------
    // ..M
    // برای BANK شبا الزامی است
    // ---------------------------------

    if (normalizedMethod === "BANK") {
        if (!normalizedBank) {
            const error = new Error(
                "Bank account / IBAN is required"
            );

            error.statusCode = 400;

            throw error;
        }

        if (
            !isValidIranianIban(
                normalizedBank
            )
        ) {
            const error = new Error(
                "Invalid Iranian IBAN. Example: IR123456789012345678901234"
            );

            error.statusCode = 400;

            throw error;
        }

        if (!normalizedHolder) {
            const error = new Error(
                "Account holder name is required"
            );

            error.statusCode = 400;

            throw error;
        }
    }


    // ---------------------------------
    // ..M
    // جلوگیری از چند برداشت همزمان
    // ---------------------------------

    const existingPending =
        await Withdraw.findOne({
            userId,
            status: {
                $in: [
                    "PENDING",
                    "PROCESSING"
                ]
            }
        }).lean();

    if (existingPending) {
        const error = new Error(
            "You already have a pending withdrawal request"
        );

        error.statusCode = 409;

        throw error;
    }


    // ---------------------------------
    // ..M
    // رزرو اتمیک موجودی
    // ---------------------------------

    const updatedWallet =
        await Wallet.findOneAndUpdate(
            {
                _id: wallet._id,
                withdrawable: {
                    $gte: amountUSD
                }
            },
            {
                $inc: {
                    withdrawable: -amountUSD
                }
            },
            {
                returnDocument: "after"
            }
        );

    if (!updatedWallet) {
        const error = new Error(
            "Withdrawable balance changed. Please try again."
        );

        error.statusCode = 409;

        throw error;
    }


    // ---------------------------------
    // ..M
    // ایجاد درخواست
    // ---------------------------------

    try {
        const withdraw =
            await Withdraw.create({
                userId,
                walletId: wallet._id,

                amountUSD,
                amountToman: round8(requestedToman),

                usdToTomanRate: rate,

                method: normalizedMethod,

                bankAccount: normalizedBank,

                accountHolderName:
                    normalizedHolder,

                status: "PENDING",

                transactionId: "",

                description:
                    "Withdrawal request created"
            });

        return withdraw;

    } catch (error) {

        // ---------------------------------
        // ..M
        // اگر ساخت درخواست شکست خورد
        // موجودی رزرو شده برگردانده شود
        // ---------------------------------

        await Wallet.updateOne(
            {
                _id: wallet._id
            },
            {
                $inc: {
                    withdrawable: amountUSD
                }
            }
        );

        throw error;
    }
}


// =====================================
// ..M
// برداشت‌های کاربر
// =====================================

export async function getUserWithdraws({
    userId,
    limit = 50
}) {
    validateObjectId(userId, "user ID");

    const safeLimit = Math.min(
        Math.max(Number(limit) || 50, 1),
        100
    );

    return Withdraw.find({
        userId
    })
        .sort({
            createdAt: -1
        })
        .limit(safeLimit)
        .lean();
}


// =====================================
// ..M
// دریافت یک برداشت
// =====================================

export async function getWithdrawById({
    withdrawId,
    userId
}) {
    validateObjectId(
        withdrawId,
        "withdraw ID"
    );

    validateObjectId(
        userId,
        "user ID"
    );

    const withdraw =
        await Withdraw.findOne({
            _id: withdrawId,
            userId
        }).lean();

    if (!withdraw) {
        const error = new Error(
            "Withdrawal not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return withdraw;
}


// =====================================
// ..M
// تکمیل برداشت
// =====================================

export async function completeWithdraw({
    withdrawId,
    transactionId,
    description = ""
}) {
    validateObjectId(
        withdrawId,
        "withdraw ID"
    );

    const txId =
        String(transactionId || "").trim();

    if (!txId) {
        const error = new Error(
            "Transaction ID is required"
        );

        error.statusCode = 400;

        throw error;
    }


    // ---------------------------------
    // ..M
    // فقط PENDING یا PROCESSING
    // ---------------------------------

    const withdraw =
        await Withdraw.findOneAndUpdate(
            {
                _id: withdrawId,
                status: {
                    $in: [
                        "PENDING",
                        "PROCESSING"
                    ]
                }
            },
            {
                $set: {
                    status: "COMPLETED",
                    transactionId: txId,
                    description:
                        description ||
                        "Withdrawal completed",
                    processedAt: new Date()
                }
            },
            {
                returnDocument: "after"
            }
        );

    if (!withdraw) {
        const existing =
            await Withdraw.findById(
                withdrawId
            ).lean();

        if (!existing) {
            const error = new Error(
                "Withdrawal not found"
            );

            error.statusCode = 404;

            throw error;
        }

        const error = new Error(
            `Withdrawal cannot be completed from status ${existing.status}`
        );

        error.statusCode = 409;

        throw error;
    }

    return withdraw;
}


// =====================================
// ..M
// شکست برداشت
// موجودی رزرو شده برگردانده می‌شود
// =====================================

export async function failWithdraw({
    withdrawId,
    description = "Withdrawal failed"
}) {
    validateObjectId(
        withdrawId,
        "withdraw ID"
    );


    // ---------------------------------
    // ..M
    // ابتدا برداشت را Claim می‌کنیم
    // ---------------------------------

    const withdraw =
        await Withdraw.findOneAndUpdate(
            {
                _id: withdrawId,
                status: {
                    $in: [
                        "PENDING",
                        "PROCESSING"
                    ]
                }
            },
            {
                $set: {
                    status: "FAILED",
                    description,
                    processedAt: new Date()
                }
            },
            {
                returnDocument: "after"
            }
        );

    if (!withdraw) {
        const existing =
            await Withdraw.findById(
                withdrawId
            ).lean();

        if (!existing) {
            const error = new Error(
                "Withdrawal not found"
            );

            error.statusCode = 404;

            throw error;
        }

        const error = new Error(
            `Withdrawal cannot be failed from status ${existing.status}`
        );

        error.statusCode = 409;

        throw error;
    }


    // ---------------------------------
    // ..M
    // بازگرداندن موجودی
    // ---------------------------------

    const walletUpdate =
        await Wallet.updateOne(
            {
                _id: withdraw.walletId
            },
            {
                $inc: {
                    withdrawable:
                        Number(withdraw.amountUSD)
                }
            }
        );

    if (
        walletUpdate.modifiedCount !== 1
    ) {
        console.error(
            "CRITICAL: Failed to restore withdrawable balance",
            {
                withdrawId:
                    withdraw._id.toString(),
                walletId:
                    withdraw.walletId?.toString(),
                amountUSD:
                    withdraw.amountUSD
            }
        );
    }

    return withdraw;
}


// =====================================
// ..M
// لغو برداشت
// موجودی رزرو شده برگردانده می‌شود
// =====================================

export async function cancelWithdraw({
    withdrawId,
    description = "Withdrawal cancelled"
}) {
    validateObjectId(
        withdrawId,
        "withdraw ID"
    );


    // ---------------------------------
    // ..M
    // تغییر وضعیت اتمیک
    // ---------------------------------

    const withdraw =
        await Withdraw.findOneAndUpdate(
            {
                _id: withdrawId,
                status: {
                    $in: [
                        "PENDING",
                        "PROCESSING"
                    ]
                }
            },
            {
                $set: {
                    status: "CANCELLED",
                    description,
                    processedAt: new Date()
                }
            },
            {
                returnDocument: "after"
            }
        );

    if (!withdraw) {
        const existing =
            await Withdraw.findById(
                withdrawId
            ).lean();

        if (!existing) {
            const error = new Error(
                "Withdrawal not found"
            );

            error.statusCode = 404;

            throw error;
        }

        const error = new Error(
            `Withdrawal cannot be cancelled from status ${existing.status}`
        );

        error.statusCode = 409;

        throw error;
    }


    // ---------------------------------
    // ..M
    // بازگرداندن موجودی
    // ---------------------------------

    const walletUpdate =
        await Wallet.updateOne(
            {
                _id: withdraw.walletId
            },
            {
                $inc: {
                    withdrawable:
                        Number(withdraw.amountUSD)
                }
            }
        );

    if (
        walletUpdate.modifiedCount !== 1
    ) {
        console.error(
            "CRITICAL: Failed to restore withdrawable balance",
            {
                withdrawId:
                    withdraw._id.toString(),
                walletId:
                    withdraw.walletId?.toString(),
                amountUSD:
                    withdraw.amountUSD
            }
        );
    }

    return withdraw;
}


// =====================================
// ..M
// Export تنظیمات
// =====================================

export {
    MIN_WITHDRAW_TOMAN
};