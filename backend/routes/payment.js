// =====================================
// AutoTrade AI
// Payment Routes:: M
// مسیرهای تأیید پرداخت
// File: backend/routes/Payment.js
// =====================================

import express from "express";
import mongoose from "mongoose";

import {
    verifyPayment,
    getPaymentStatus
} from "../services/paymentVerificationService.js";


const router =
    express.Router();


// =====================================
// GET PAYMENT STATUS:: M
// دریافت وضعیت پرداخت
// GET /api/payment/:depositId
// =====================================

router.get(
    "/:depositId",
    async (req, res) => {

        try {

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
            // دریافت وضعیت:: M
            // =====================================

            const payment =
                await getPaymentStatus(
                    depositId
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


            return res.status(500).json({

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
// این مسیر نباید توسط Mini App به‌عنوان
// مرجع اعتماد برای تأیید پرداخت استفاده شود.
//
// درگاه واقعی باید پرداخت را تأیید کند
// و سپس این endpoint را فراخوانی کند.
// =====================================

router.post(
    "/verify",
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
            // بررسی اطلاعات:: M
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


            // =====================================
            // بررسی شناسه:: M
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
            // بررسی تأیید درگاه:: M
            // =====================================

            if (
                verified !== true
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "پرداخت توسط درگاه تأیید نشده است"

                });

            }


            // =====================================
            // تأیید پرداخت:: M
            // =====================================

            const result =
                await verifyPayment({

                    depositId,

                    paymentId:
                        paymentId || null,

                    transactionId:
                        transactionId || null,

                    gateway:
                        gateway || null,

                    verified:
                        true

                });


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
                    result.wallet || null

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
// خروجی مسیرها
// =====================================

export default router;
