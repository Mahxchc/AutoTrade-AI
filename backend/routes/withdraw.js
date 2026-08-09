// =====================================
// Withdraw Routes:: M
// AutoTrade AI
// مسیرهای برداشت
// File: backend/routes/withdraw.js
// =====================================

import express from "express";

import {
    createWithdrawRequest,
    getWithdrawStatus,
    cancelWithdrawRequest
} from "../services/withdrawService.js";


const router = express.Router();


// =====================================
// CREATE WITHDRAW:: M
// ایجاد درخواست برداشت
// POST /api/withdraw
// =====================================

router.post("/", async (req, res) => {

    try {

        const {

            userId,

            amountUSD,

            method,

            bankAccount,

            accountHolderName

        } = req.body;


        // =====================================
        // بررسی اطلاعات اصلی:: M
        // =====================================

        if (
            !userId ||
            amountUSD == null
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "User ID and withdrawal amount are required"

            });

        }


        // =====================================
        // ایجاد درخواست برداشت:: M
        // =====================================

        const result =
            await createWithdrawRequest({

                userId,

                amountUSD,

                method:
                    method || "BANK",

                bankAccount:
                    bankAccount || "",

                accountHolderName:
                    accountHolderName || ""

            });


        return res.status(201).json({

            success: true,

            message:
                "Withdrawal request created successfully",

            withdrawal:
                result

        });


    } catch (error) {

        console.error(
            "Create Withdraw Error:",
            error
        );


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Failed to create withdrawal request"

        });

    }

});


// =====================================
// GET WITHDRAW STATUS:: M
// دریافت وضعیت برداشت
// GET /api/withdraw/:userId/:requestId
// =====================================

router.get(
    "/:userId/:requestId",
    async (req, res) => {

        try {

            const {

                userId,

                requestId

            } = req.params;


            // =====================================
            // دریافت وضعیت:: M
            // =====================================

            const result =
                await getWithdrawStatus({

                    userId,

                    requestId

                });


            return res.status(200).json({

                success: true,

                withdrawal:
                    result

            });


        } catch (error) {

            console.error(
                "Get Withdraw Status Error:",
                error
            );


            return res.status(400).json({

                success: false,

                message:
                    error.message ||
                    "Failed to get withdrawal status"

            });

        }

    }
);


// =====================================
// CANCEL WITHDRAW:: M
// لغو درخواست برداشت
// POST /api/withdraw/cancel/:userId/:requestId
// =====================================

router.post(
    "/cancel/:userId/:requestId",
    async (req, res) => {

        try {

            const {

                userId,

                requestId

            } = req.params;


            // =====================================
            // لغو درخواست:: M
            // =====================================

            const result =
                await cancelWithdrawRequest({

                    userId,

                    requestId

                });


            return res.status(200).json({

                success: true,

                message:
                    "Withdrawal request cancelled successfully",

                withdrawal:
                    result

            });


        } catch (error) {

            console.error(
                "Cancel Withdraw Error:",
                error
            );


            return res.status(400).json({

                success: false,

                message:
                    error.message ||
                    "Failed to cancel withdrawal request"

            });

        }

    }
);


// =====================================
// EXPORT ROUTER:: M
// خروجی مسیرهای برداشت
// =====================================

export default router;
