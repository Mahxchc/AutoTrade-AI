// =====================================
// AutoTrade AI
// Withdraw Routes :: M
// مسیرهای برداشت امن
// File: backend/routes/withdraw.js
// =====================================

import express from "express";
import mongoose from "mongoose";

import Withdraw from "../models/Withdraw.js";
import User from "../models/User.js";

import {
    createWithdrawRequest,
    getUserWithdraws,
    getWithdrawById,
    completeWithdraw,
    failWithdraw,
    cancelWithdraw
} from "../services/withdrawService.js";

import {
    requiredTelegramUser,
    requiredAdmin
} from "../middleware/auth.js";


const router = express.Router();


// =====================================
// Authenticated User :: M
// =====================================

async function getAuthenticatedUser(req) {

    const telegramId =
        req.telegramId ??
        req.telegramUser?.id ??
        req.user?.telegramId;


    if (!telegramId) {

        throw new Error(
            "کاربر تلگرام شناسایی نشد"
        );

    }


    const user =
        await User.findOne({

            telegramId:
                String(telegramId)

        });


    if (!user) {

        throw new Error(
            "کاربر پیدا نشد"
        );

    }


    return user;

}


// =====================================
// Create Withdraw :: M
// POST /api/withdraw
// =====================================

router.post(
    "/",
    requiredTelegramUser,
    async (req, res) => {

        try {

            const user =
                await getAuthenticatedUser(
                    req
                );


            const {

                amountToman,

                withdrawAll = false,

                method = "BANK",

                bankAccount = "",

                accountHolderName = "",

                iban = ""

            } = req.body || {};


            const withdraw =
                await createWithdrawRequest({

                    userId:
                        user._id,

                    amountToman,

                    withdrawAll,

                    method,

                    bankAccount:
                        bankAccount ||
                        iban,

                    accountHolderName

                });


            return res.json({

                success:
                    true,

                message:
                    "درخواست برداشت با موفقیت ثبت شد",

                withdraw

            });

        }

        catch (error) {

            console.error(
                "[WITHDRAW CREATE]",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "ثبت درخواست برداشت ناموفق بود"

            });

        }

    }
);


// =====================================
// My Withdraws :: M
// GET /api/withdraw/my
// =====================================

router.get(
    "/my",
    requiredTelegramUser,
    async (req, res) => {

        try {

            const user =
                await getAuthenticatedUser(
                    req
                );


            const withdraws =
                await getUserWithdraws(
                    user._id
                );


            return res.json({

                success:
                    true,

                withdraws

            });

        }

        catch (error) {

            console.error(
                "[WITHDRAW MY]",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "دریافت برداشت‌ها ناموفق بود"

            });

        }

    }
);


// =====================================
// Admin All Withdraws :: M
// IMPORTANT:
// قبل از /:withdrawId قرار گرفته
// =====================================

router.get(
    "/admin/all",
    requiredTelegramUser,
    requiredAdmin,
    async (req, res) => {

        try {

            const withdraws =
                await Withdraw.find({})
                    .sort({
                        createdAt:
                            -1
                    })
                    .limit(500)
                    .populate(
                        "userId",
                        "telegramId username firstName lastName"
                    );


            return res.json({

                success:
                    true,

                count:
                    withdraws.length,

                withdraws

            });

        }

        catch (error) {

            console.error(
                "[WITHDRAW ADMIN ALL]",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "دریافت لیست برداشت‌ها ناموفق بود"

            });

        }

    }
);


// =====================================
// Admin Complete Withdraw :: M
// POST /api/withdraw/admin/:id/complete
// =====================================

router.post(
    "/admin/:withdrawId/complete",
    requiredTelegramUser,
    requiredAdmin,
    async (req, res) => {

        try {

            const {
                transactionId = null
            } = req.body || {};


            const withdraw =
                await completeWithdraw({

                    withdrawId:
                        req.params.withdrawId,

                    transactionId

                });


            return res.json({

                success:
                    true,

                message:
                    "برداشت با موفقیت تکمیل شد",

                withdraw

            });

        }

        catch (error) {

            console.error(
                "[WITHDRAW COMPLETE]",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "تکمیل برداشت ناموفق بود"

            });

        }

    }
);


// =====================================
// Admin Fail Withdraw :: M
// POST /api/withdraw/admin/:id/fail
// =====================================

router.post(
    "/admin/:withdrawId/fail",
    requiredTelegramUser,
    requiredAdmin,
    async (req, res) => {

        try {

            const {
                description = ""
            } = req.body || {};


            const withdraw =
                await failWithdraw({

                    withdrawId:
                        req.params.withdrawId,

                    description

                });


            return res.json({

                success:
                    true,

                message:
                    "برداشت ناموفق شد",

                withdraw

            });

        }

        catch (error) {

            console.error(
                "[WITHDRAW FAIL]",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "تغییر وضعیت برداشت ناموفق بود"

            });

        }

    }
);


// =====================================
// Admin Cancel Withdraw :: M
// POST /api/withdraw/admin/:id/cancel
// =====================================

router.post(
    "/admin/:withdrawId/cancel",
    requiredTelegramUser,
    requiredAdmin,
    async (req, res) => {

        try {

            const {
                description = ""
            } = req.body || {};


            const withdraw =
                await cancelWithdraw({

                    withdrawId:
                        req.params.withdrawId,

                    description

                });


            return res.json({

                success:
                    true,

                message:
                    "برداشت لغو شد",

                withdraw

            });

        }

        catch (error) {

            console.error(
                "[WITHDRAW CANCEL]",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "لغو برداشت ناموفق بود"

            });

        }

    }
);


// =====================================
// Get Single Withdraw :: M
// GET /api/withdraw/:withdrawId
// =====================================

router.get(
    "/:withdrawId",
    requiredTelegramUser,
    async (req, res) => {

        try {

            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.withdrawId
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "شناسه برداشت نامعتبر است"

                });

            }


            const user =
                await getAuthenticatedUser(
                    req
                );


            const withdraw =
                await getWithdrawById({

                    withdrawId:
                        req.params.withdrawId,

                    userId:
                        user._id

                });


            return res.json({

                success:
                    true,

                withdraw

            });

        }

        catch (error) {

            console.error(
                "[WITHDRAW GET]",
                error
            );


            return res.status(404).json({

                success:
                    false,

                message:
                    error.message ||
                    "برداشت پیدا نشد"

            });

        }

    }
);


// =====================================
// Error Handler :: M
// =====================================

router.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "[WITHDRAW ROUTER ERROR]",
            error
        );


        if (
            res.headersSent
        ) {

            return next(
                error
            );

        }


        return res.status(500).json({

            success:
                false,

            message:
                "خطای داخلی سرور"

        });

    }
);


// =====================================
// Export :: M
// =====================================

export default router;