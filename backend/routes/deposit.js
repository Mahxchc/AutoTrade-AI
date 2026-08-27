// =====================================
// AutoTrade AI
// Deposit Routes:: M
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


const router =
    express.Router();


// =====================================
// Helper: Find Telegram User
// پیدا کردن کاربر از Telegram ID
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
// CREATE DEPOSIT
// ایجاد درخواست واریز
// POST /api/deposit
// =====================================
//
// نکته مهم:
//
// userId از Body به عنوان هویت کاربر
// پذیرفته نمی‌شود.
//
// کاربر از Telegram Authentication
// شناسایی می‌شود.
// =====================================

router.post(
    "/",
    requiredTelegramUser,
    async (req, res) => {

        try {

            const user =
                await getAuthenticatedUser(req);


            const {

                amountToman,

                exchangeRate,

                method,

                gateway

            } = req.body;


            // =====================================
            // بررسی مبلغ
            // =====================================

            if (
                amountToman == null
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "مبلغ واریز مشخص نشده است"

                });

            }


            // =====================================
            // بررسی نرخ
            // =====================================

            if (
                exchangeRate == null
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "نرخ تبدیل دلار مشخص نشده است"

                });

            }


            // =====================================
            // ایجاد Deposit
            // =====================================

            const deposit =
                await createDeposit({

                    userId:
                        user._id,

                    amountToman,

                    exchangeRate,

                    method:
                        method ||
                        "GATEWAY",

                    gateway:
                        gateway ||
                        null

                });


            // =====================================
            // پاسخ
            // =====================================

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
                "Create Deposit Error:",
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
// GET MY DEPOSITS
// دریافت واریزهای کاربر فعلی
// GET /api/deposit/my
// =====================================

router.get(
    "/my",
    requiredTelegramUser,
    async (req, res) => {

        try {

            const user =
                await getAuthenticatedUser(req);


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
                "Get My Deposits Error:",
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
// GET MY DEPOSIT STATUS
// دریافت وضعیت واریز خود کاربر
// GET /api/deposit/:depositId
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
            // Validate Deposit ID
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
            // فقط واریز متعلق به همین کاربر
            // =====================================

            const deposit =
                await getDepositById({

                    depositId,

                    userId:
                        user._id

                });


            // =====================================
            // پاسخ
            // =====================================

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
                "Get Deposit Status Error:",
                error
            );


            const statusCode =
                error.message ===
                "واریز پیدا نشد"
                    ? 404
                    : 500;


            return res.status(
                statusCode
            ).json({

                success:
                    false,

                message:
                    error.message ||
                    "دریافت وضعیت واریز ناموفق بود"

            });

        }

    }
);


// =====================================
// EXPORT ROUTER
// =====================================

export default router;