// =====================================
// AutoTrade AI
// Deposit Routes:: M
// مسیرهای واریز برای Mini App
// File: backend/routes/Deposit.js
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
// CREATE DEPOSIT:: M
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
            // بررسی اطلاعات:: M
            // =====================================

            if (
                !userId ||
                amountToman == null ||
                exchangeRate == null
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "اطلاعات واریز کامل نیست"

                });

            }


            // =====================================
            // ایجاد درخواست واریز:: M
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


            return res.status(201).json({

                success:
                    true,

                message:
                    "درخواست واریز ایجاد شد",

                deposit

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
// GET USER DEPOSITS:: M
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
            // بررسی شناسه کاربر:: M
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
            // دریافت واریزها:: M
            // =====================================

            const deposits =
                await getUserDeposits(
                    userId
                );


            return res.status(200).json({

                success:
                    true,

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
// GET DEPOSIT STATUS:: M
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
            // پیدا کردن واریز:: M
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


            return res.status(200).json({

                success:
                    true,

                deposit

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
// EXPORT ROUTER:: M
// خروجی مسیرهای واریز
// =====================================

export default router;
