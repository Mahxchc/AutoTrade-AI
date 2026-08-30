// =====================================
// ..M AutoTrade AI
// Payment Routes
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
// ..M Get Authenticated User
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
// ..M GET MY PAYMENT STATUS
// وضعیت پرداخت کاربر
// GET /api/payment/:depositId
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
            // ..M Get Payment Status
            // =================================

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
                "[GET PAYMENT STATUS ERROR]",
                error
            );


            const message =
                error.message ||
                "دریافت وضعیت پرداخت ناموفق بود";


            const statusCode =
                message ===
                "Payment not found"
                    ? 404
                    : 400;


            return res.status(
                statusCode
            ).json({

                success:
                    false,

                message

            });

        }

    }
);


// =====================================
// ..M VERIFY PAYMENT
// تأیید پرداخت
// POST /api/payment/verify
// =====================================
//
// فقط Admin.
//
// نکته امنیتی:
//
// verified از Client به عنوان حقیقت
// پرداخت پذیرفته نمی‌شود.
//
// verifyPayment باید وضعیت واقعی
// پرداخت را بررسی کند.
// =====================================

router.post(
    "/verify",
    requiredTelegramUser,
    requiredAdmin,
    async (
        req,
        res
    ) => {

        try {

            const {
                depositId,
                paymentId,
                transactionId,
                gateway
            } = req.body;


            // =================================
            // ..M Deposit ID
            // =================================

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


            // =================================
            // ..M Payment ID
            // =================================

            if (
                paymentId !== undefined &&
                paymentId !== null &&
                String(paymentId).trim() === ""
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Payment ID نامعتبر است"

                });

            }


            // =================================
            // ..M Transaction ID
            // =================================

            if (
                transactionId !== undefined &&
                transactionId !== null &&
                String(transactionId).trim() === ""
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Transaction ID نامعتبر است"

                });

            }


            // =================================
            // ..M Gateway
            // =================================

            const normalizedGateway =
                gateway
                    ? String(
                        gateway
                    )
                    .trim()
                    .toUpperCase()
                    : null;


            // =================================
            // ..M Verify Payment
            // =================================
            //
            // توجه:
            //
            // دیگر verified:true از Client
            // دریافت نمی‌کنیم.
            //
            // سرویس Verification باید خودش
            // پرداخت واقعی را بررسی کند.
            // =================================

            const result =
                await verifyPayment({

                    depositId,

                    paymentId:
                        paymentId
                            ? String(
                                paymentId
                            ).trim()
                            : null,

                    transactionId:
                        transactionId
                            ? String(
                                transactionId
                            ).trim()
                            : null,

                    gateway:
                        normalizedGateway

                });


            // =================================
            // ..M Already Verified
            // =================================

            if (
                result?.alreadyVerified
            ) {

                return res.status(200).json({

                    success:
                        true,

                    verified:
                        true,

                    alreadyVerified:
                        true,

                    message:
                        "این پرداخت قبلاً تأیید شده است",

                    deposit:
                        result.deposit ||
                        null,

                    wallet:
                        result.wallet ||
                        null

                });

            }


            // =================================
            // ..M Successful Verification
            // =================================

            return res.status(200).json({

                success:
                    true,

                verified:
                    true,

                alreadyVerified:
                    false,

                message:
                    "پرداخت با موفقیت تأیید شد",

                deposit:
                    result.deposit ||
                    null,

                wallet:
                    result.wallet ||
                    null

            });

        }

        catch (error) {

            console.error(
                "[VERIFY PAYMENT ERROR]",
                error
            );


            return res.status(400).json({

                success:
                    false,

                verified:
                    false,

                message:
                    error.message ||
                    "تأیید پرداخت ناموفق بود"

            });

        }

    }
);


// =====================================
// ..M EXPORT
// =====================================

export default router;