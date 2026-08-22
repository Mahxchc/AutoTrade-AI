// =====================================
// Wallet Routes:: M
// AutoTrade AI
// مسیرهای کیف پول
// File: backend/routes/Wallet.js
// =====================================

import express from "express";
import mongoose from "mongoose";

import Wallet from "../models/Wallet.js";

import {
    getWalletDisplayValues
} from "../services/currencyService.js";


const router =
    express.Router();


// =====================================
// GET USER WALLET:: M
// دریافت اطلاعات کیف پول
// GET /api/wallet/:userId
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
                        "Invalid user ID"

                });

            }


            // =====================================
            // پیدا کردن کیف پول:: M
            // =====================================

            let wallet =
                await Wallet.findOne({

                    userId

                });


            // =====================================
            // ساخت کیف پول در صورت نبودن:: M
            // =====================================

            if (!wallet) {

                wallet =
                    await Wallet.create({

                        userId,

                        balance:
                            0,

                        totalProfit:
                            0,

                        totalTrades:
                            0,

                        withdrawable:
                            0,

                        currency:
                            "USDT",

                        status:
                            "ACTIVE"

                    });

            }


            // =====================================
            // موجودی دلار:: M
            // =====================================

            const balanceUSD =
                Number(
                    wallet.balance
                );


            const totalProfitUSD =
                Number(
                    wallet.totalProfit
                );


            const withdrawableUSD =
                Number(
                    wallet.withdrawable
                );


            // =====================================
            // تبدیل به تومان:: M
            // =====================================

            const balanceDisplay =
                await getWalletDisplayValues(
                    balanceUSD
                );


            const profitDisplay =
                await getWalletDisplayValues(
                    totalProfitUSD
                );


            const withdrawableDisplay =
                await getWalletDisplayValues(
                    withdrawableUSD
                );


            // =====================================
            // پاسخ به Mini App:: M
            // =====================================

            return res.status(200).json({

                success:
                    true,

                wallet: {

                    id:
                        wallet._id,

                    currency:
                        wallet.currency,

                    status:
                        wallet.status,


                    // =====================================
                    // موجودی
                    // =====================================

                    balanceUSD,

                    balanceToman:
                        balanceDisplay.balanceToman,

                    balanceUSDText:
                        balanceDisplay.balanceUSDText,

                    balanceTomanText:
                        balanceDisplay.balanceTomanText,


                    // =====================================
                    // سود کل
                    // =====================================

                    totalProfitUSD,

                    totalProfitToman:
                        profitDisplay.balanceToman,

                    totalProfitUSDText:
                        profitDisplay.balanceUSDText,

                    totalProfitTomanText:
                        profitDisplay.balanceTomanText,


                    // =====================================
                    // قابل برداشت
                    // =====================================

                    withdrawableUSD,

                    withdrawableToman:
                        withdrawableDisplay.balanceToman,

                    withdrawableUSDText:
                        withdrawableDisplay.balanceUSDText,

                    withdrawableTomanText:
                        withdrawableDisplay.balanceTomanText,


                    // =====================================
                    // معاملات
                    // =====================================

                    totalTrades:
                        wallet.totalTrades,


                    // =====================================
                    // نرخ دلار
                    // =====================================

                    exchangeRate:
                        balanceDisplay.exchangeRate,

                    exchangeRateText:
                        balanceDisplay.exchangeRateText,


                    // =====================================
                    // زمان بروزرسانی
                    // =====================================

                    updatedAt:
                        balanceDisplay.updatedAt

                }

            });


        }

        catch (error) {

            console.error(
                "Get Wallet Error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Failed to get wallet"

            });

        }

    }
);


// =====================================
// EXPORT ROUTER:: M
// خروجی مسیرهای کیف پول
// =====================================

export default router;
