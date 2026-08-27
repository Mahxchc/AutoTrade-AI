// =====================================
// Wallet Service:: M
// AutoTrade AI
// Wallet Management Layer
// File: backend/services/walletService.js
// =====================================

import Wallet from "../models/Wallet.js";
import User from "../models/User.js";


// =====================================
// Normalize Amount
// =====================================

function normalizeAmount(
    amount,
    fieldName = "Amount"
) {

    const numericAmount =
        Number(amount);


    if (
        !Number.isFinite(
            numericAmount
        )
    ) {

        throw new Error(
            `${fieldName} is invalid`
        );

    }


    if (
        numericAmount <= 0
    ) {

        throw new Error(
            `${fieldName} must be greater than zero`
        );

    }


    return numericAmount;

}


// =====================================
// Get Or Create Wallet
// =====================================

export async function getWallet(
    userId
) {

    if (!userId) {

        throw new Error(
            "User ID is required"
        );

    }


    // =====================================
    // Check User
    // =====================================

    const user =
        await User.findById(
            userId
        );


    if (!user) {

        throw new Error(
            "User not found"
        );

    }


    // =====================================
    // Find Wallet
    // =====================================

    let wallet =
        await Wallet.findOne({
            userId
        });


    // =====================================
    // Create Wallet
    // =====================================

    if (!wallet) {

        try {

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

        catch (error) {

            // ---------------------------------
            // Another request may have created
            // the wallet at the same time.
            // ---------------------------------

            if (
                error?.code === 11000
            ) {

                wallet =
                    await Wallet.findOne({
                        userId
                    });

            }

            else {

                throw error;

            }

        }


        // =====================================
        // Connect Wallet To User
        // =====================================

        if (
            wallet &&
            (
                !user.walletId ||
                String(user.walletId) !==
                String(wallet._id)
            )
        ) {

            user.walletId =
                wallet._id;

            await user.save();

        }

    }


    return wallet;

}


// =====================================
// Credit Balance
// شارژ موجودی کیف پول
// =====================================

export async function creditBalance({

    userId,

    amount

}) {

    const numericAmount =
        normalizeAmount(
            amount,
            "Credit amount"
        );


    // =====================================
    // Ensure Wallet Exists
    // =====================================

    await getWallet(
        userId
    );


    // =====================================
    // Atomic Credit
    // =====================================

    const wallet =
        await Wallet.findOneAndUpdate(

            {
                userId,

                status:
                    "ACTIVE"

            },

            {

                $inc: {

                    balance:
                        numericAmount,

                    withdrawable:
                        numericAmount

                }

            },

            {
                new:
                    true,

                runValidators:
                    true

            }

        );


    if (!wallet) {

        throw new Error(
            "Wallet is not active"
        );

    }


    return wallet;

}


// =====================================
// Add Profit
// ثبت سود واقعی معامله
// =====================================

export async function addProfit({

    userId,

    amount

}) {

    const numericAmount =
        normalizeAmount(
            amount,
            "Profit amount"
        );


    // =====================================
    // Ensure Wallet Exists
    // =====================================

    await getWallet(
        userId
    );


    // =====================================
    // Atomic Profit Update
    // =====================================

    const wallet =
        await Wallet.findOneAndUpdate(

            {
                userId,

                status:
                    "ACTIVE"

            },

            {

                $inc: {

                    balance:
                        numericAmount,

                    totalProfit:
                        numericAmount,

                    withdrawable:
                        numericAmount

                }

            },

            {
                new:
                    true,

                runValidators:
                    true

            }

        );


    if (!wallet) {

        throw new Error(
            "Wallet is not active"
        );

    }


    return wallet;

}


// =====================================
// Register Loss
// ثبت ضرر واقعی معامله
// =====================================

export async function registerLoss({

    userId,

    amount

}) {

    const numericAmount =
        normalizeAmount(
            amount,
            "Loss amount"
        );


    // =====================================
    // Ensure Wallet Exists
    // =====================================

    await getWallet(
        userId
    );


    // =====================================
    // Atomic Loss Update
    // =====================================

    const wallet =
        await Wallet.findOneAndUpdate(

            {
                userId,

                status:
                    "ACTIVE",

                balance: {
                    $gte:
                        numericAmount
                }

            },

            {

                $inc: {

                    balance:
                        -numericAmount,

                    totalProfit:
                        -numericAmount,

                    withdrawable:
                        -numericAmount

                }

            },

            {
                new:
                    true,

                runValidators:
                    true

            }

        );


    if (!wallet) {

        throw new Error(
            "Insufficient wallet balance or wallet is not active"
        );

    }


    return wallet;

}


// =====================================
// Apply Trade Result
// اعمال نتیجه معامله
//
// Profit > 0  => سود
// Profit < 0  => ضرر
// Profit = 0  => بدون تغییر موجودی
// =====================================

export async function applyTradeResult({

    userId,

    profit

}) {

    const numericProfit =
        Number(profit);


    if (
        !Number.isFinite(
            numericProfit
        )
    ) {

        throw new Error(
            "Trade profit is invalid"
        );

    }


    // =====================================
    // Zero Result
    // =====================================

    if (
        numericProfit === 0
    ) {

        return await getWallet(
            userId
        );

    }


    // =====================================
    // Profit
    // =====================================

    if (
        numericProfit > 0
    ) {

        return await addProfit({

            userId,

            amount:
                numericProfit

        });

    }


    // =====================================
    // Loss
    // =====================================

    return await registerLoss({

        userId,

        amount:
            Math.abs(
                numericProfit
            )

    });

}


// =====================================
// Register Trade
// افزایش تعداد معاملات
// =====================================

export async function registerTrade(
    userId
) {

    if (!userId) {

        throw new Error(
            "User ID is required"
        );

    }


    // =====================================
    // Ensure Wallet Exists
    // =====================================

    await getWallet(
        userId
    );


    // =====================================
    // Atomic Trade Counter
    // =====================================

    const wallet =
        await Wallet.findOneAndUpdate(

            {
                userId,

                status:
                    "ACTIVE"

            },

            {

                $inc: {

                    totalTrades:
                        1

                }

            },

            {
                new:
                    true,

                runValidators:
                    true

            }

        );


    if (!wallet) {

        throw new Error(
            "Wallet is not active"
        );

    }


    return wallet;

}


// =====================================
// Withdraw
// برداشت از موجودی قابل برداشت
// =====================================

export async function withdraw({

    userId,

    amount

}) {

    const numericAmount =
        normalizeAmount(
            amount,
            "Withdrawal amount"
        );


    // =====================================
    // Ensure Wallet Exists
    // =====================================

    await getWallet(
        userId
    );


    // =====================================
    // Atomic Withdrawal
    // =====================================

    const wallet =
        await Wallet.findOneAndUpdate(

            {
                userId,

                status:
                    "ACTIVE",

                balance: {
                    $gte:
                        numericAmount
                },

                withdrawable: {
                    $gte:
                        numericAmount
                }

            },

            {

                $inc: {

                    balance:
                        -numericAmount,

                    withdrawable:
                        -numericAmount

                }

            },

            {
                new:
                    true,

                runValidators:
                    true

            }

        );


    if (!wallet) {

        throw new Error(
            "Insufficient withdrawable balance or wallet is not active"
        );

    }


    return wallet;

}


// =====================================
// Lock Wallet
// =====================================

export async function lockWallet(
    userId
) {

    const wallet =
        await getWallet(
            userId
        );


    wallet.status =
        "LOCKED";


    await wallet.save();


    return wallet;

}


// =====================================
// Unlock Wallet
// =====================================

export async function unlockWallet(
    userId
) {

    const wallet =
        await getWallet(
            userId
        );


    wallet.status =
        "ACTIVE";


    await wallet.save();


    return wallet;

}


// =====================================
// Get Wallet Summary
// خلاصه موجودی برای Mini App
// =====================================

export async function getWalletSummary(
    userId
) {

    const wallet =
        await getWallet(
            userId
        );


    return {

        id:
            wallet._id,

        userId:
            wallet.userId,

        balance:
            wallet.balance,

        withdrawable:
            wallet.withdrawable,

        totalProfit:
            wallet.totalProfit,

        totalTrades:
            wallet.totalTrades,

        currency:
            wallet.currency,

        status:
            wallet.status,

        updatedAt:
            wallet.updatedAt

    };

}