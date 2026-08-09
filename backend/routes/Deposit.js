// =====================================
// Deposit Routes:: M
// AutoTrade AI
// مسیرهای واریز
// File: backend/routes/Deposit.js
// =====================================

import express from "express";

import {
    createDepositRequest,
    getDeposit,
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

                amountUSD,

                usdToTomanRate,

                method

            } = req.body;


            // =====================================
            // بررسی اطلاعات:: M
            // =====================================

            if (
                !userId ||
                amountUSD == null ||
                usdToTomanRate == null
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "User ID, USD amount and exchange rate are required"

                });

            }


            // =====================================
            // ایجاد درخواست:: M
            // =====================================

            const deposit =
                await createDepositRequest({

                    userId,

                    amountUSD,

                    usdToTomanRate,

                    method:
                        method || "BANK"

                });


            return res.status(201).json({

                success:
                    true,

                message:
                    "Deposit request created successfully",

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
                    "Failed to create deposit request"

            });

        }

    }
);


// =====================================
// GET DEPOSIT:: M
// دریافت یک واریز
// GET /api/deposit/:userId/:depositId
// =====================================

router.get(
    "/:userId/:depositId",
    async (req, res) => {

        try {

            const {

                userId,

                depositId

            } = req.params;


            const deposit =
                await getDeposit({

                    userId,

                    depositId

                });


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


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "Failed to get deposit"

            });

        }

    }
);


// =====================================
// GET USER DEPOSITS:: M
// تاریخچه واریزها
// GET /api/deposit/history/:userId
// =====================================

router.get(
    "/history/:userId",
    async (req, res) => {

        try {

            const {
                userId
            } = req.params;


            const {
                limit
            } = req.query;


            const deposits =
                await getUserDeposits({

                    userId,

                    limit

                });


            return res.status(200).json({

                success:
                    true,

                deposits

            });

        }

        catch (error) {

            console.error(
                "Get Deposit History Error:",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "Failed to get deposit history"

            });

        }

    }
);


// =====================================
// EXPORT ROUTER:: M
// خروجی مسیرهای واریز
// =====================================

export default router;
