// =====================================
// AutoTrade AI
// Payment Routes:: M
// مسیرهای تأیید و وضعیت پرداخت
// File: backend/routes/payment.js
// =====================================

import express from "express";
import mongoose from "mongoose";

import {
    verifyPayment,
    getPaymentStatus
} from "../services/paymentVerificationService.js";

import User from "../models/User.js";

import {
    requiredTelegramUser,
    requiredAdmin
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
// GET MY PAYMENT STATUS:: M
// دریافت وضعیت پرداخت خود کاربر
// GET /api/payment/:depositId
// =====================================

router.get(
    "/:depositId",
    requiredTelegramUser,
    async (req, res) => {

        try {

            const user =
                await getAuthenticatedUser(req);


            const {
                depositId
            } = req.params;


            // =====================================
            // بررسی شناسه واریز:: M
            // =====================================

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


            // =====================================
            // دریافت وضعیت پرداخت:: M
            // =====================================

            const payment =
                await getPaymentStatus(
                    depositId,
                    user._id
                );


            return res.status(200).json({

                success:
                    true,

                payment

            });

        }

        catch (error) {

            console.error(
                "Get Payment Status Error:",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "دریافت وضعیت پرداخت ناموفق بود"

            });

        }

    }
);


// =====================================
// VERIFY PAYMENT:: M
// تأیید پرداخت
// POST /api/payment/verify
// =====================================
//
// این endpoint فقط برای Admin است.
//
// Mini App نباید بتواند:
//
// verified: true
//
// ارسال کند و Wallet را شارژ کند.
//
// تأیید واقعی باید توسط درگاه یا
// سیستم پرداخت انجام شود.
// =====================================

router.post(
    "/verify",
    requiredTelegramUser,
    requiredAdmin,
    async (req, res) => {

        try {

            const {
                depositId,
                paymentId,
                transactionId,
                gateway,
                verified
            } = req.body;


            // =====================================
            // بررسی شناسه واریز:: M
            // =====================================

            if (
                !depositId
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "شناسه واریز الزامی است"

                });

            }


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


            // =====================================
            // بررسی تأیید پرداخت:: M
            // =====================================

            if (
                verified !== true
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "پرداخت تأیید نشده است"

                });

            }


            // =====================================
            // تأیید پرداخت:: M
            // =====================================

            const result =
                await verifyPayment({

                    depositId,

                    paymentId:
                        paymentId ||
                        null,

                    transactionId:
                        transactionId ||
                        null,

                    gateway:
                        gateway ||
                        null,

                    verified:
                        true

                });


            // =====================================
            // نتیجه:: M
            // =====================================

            return res.status(200).json({

                success:
                    true,

                message:
                    result.alreadyVerified

                        ? "این پرداخت قبلاً تأیید شده است"

                        : "پرداخت با موفقیت تأیید شد",

                deposit:
                    result.deposit,

                wallet:
                    result.wallet ||
                    null

            });

        }

        catch (error) {

            console.error(
                "Verify Payment Error:",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "تأیید پرداخت ناموفق بود"

            });

        }

    }
);


// =====================================
// EXPORT ROUTER:: M
// =====================================

export default router;