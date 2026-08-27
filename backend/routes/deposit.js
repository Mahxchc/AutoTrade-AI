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
    getUserDeposits
} from "../services/depositService.js";

import Deposit from "../models/Deposit.js";


const router =
    express.Router();


// =====================================
// CREATE DEPOSIT
// ایجاد درخواست واریز
// POST /api/deposit
// =====================================

router.post(
    "/",
    async (req, res) => {

        try {

            const {

                userId,

                amountToman,

                exchangeRate,

                method,

                gateway

            } = req.body;


            // =====================================
            // بررسی اطلاعات
            // =====================================

            if (!userId) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "شناسه کاربر ارسال نشده است"

                });

            }


            if (
                !mongoose.Types.ObjectId.isValid(
                    userId
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "شناسه کاربر نامعتبر است"

                });

            }


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
            // ایجاد درخواست واریز
            // =====================================

            const deposit =
                await createDeposit({

                    userId,

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
// GET USER DEPOSITS
// دریافت لیست واریزهای کاربر
// GET /api/deposit/user/:userId
// =====================================

router.get(
    "/user/:userId",
    async (req, res) => {

        try {

            const {
                userId
            } = req.params;


            // =====================================
            // بررسی شناسه کاربر
            // =====================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    userId
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "شناسه کاربر نامعتبر است"

                });

            }


            // =====================================
            // دریافت واریزها
            // =====================================

            const deposits =
                await getUserDeposits(
                    userId
                );


            // =====================================
            // پاسخ
            // =====================================

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
                "Get User Deposits Error:",
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
// GET DEPOSIT STATUS
// دریافت وضعیت یک واریز
// GET /api/deposit/:depositId
// =====================================

router.get(
    "/:depositId",
    async (req, res) => {

        try {

            const {
                depositId
            } = req.params;


            // =====================================
            // بررسی شناسه واریز
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
            // پیدا کردن واریز
            // =====================================

            const deposit =
                await Deposit.findById(
                    depositId
                );


            if (!deposit) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "واریز پیدا نشد"

                });

            }


            // =====================================
            // پاسخ وضعیت
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


            return res.status(500).json({

                success:
                    false,

                message:
                    "دریافت وضعیت واریز ناموفق بود"

            });

        }

    }
);


// =====================================
// EXPORT ROUTER
// =====================================

export default router;