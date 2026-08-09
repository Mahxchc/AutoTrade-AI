// =====================================
// Wallet Service:: M
// AutoTrade AI
// Wallet Management Layer
// File: backend/services/walletService.js
// =====================================

import Wallet from "../models/Wallet.js";
import User from "../models/User.js";


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

        wallet =
            await Wallet.create({

                userId,

                balance: 0,

                totalProfit: 0,

                totalTrades: 0,

                withdrawable: 0,

                currency: "USDT",

                status: "ACTIVE"

            });


        // =====================================
        // Connect Wallet To User
        // =====================================

        user.walletId =
            wallet._id;

        await user.save();

    }


    return wallet;
}


// =====================================
// Add Profit
// =====================================

export async function addProfit({

    userId,

    amount

}) {

    const numericAmount =
        Number(amount);


    if (
        !Number.isFinite(
            numericAmount
        ) ||
        numericAmount <= 0
    ) {

        throw new Error(
            "Profit amount must be greater than zero"
        );

    }


    const wallet =
        await getWallet(
            userId
        );


    if (
        wallet.status !==
        "ACTIVE"
    ) {

        throw new Error(
            "Wallet is not active"
        );

    }


    wallet.balance +=
        numericAmount;

    wallet.totalProfit +=
        numericAmount;

    wallet.withdrawable +=
        numericAmount;


    await wallet.save();


    return wallet;
}


// =====================================
// Register Trade
// =====================================

export async function registerTrade(
    userId
) {

    const wallet =
        await getWallet(
            userId
        );


    if (
        wallet.status !==
        "ACTIVE"
    ) {

        throw new Error(
            "Wallet is not active"
        );

    }


    wallet.totalTrades +=
        1;


    await wallet.save();


    return wallet;
}


// =====================================
// Withdraw
// =====================================

export async function withdraw({

    userId,

    amount

}) {

    const numericAmount =
        Number(amount);


    if (
        !Number.isFinite(
            numericAmount
        ) ||
        numericAmount <= 0
    ) {

        throw new Error(
            "Withdrawal amount must be greater than zero"
        );

    }


    const wallet =
        await getWallet(
            userId
        );


    if (
        wallet.status !==
        "ACTIVE"
    ) {

        throw new Error(
            "Wallet is not active"
        );

    }


    if (
        numericAmount >
        wallet.withdrawable
    ) {

        throw new Error(
            "Insufficient withdrawable balance"
        );

    }


    wallet.balance -=
        numericAmount;

    wallet.withdrawable -=
        numericAmount;


    await wallet.save();


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
