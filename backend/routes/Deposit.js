// =====================================
// AutoTrade AI
// Deposit Routes:: M
// مسیرهای واریز
// File: backend/routes/Deposit.js
// =====================================

import express from "express";
import mongoose from "mongoose";

import Deposit from "../models/Deposit.js";

import {
    createDeposit,
    getUserDeposits
} from "../services/depositService.js";


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
                method
            } = req.body;


            // =====================================
            // بررسی اطلاعات:: M
            // =====================================

            if (
                !userId ||
                amountToman == null
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "شناسه کاربر و مبلغ واریز الزامی است"

                });

            }


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
            // ایجاد درخواست:: M
            // =====================================

            const deposit =
                await createDeposit({

                    userId,

                    amountToman,

                    method:
                        method || "BANK"

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
// دریافت واریزهای کاربر
// GET /api/deposit/:userId
// =====================================

router.get(
    "/:userId",
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
                "Get Deposits Error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "دریافت واریزها ناموفق بود"

            });

        }

    }
);


// =====================================
// GET SINGLE DEPOSIT:: M
// دریافت یک واریز
// GET /api/deposit/detail/:depositId
// =====================================

router.get(
    "/detail/:depositId",
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
            // دریافت واریز:: M
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
                "Get Deposit Error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "دریافت اطلاعات واریز ناموفق بود"

            });

        }

    }
);


// =====================================
// EXPORT ROUTER:: M
// خروجی مسیرهای واریز
// =====================================

export default router;
