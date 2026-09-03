// =====================================
// ..M
// AutoTrade AI
// Wallet Routes
// File: backend/routes/Wallet.js
// =====================================

import express from "express";
import mongoose from "mongoose";

import User from "../models/User.js";
import Wallet from "../models/Wallet.js";

import {
    requiredTelegramUser
} from "../middleware/auth.js";

import {
    getWalletDisplayValues
} from "../services/currencyService.js";

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
        const error = new Error(
            "Telegram user not authenticated"
        );

        error.statusCode = 401;

        throw error;
    }

    const user = await User.findOne({
        telegramId: String(telegramId)
    });

    if (!user) {
        const error = new Error(
            "User not found"
        );

        error.statusCode = 404;

        throw error;
    }

    return user;
}


// =====================================
// ..M
// GET /api/wallet/me
// دریافت کیف پول کاربر فعلی
// =====================================

router.get(
    "/me",
    requiredTelegramUser,
    async (req, res) => {

        try {

            const user =
                await getAuthenticatedUser(req);

            let wallet =
                await Wallet.findOne({
                    userId: user._id
                });

            // ---------------------------------
            // ..M
            // ساخت کیف پول در صورت نبودن
            // ---------------------------------

            if (!wallet) {

                wallet =
                    await Wallet.create({
                        userId: user._id,
                        balance: 0,
                        totalProfit: 0,
                        totalTrades: 0,
                        withdrawable: 0,
                        currency: "USDT",
                        status: "ACTIVE"
                    });
            }


            // ---------------------------------
            // ..M
            // بررسی وضعیت
            // ---------------------------------

            if (wallet.status !== "ACTIVE") {

                return res.status(403).json({
                    success: false,
                    message: "Wallet is not active"
                });
            }


            // ---------------------------------
            // ..M
            // مقادیر نمایشی
            // ---------------------------------

            const display =
                await getWalletDisplayValues(wallet);


            return res.json({

                success: true,

                wallet: {

                    id: wallet._id,

                    userId: wallet.userId,

                    balance:
                        Number(wallet.balance || 0),

                    balanceUSD:
                        Number(display.balanceUSD || 0),

                    balanceToman:
                        Number(display.balanceToman || 0),

                    balanceUSDText:
                        display.balanceUSDText,

                    balanceTomanText:
                        display.balanceTomanText,

                    totalProfit:
                        Number(
                            wallet.totalProfit || 0
                        ),

                    totalTrades:
                        Number(
                            wallet.totalTrades || 0
                        ),

                    withdrawable:
                        Number(
                            wallet.withdrawable || 0
                        ),

                    withdrawableUSD:
                        Number(
                            display.withdrawableUSD || 0
                        ),

                    withdrawableToman:
                        Number(
                            display.withdrawableToman || 0
                        ),

                    withdrawableUSDText:
                        display.withdrawableUSDText,

                    withdrawableTomanText:
                        display.withdrawableTomanText,

                    currency:
                        wallet.currency,

                    status:
                        wallet.status,

                    exchangeRate:
                        Number(
                            display.exchangeRate || 0
                        ),

                    createdAt:
                        wallet.createdAt,

                    updatedAt:
                        wallet.updatedAt
                }
            });

        } catch (error) {

            console.error(
                "GET /api/wallet/me error:",
                error
            );

            return res.status(
                error.statusCode || 500
            ).json({

                success: false,

                message:
                    error.message ||
                    "Failed to get wallet"
            });
        }
    }
);


// =====================================
// ..M
// GET /api/wallet/:userId
// مسیر قدیمی — فقط برای سازگاری
// =====================================

router.get(
    "/:userId",
    requiredTelegramUser,
    async (req, res) => {

        try {

            const user =
                await getAuthenticatedUser(req);

            const requestedUserId =
                req.params.userId;


            // ---------------------------------
            // ..M
            // بررسی ObjectId
            // ---------------------------------

            if (
                !mongoose.Types.ObjectId.isValid(
                    requestedUserId
                )
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID"
                });
            }


            // ---------------------------------
            // ..M
            // جلوگیری از دسترسی به کیف پول دیگران
            // ---------------------------------

            if (
                String(user._id) !==
                String(requestedUserId)
            ) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You cannot access another user's wallet"
                });
            }


            let wallet =
                await Wallet.findOne({
                    userId: user._id
                });


            // ---------------------------------
            // ..M
            // ساخت کیف پول
            // ---------------------------------

            if (!wallet) {

                wallet =
                    await Wallet.create({
                        userId: user._id,
                        balance: 0,
                        totalProfit: 0,
                        totalTrades: 0,
                        withdrawable: 0,
                        currency: "USDT",
                        status: "ACTIVE"
                    });
            }


            if (wallet.status !== "ACTIVE") {

                return res.status(403).json({
                    success: false,
                    message: "Wallet is not active"
                });
            }


            const display =
                await getWalletDisplayValues(wallet);


            return res.json({

                success: true,

                wallet: {

                    id: wallet._id,

                    userId: wallet.userId,

                    balance:
                        Number(wallet.balance || 0),

                    balanceUSD:
                        Number(display.balanceUSD || 0),

                    balanceToman:
                        Number(display.balanceToman || 0),

                    balanceUSDText:
                        display.balanceUSDText,

                    balanceTomanText:
                        display.balanceTomanText,

                    totalProfit:
                        Number(
                            wallet.totalProfit || 0
                        ),

                    totalTrades:
                        Number(
                            wallet.totalTrades || 0
                        ),

                    withdrawable:
                        Number(
                            wallet.withdrawable || 0
                        ),

                    withdrawableUSD:
                        Number(
                            display.withdrawableUSD || 0
                        ),

                    withdrawableToman:
                        Number(
                            display.withdrawableToman || 0
                        ),

                    withdrawableUSDText:
                        display.withdrawableUSDText,

                    withdrawableTomanText:
                        display.withdrawableTomanText,

                    currency:
                        wallet.currency,

                    status:
                        wallet.status,

                    exchangeRate:
                        Number(
                            display.exchangeRate || 0
                        )
                }
            });

        } catch (error) {

            console.error(
                "GET /api/wallet/:userId error:",
                error
            );

            return res.status(
                error.statusCode || 500
            ).json({

                success: false,

                message:
                    error.message ||
                    "Failed to get wallet"
            });
        }
    }
);


// =====================================
// ..M
// Export
// =====================================

export default router;