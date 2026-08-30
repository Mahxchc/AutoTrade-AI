// =====================================
// ..M Wallet Routes
// AutoTrade AI
// مسیرهای امن کیف پول
// File: backend/routes/wallet.js
// =====================================

import express from "express";

import Wallet from "../models/Wallet.js";
import User from "../models/User.js";

import {
    requireTelegramUser
} from "../middleware/auth.js";

import {
    getWalletDisplayValues
} from "../services/currencyService.js";


const router =
    express.Router();


// =====================================
// ..M GET CURRENT USER
// دریافت کاربر احراز‌شده
// =====================================

async function getCurrentUser(
    req
) {

    if (
        !req.telegramUser ||
        !req.telegramUser.id
    ) {

        return null;

    }


    return await User.findOne({

        telegramId:
            String(
                req.telegramUser.id
            )

    });

}


// =====================================
// ..M CHECK USER ACCESS
// =====================================

function isBlocked(
    user
) {

    return (
        user &&
        String(
            user.status
        ).toUpperCase() ===
        "BLOCKED"
    );

}


// =====================================
// ..M GET USER WALLET
// GET /api/wallet/:userId
// =====================================

router.get(
    "/:userId",
    requireTelegramUser,
    async (
        req,
        res
    ) => {

        try {

            // =====================================
            // ..M CURRENT TELEGRAM USER
            // =====================================

            const user =
                await getCurrentUser(
                    req
                );


            if (!user) {

                return res.status(404).json({

                    success:
                        false,

                    authenticated:
                        true,

                    message:
                        "User not found"

                });

            }


            // =====================================
            // ..M BLOCKED USER
            // =====================================

            if (
                isBlocked(
                    user
                )
            ) {

                return res.status(403).json({

                    success:
                        false,

                    authenticated:
                        true,

                    message:
                        "User account is blocked"

                });

            }


            // =====================================
            // ..M IDENTITY SECURITY
            // کاربر فقط کیف پول خودش
            // =====================================

            const requestedId =
                String(
                    req.params.userId
                );


            const ownMongoId =
                String(
                    user._id
                );


            const ownTelegramId =
                String(
                    user.telegramId
                );


            if (
                requestedId !==
                    ownMongoId &&

                requestedId !==
                    ownTelegramId
            ) {

                return res.status(403).json({

                    success:
                        false,

                    authenticated:
                        true,

                    message:
                        "You can only access your own wallet"

                });

            }


            // =====================================
            // ..M FIND WALLET
            // =====================================

            let wallet =
                await Wallet.findOne({

                    userId:
                        user._id

                });


            // =====================================
            // ..M CREATE WALLET
            // =====================================

            if (!wallet) {

                wallet =
                    await Wallet.create({

                        userId:
                            user._id,

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


                // =================================
                // ..M SYNC USER WALLET
                // =================================

                user.walletId =
                    wallet._id;


                await user.save();

            }

            else if (
                !user.walletId ||
                String(
                    user.walletId
                ) !==
                String(
                    wallet._id
                )
            ) {

                user.walletId =
                    wallet._id;


                await user.save();

            }


            // =====================================
            // ..M SAFE NUMBERS
            // =====================================

            const balanceUSD =
                Number(
                    wallet.balance
                ) || 0;


            const totalProfitUSD =
                Number(
                    wallet.totalProfit
                ) || 0;


            const withdrawableUSD =
                Number(
                    wallet.withdrawable
                ) || 0;


            const totalTrades =
                Number(
                    wallet.totalTrades
                ) || 0;


            // =====================================
            // ..M CURRENCY DISPLAY
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
            // ..M RESPONSE
            // =====================================

            return res.status(200).json({

                success:
                    true,

                authenticated:
                    true,

                wallet: {

                    id:
                        wallet._id,

                    userId:
                        wallet.userId,

                    currency:
                        wallet.currency,

                    status:
                        wallet.status,


                    // =================================
                    // ..M BALANCE
                    // =================================

                    balance:
                        balanceUSD,

                    balanceUSD,

                    balanceToman:
                        balanceDisplay.balanceToman,

                    balanceUSDText:
                        balanceDisplay.balanceUSDText,

                    balanceTomanText:
                        balanceDisplay.balanceTomanText,


                    // =================================
                    // ..M TOTAL PROFIT
                    // =================================

                    totalProfit:
                        totalProfitUSD,

                    totalProfitUSD,

                    totalProfitToman:
                        profitDisplay.balanceToman,

                    totalProfitUSDText:
                        profitDisplay.balanceUSDText,

                    totalProfitTomanText:
                        profitDisplay.balanceTomanText,


                    // =================================
                    // ..M WITHDRAWABLE
                    // =================================

                    withdrawable:
                        withdrawableUSD,

                    withdrawableUSD,

                    withdrawableToman:
                        withdrawableDisplay.balanceToman,

                    withdrawableUSDText:
                        withdrawableDisplay.balanceUSDText,

                    withdrawableTomanText:
                        withdrawableDisplay.balanceTomanText,


                    // =================================
                    // ..M TRADES
                    // =================================

                    totalTrades,


                    // =================================
                    // ..M EXCHANGE RATE
                    // =================================

                    exchangeRate:
                        balanceDisplay.exchangeRate,

                    exchangeRateText:
                        balanceDisplay.exchangeRateText,


                    // =================================
                    // ..M UPDATED
                    // =================================

                    updatedAt:
                        balanceDisplay.updatedAt

                }

            });

        }

        catch (error) {

            console.error(
                "[GET WALLET ERROR]",
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
// ..M EXPORT
// =====================================

export default router;