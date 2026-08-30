// =====================================
// ..M AutoTrade AI
// Deposit Routes
// مسیرهای واریز برای Mini App
// File: backend/routes/deposit.js
// =====================================

import express from "express";
import mongoose from "mongoose";

import {
    createDeposit,
    getUserDeposits,
    getDepositById
} from "../services/depositService.js";

import User from "../models/User.js";

import {
    requiredTelegramUser
} from "../middleware/auth.js";

import {
    getUsdToTomanRate
} from "../services/currencyService.js";


const router =
    express.Router();


// =====================================
// ..M Find Authenticated User
// پیدا کردن کاربر احراز شده
// =====================================

async function getAuthenticatedUser(req) {

    const telegramId =
        req.telegramId ||
        req.telegramUser?.id ||
        req.user?.telegramId;


    if (!telegramId) {

        throw new Error(
            "Telegram user is not authenticated"
        );

    }


    const user =
        await User.findOne({

            telegramId:
                String(telegramId)

        });


    if (!user) {

        throw new Error(
            "User not found"
        );

    }


    return user;

}


// =====================================
// ..M Positive Number
// بررسی عدد مثبت
// =====================================

function toPositiveNumber(
    value
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number) ||
        number <= 0
    ) {

        return null;

    }


    return number;

}


// =====================================
// ..M CREATE DEPOSIT
// ایجاد درخواست واریز
// POST /api/deposit
// =====================================
//
// نکته امنیتی:
//
// userId از Body پذیرفته نمی‌شود.
//
// exchangeRate نیز از Client پذیرفته
// نمی‌شود.
//
// نرخ تبدیل مستقیماً از Backend گرفته می‌شود.
// =====================================

router.post(
    "/",
    requiredTelegramUser,
    async (
        req,
        res
    ) => {

        try {

            const user =
                await getAuthenticatedUser(
                    req
                );


            // =================================
            // ..M Amount
            // =================================

            const amountToman =
                toPositiveNumber(
                    req.body?.amountToman
                );


            if (
                amountToman === null
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "مبلغ واریز باید یک عدد مثبت باشد"

                });

            }


            // =================================
            // ..M Minimum Amount
            // حداقل مبلغ واریز
            // =================================

            const minimumDeposit =
                Number(
                    process.env.MIN_DEPOSIT_TOMAN ||
                    100000
                );


            if (
                amountToman <
                minimumDeposit
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        `حداقل مبلغ واریز ${minimumDeposit.toLocaleString("fa-IR")} تومان است`

                });

            }


            // =================================
            // ..M Server Exchange Rate
            // نرخ واقعی Backend
            // =================================

            const exchangeRate =
                Number(
                    await getUsdToTomanRate()
                );


            if (
                !Number.isFinite(
                    exchangeRate
                ) ||
                exchangeRate <= 0
            ) {

                return res.status(503).json({

                    success:
                        false,

                    message:
                        "نرخ تبدیل دلار در حال حاضر در دسترس نیست"

                });

            }


            // =================================
            // ..M Payment Method
            // =================================

            const method =
                typeof req.body?.method ===
                "string"

                    ? req.body.method
                        .trim()
                        .toUpperCase()

                    : "GATEWAY";


            const gateway =
                typeof req.body?.gateway ===
                "string"

                    ? req.body.gateway
                        .trim()

                    : null;


            // =================================
            // ..M Create Deposit
            // =================================

            const deposit =
                await createDeposit({

                    userId:
                        user._id,

                    amountToman,

                    exchangeRate,

                    method,

                    gateway:
                        gateway ||
                        null

                });


            // =================================
            // ..M Response
            // =================================

            return res.status(201).json({

                success:
                    true,

                message:
                    "درخواست واریز با موفقیت ایجاد شد",

                deposit: {

                    id:
                        deposit._id,

                    userId:
                        deposit.userId,

                    amountToman:
                        deposit.amountToman,

                    amountUSD:
                        deposit.amountUSD,

                    exchangeRate:
                        deposit.exchangeRate,

                    method:
                        deposit.method,

                    gateway:
                        deposit.gateway,

                    status:
                        deposit.status,

                    walletCredited:
                        deposit.walletCredited,

                    createdAt:
                        deposit.createdAt

                }

            });

        }

        catch (error) {

            console.error(
                "[CREATE DEPOSIT ERROR]",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "ایجاد درخواست واریز ناموفق بود"

            });

        }

    }
);


// =====================================
// ..M GET MY DEPOSITS
// دریافت واریزهای کاربر
// GET /api/deposit/my
// =====================================

router.get(
    "/my",
    requiredTelegramUser,
    async (
        req,
        res
    ) => {

        try {

            const user =
                await getAuthenticatedUser(
                    req
                );


            const deposits =
                await getUserDeposits(
                    user._id
                );


            return res.status(200).json({

                success:
                    true,

                count:
                    deposits.length,

                deposits

            });

        }

        catch (error) {

            console.error(
                "[GET MY DEPOSITS ERROR]",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    "دریافت واریزها ناموفق بود"

            });

        }

    }
);


// =====================================
// ..M GET MY DEPOSIT
// دریافت وضعیت یک واریز
// GET /api/deposit/:depositId
// =====================================

router.get(
    "/:depositId",
    requiredTelegramUser,
    async (
        req,
        res
    ) => {

        try {

            const user =
                await getAuthenticatedUser(
                    req
                );


            const {
                depositId
            } = req.params;


            // =================================
            // ..M Validate Deposit ID
            // =================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    depositId
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "شناسه واریز نامعتبر است"

                });

            }


            // =================================
            // ..M Get Deposit
            // =================================

            const deposit =
                await getDepositById({

                    depositId,

                    userId:
                        user._id

                });


            // =================================
            // ..M Response
            // =================================

            return res.status(200).json({

                success:
                    true,

                deposit: {

                    id:
                        deposit._id,

                    userId:
                        deposit.userId,

                    amountToman:
                        deposit.amountToman,

                    amountUSD:
                        deposit.amountUSD,

                    exchangeRate:
                        deposit.exchangeRate,

                    method:
                        deposit.method,

                    gateway:
                        deposit.gateway,

                    paymentId:
                        deposit.paymentId,

                    transactionId:
                        deposit.transactionId,

                    status:
                        deposit.status,

                    walletCredited:
                        deposit.walletCredited,

                    confirmedAt:
                        deposit.confirmedAt,

                    createdAt:
                        deposit.createdAt,

                    updatedAt:
                        deposit.updatedAt

                }

            });

        }

        catch (error) {

            console.error(
                "[GET DEPOSIT ERROR]",
                error
            );


            const message =
                error.message ||
                "";


            const statusCode =
                message ===
                "واریز پیدا نشد"
                    ? 404
                    : 500;


            return res.status(
                statusCode
            ).json({

                success:
                    false,

                message:
                    message ||
                    "دریافت وضعیت واریز ناموفق بود"

            });

        }

    }
);


// =====================================
// ..M EXPORT
// =====================================

export default router;