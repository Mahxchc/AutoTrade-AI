// =====================================
// ..M
// AutoTrade AI
// Withdraw Routes
// File: backend/routes/withdraw.js
// =====================================

import express from "express";
import mongoose from "mongoose";

import User from "../models/User.js";
import Withdraw from "../models/Withdraw.js";

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
// ..M
// پیدا کردن کاربر احراز هویت‌شده
// =====================================

async function getAuthenticatedUser(req) {
    const telegramId =
        req.telegramId ||
        req.telegramUser?.id ||
        req.user?.telegramId;

    if (!telegramId) {
        const error = new Error("Telegram user not authenticated");
        error.statusCode = 401;
        throw error;
    }

    const user = await User.findOne({
        telegramId: String(telegramId)
    });

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return user;
}


// =====================================
// ..M
// POST /api/withdraw
// ایجاد درخواست برداشت
// =====================================

router.post("/", requiredTelegramUser, async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);

        const {
            amountToman,
            withdrawAll,
            method,
            bankAccount,
            accountHolderName
        } = req.body || {};

        const result = await createWithdrawRequest({
            userId: user._id,
            amountToman,
            withdrawAll: Boolean(withdrawAll),
            method,
            bankAccount,
            accountHolderName
        });

        return res.status(201).json({
            success: true,
            message: "Withdrawal request created successfully",
            withdraw: result
        });

    } catch (error) {
        console.error("POST /api/withdraw error:", error);

        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to create withdrawal request"
        });
    }
});


// =====================================
// ..M
// GET /api/withdraw/my
// دریافت برداشت‌های کاربر فعلی
// =====================================

router.get("/my", requiredTelegramUser, async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req);

        const withdraws = await getUserWithdraws({
            userId: user._id
        });

        return res.json({
            success: true,
            withdraws
        });

    } catch (error) {
        console.error("GET /api/withdraw/my error:", error);

        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message || "Failed to get withdrawals"
        });
    }
});


// =====================================
// ..M
// GET /api/withdraw/admin/all
// مخصوص ادمین
// =====================================

router.get(
    "/admin/all",
    requiredTelegramUser,
    requiredAdmin,
    async (req, res) => {
        try {
            const withdraws = await Withdraw.find({})
                .populate(
                    "userId",
                    "telegramId username firstName lastName"
                )
                .sort({
                    createdAt: -1
                })
                .limit(500)
                .lean();

            return res.json({
                success: true,
                count: withdraws.length,
                withdraws
            });

        } catch (error) {
            console.error(
                "GET /api/withdraw/admin/all error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to get admin withdrawals"
            });
        }
    }
);


// =====================================
// ..M
// POST /api/withdraw/admin/:withdrawId/complete
// تکمیل برداشت توسط ادمین
// =====================================

router.post(
    "/admin/:withdrawId/complete",
    requiredTelegramUser,
    requiredAdmin,
    async (req, res) => {
        try {
            const { withdrawId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(withdrawId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid withdraw ID"
                });
            }

            const {
                transactionId,
                description
            } = req.body || {};

            const result = await completeWithdraw({
                withdrawId,
                transactionId,
                description
            });

            return res.json({
                success: true,
                message: "Withdrawal completed successfully",
                withdraw: result
            });

        } catch (error) {
            console.error(
                "POST /api/withdraw/admin/:withdrawId/complete error:",
                error
            );

            return res.status(error.statusCode || 400).json({
                success: false,
                message:
                    error.message ||
                    "Failed to complete withdrawal"
            });
        }
    }
);


// =====================================
// ..M
// POST /api/withdraw/admin/:withdrawId/fail
// شکست برداشت توسط ادمین
// =====================================

router.post(
    "/admin/:withdrawId/fail",
    requiredTelegramUser,
    requiredAdmin,
    async (req, res) => {
        try {
            const { withdrawId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(withdrawId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid withdraw ID"
                });
            }

            const {
                description
            } = req.body || {};

            const result = await failWithdraw({
                withdrawId,
                description
            });

            return res.json({
                success: true,
                message: "Withdrawal marked as failed",
                withdraw: result
            });

        } catch (error) {
            console.error(
                "POST /api/withdraw/admin/:withdrawId/fail error:",
                error
            );

            return res.status(error.statusCode || 400).json({
                success: false,
                message:
                    error.message ||
                    "Failed to mark withdrawal as failed"
            });
        }
    }
);


// =====================================
// ..M
// POST /api/withdraw/admin/:withdrawId/cancel
// لغو برداشت توسط ادمین
// =====================================

router.post(
    "/admin/:withdrawId/cancel",
    requiredTelegramUser,
    requiredAdmin,
    async (req, res) => {
        try {
            const { withdrawId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(withdrawId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid withdraw ID"
                });
            }

            const {
                description
            } = req.body || {};

            const result = await cancelWithdraw({
                withdrawId,
                description
            });

            return res.json({
                success: true,
                message: "Withdrawal cancelled successfully",
                withdraw: result
            });

        } catch (error) {
            console.error(
                "POST /api/withdraw/admin/:withdrawId/cancel error:",
                error
            );

            return res.status(error.statusCode || 400).json({
                success: false,
                message:
                    error.message ||
                    "Failed to cancel withdrawal"
            });
        }
    }
);


// =====================================
// ..M
// GET /api/withdraw/:withdrawId
// دریافت جزئیات یک برداشت
// =====================================

router.get(
    "/:withdrawId",
    requiredTelegramUser,
    async (req, res) => {
        try {
            const user = await getAuthenticatedUser(req);

            const { withdrawId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(withdrawId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid withdraw ID"
                });
            }

            const withdraw = await getWithdrawById({
                withdrawId,
                userId: user._id
            });

            return res.json({
                success: true,
                withdraw
            });

        } catch (error) {
            console.error(
                "GET /api/withdraw/:withdrawId error:",
                error
            );

            return res.status(error.statusCode || 400).json({
                success: false,
                message:
                    error.message ||
                    "Failed to get withdrawal"
            });
        }
    }
);


// =====================================
// ..M
// Export
// =====================================

export default router;