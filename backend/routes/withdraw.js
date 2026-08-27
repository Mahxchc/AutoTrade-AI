// =====================================
// Withdraw Routes:: M
// AutoTrade AI
// مسیرهای امن برداشت
// File: backend/routes/withdraw.js
// =====================================

import express from "express";
import mongoose from "mongoose";

import {
    createWithdrawRequest,
    getWithdrawStatus,
    cancelWithdrawRequest
} from "../services/withdrawService.js";

import User from "../models/User.js";

import {
    requiredTelegramUser
} from "../middleware/auth.js";


const router =
    express.Router();


// =====================================
// Helper: Get Authenticated User:: M
// دریافت کاربر احراز هویت‌شده
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
// CREATE WITHDRAW:: M
// ایجاد درخواست برداشت
// POST /api/withdraw
// =====================================
//
// amountUSD می‌تواند:
//
// 10 USDT
// 50 USDT
// یا کل withdrawable
//
// باشد.
//
// خود withdrawService سقف موجودی را
// کنترل می‌کند.
// =====================================

router.post(
    "/",
    requiredTelegramUser,
    async (req, res) => {

        try {

            const user =
                await getAuthenticatedUser(req);


            const {

                amountUSD,

                method,

                bankAccount,

                accountHolderName

            } = req.body;


            // =====================================
            // بررسی مبلغ:: M
            // =====================================

            if (
                amountUSD == null
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "مبلغ برداشت مشخص نشده است"

                });

            }


            // =====================================
            // ایجاد درخواست برداشت:: M
            // =====================================

            const result =
                await createWithdrawRequest({

                    userId:
                        user._id,

                    amountUSD,

                    method:
                        method ||
                        "BANK",

                    bankAccount:
                        bankAccount ||
                        "",

                    accountHolderName:
                        accountHolderName ||
                        ""

                });


            // =====================================
            // پاسخ:: M
            // =====================================

            return res.status(201).json({

                success:
                    true,

                message:
                    "درخواست برداشت با موفقیت ایجاد شد",

                withdrawal:
                    result

            });

        }

        catch (error) {

            console.error(
                "Create Withdraw Error:",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "ایجاد درخواست برداشت ناموفق بود"

            });

        }

    }
);


// =====================================
// GET MY WITHDRAW STATUS:: M
// دریافت وضعیت برداشت خود کاربر
// GET /api/withdraw/:requestId
// =====================================

router.get(
    "/:requestId",
    requiredTelegramUser,
    async (req, res) => {

        try {

            const user =
                await getAuthenticatedUser(req);


            const {
                requestId
            } = req.params;


            // =====================================
            // Validate Request ID:: M
            // =====================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    requestId
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "شناسه درخواست برداشت نامعتبر است"

                });

            }


            // =====================================
            // دریافت وضعیت:: M
            // =====================================

            const result =
                await getWithdrawStatus({

                    userId:
                        user._id,

                    requestId

                });


            // =====================================
            // پاسخ:: M
            // =====================================

            return res.status(200).json({

                success:
                    true,

                withdrawal:
                    result

            });

        }

        catch (error) {

            console.error(
                "Get Withdraw Status Error:",
                error
            );


            const statusCode =
                error.message ===
                "Withdrawal request not found"
                    ? 404
                    : 400;


            return res.status(
                statusCode
            ).json({

                success:
                    false,

                message:
                    error.message ||
                    "دریافت وضعیت برداشت ناموفق بود"

            });

        }

    }
);


// =====================================
// CANCEL WITHDRAW:: M
// لغو درخواست برداشت
// POST /api/withdraw/cancel/:requestId
// =====================================
//
// فقط PENDING قابل لغو است.
//
// مبلغ رزروشده نیز توسط
// withdrawService به withdrawable
// برگردانده می‌شود.
// =====================================

router.post(
    "/cancel/:requestId",
    requiredTelegramUser,
    async (req, res) => {

        try {

            const user =
                await getAuthenticatedUser(req);


            const {
                requestId
            } = req.params;


            // =====================================
            // Validate Request ID:: M
            // =====================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    requestId
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "شناسه درخواست برداشت نامعتبر است"

                });

            }


            // =====================================
            // لغو درخواست:: M
            // =====================================

            const result =
                await cancelWithdrawRequest({

                    userId:
                        user._id,

                    requestId

                });


            // =====================================
            // پاسخ:: M
            // =====================================

            return res.status(200).json({

                success:
                    true,

                message:
                    "درخواست برداشت با موفقیت لغو شد",

                withdrawal:
                    result

            });

        }

        catch (error) {

            console.error(
                "Cancel Withdraw Error:",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "لغو درخواست برداشت ناموفق بود"

            });

        }

    }
);


// =====================================
// EXPORT ROUTER:: M
// =====================================

export default router;