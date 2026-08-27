// =====================================
// Trading Engine :: M
// AutoTrade AI
// موتور اصلی مدیریت معاملات
// File: backend/engine/tradingEngine.js
// =====================================

import mongoose from "mongoose";

import Trade from "../models/Trade.js";
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";
import Bot from "../models/Bot.js";

import {
    checkTradePermission,
    calculatePositionSize
} from "./riskManager.js";


// =====================================
// Helpers
// =====================================

function toNumber(value, fallback = 0) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


// =====================================
// Open Trade
// باز کردن معامله
// =====================================

export async function openTrade({

    userId,

    symbol,

    market = "crypto",

    side,

    entryPrice,

    stopLossPrice,

    riskPercent = 1

}) {

    // =====================================
    // Validate User ID
    // =====================================

    if (
        !mongoose.Types.ObjectId.isValid(
            userId
        )
    ) {

        throw new Error(
            "Invalid user ID"
        );

    }


    // =====================================
    // Validate Symbol
    // =====================================

    if (
        typeof symbol !== "string" ||
        !symbol.trim()
    ) {

        throw new Error(
            "Symbol is required"
        );

    }


    // =====================================
    // Validate Side
    // =====================================

    if (
        side !== "BUY" &&
        side !== "SELL"
    ) {

        throw new Error(
            "Trade side must be BUY or SELL"
        );

    }


    // =====================================
    // Validate Prices
    // =====================================

    const numericEntryPrice =
        toNumber(entryPrice);


    const numericStopLossPrice =
        toNumber(stopLossPrice);


    if (
        numericEntryPrice <= 0
    ) {

        throw new Error(
            "Invalid entry price"
        );

    }


    if (
        numericStopLossPrice <= 0
    ) {

        throw new Error(
            "Invalid stop-loss price"
        );

    }


    // =====================================
    // Validate Stop Loss
    // =====================================

    if (
        side === "BUY" &&
        numericStopLossPrice >=
        numericEntryPrice
    ) {

        throw new Error(
            "For BUY, stop-loss must be below entry price"
        );

    }


    if (
        side === "SELL" &&
        numericStopLossPrice <=
        numericEntryPrice
    ) {

        throw new Error(
            "For SELL, stop-loss must be above entry price"
        );

    }


    // =====================================
    // Find User
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
    // Trading Permission
    // =====================================

    if (
        user.approvalStatus !== "APPROVED" ||
        user.accessEnabled !== true ||
        user.botAccess !== true ||
        user.status !== "ACTIVE"
    ) {

        throw new Error(
            "User is not approved for trading"
        );

    }


    // =====================================
    // Find Bot
    // =====================================

    const bot =
        await Bot.findOne({

            userId

        });


    if (!bot) {

        throw new Error(
            "Trading bot is not configured"
        );

    }


    // =====================================
    // Check Bot Status
    // =====================================

    if (
        bot.enabled !== true ||
        bot.status !== "ACTIVE"
    ) {

        throw new Error(
            "Trading bot is not active"
        );

    }


    // =====================================
    // Check Consecutive Losses
    // =====================================

    if (
        toNumber(bot.consecutiveLosses) >=
        toNumber(bot.maxConsecutiveLosses)
    ) {

        bot.status =
            "PAUSED";

        bot.enabled =
            false;

        bot.stopReason =
            "Maximum consecutive losses reached";

        bot.lastHeartbeat =
            new Date();

        await bot.save();

        throw new Error(
            "Bot paused after maximum consecutive losses"
        );

    }


    // =====================================
    // Find Wallet
    // =====================================

    const wallet =
        await Wallet.findOne({

            userId

        });


    if (!wallet) {

        throw new Error(
            "Wallet not found"
        );

    }


    // =====================================
    // Current Wallet Balance
    // =====================================
    //
    // IMPORTANT:
    //
    // Wallet balance is stored in USDT/USD.
    //
    // Deposit:
    // Toman -> USDT
    //
    // Profit:
    // added back to wallet.balance
    //
    // Therefore the next trade automatically
    // uses the new compounded balance.
    //
    // =====================================

    const balance =
        toNumber(
            wallet.balance
        );


    if (
        balance <= 0
    ) {

        throw new Error(
            "Insufficient wallet balance"
        );

    }


    // =====================================
    // Check Open Trades
    // =====================================

    const activeTrades =
        await Trade.countDocuments({

            userId,

            status:
                "OPEN"

        });


    const maxOpenTrades =
        Math.max(
            1,
            toNumber(
                bot.maxOpenTrades,
                1
            )
        );


    if (
        activeTrades >=
        maxOpenTrades
    ) {

        throw new Error(
            "Maximum open trades reached"
        );

    }


    // =====================================
    // Risk Permission
    // =====================================

    if (
        typeof checkTradePermission ===
        "function"
    ) {

        const permission =
            await checkTradePermission({

                userId,

                balance,

                symbol,

                side,

                riskPercent

            });


        if (
            permission === false
        ) {

            throw new Error(
                "Trade permission denied by risk manager"
            );

        }


        if (
            permission &&
            typeof permission === "object" &&
            permission.allowed === false
        ) {

            throw new Error(
                permission.reason ||
                "Trade permission denied by risk manager"
            );

        }

    }


    // =====================================
    // Calculate Position Size
    // =====================================
    //
    // This is where compounding happens.
    //
    // If balance increases:
    //
    // 100 USDT
    //   ↓
    // 120 USDT
    //   ↓
    // 150 USDT
    //
    // calculatePositionSize() receives the
    // NEW balance and therefore the next
    // position can become larger.
    //
    // =====================================

    const position =
        calculatePositionSize({

            balance,

            riskPercent,

            entryPrice:
                numericEntryPrice,

            stopLossPrice:
                numericStopLossPrice

        });


    if (
        !position ||
        !Number.isFinite(
            position.positionSize
        ) ||
        position.positionSize <= 0
    ) {

        throw new Error(
            "Invalid calculated position size"
        );

    }


    const quantity =
        Number(
            position.positionSize
        );


    // =====================================
    // Create Trade
    // =====================================

    const trade =
        await Trade.create({

            userId,

            symbol:
                symbol
                    .trim()
                    .toUpperCase(),

            market,

            side,

            quantity,

            entryPrice:
                numericEntryPrice,

            exitPrice:
                null,

            profit:
                0,

            status:
                "OPEN",

            externalOrderId:
                null,

            externalStatus:
                "NOT_EXECUTED",

            openedAt:
                new Date()

        });


    // =====================================
    // Update Bot
    // =====================================

    bot.openTrades =
        activeTrades + 1;


    bot.lastRun =
        new Date();


    bot.lastHeartbeat =
        new Date();


    bot.lastSignal =
        side;


    bot.lastSignalAt =
        new Date();


    await bot.save();


    // =====================================
    // Return Trade
    // =====================================

    return trade;

}


// =====================================
// Close Trade
// بستن معامله
// =====================================

export async function closeTrade({

    tradeId,

    exitPrice,

    externalStatus = "FILLED"

}) {

    // =====================================
    // Validate Trade ID
    // =====================================

    if (
        !mongoose.Types.ObjectId.isValid(
            tradeId
        )
    ) {

        throw new Error(
            "Invalid trade ID"
        );

    }


    // =====================================
    // Validate Exit Price
    // =====================================

    const numericExitPrice =
        toNumber(exitPrice);


    if (
        numericExitPrice <= 0
    ) {

        throw new Error(
            "Invalid exit price"
        );

    }


    // =====================================
    // Find Trade
    // =====================================

    const trade =
        await Trade.findById(
            tradeId
        );


    if (!trade) {

        throw new Error(
            "Trade not found"
        );

    }


    if (
        trade.status !== "OPEN"
    ) {

        throw new Error(
            "Trade is not open"
        );

    }


    // =====================================
    // Calculate Profit / Loss
    // =====================================

    const entryPrice =
        toNumber(
            trade.entryPrice
        );


    const quantity =
        toNumber(
            trade.quantity
        );


    let difference;


    if (
        trade.side === "BUY"
    ) {

        difference =
            numericExitPrice -
            entryPrice;

    }

    else {

        difference =
            entryPrice -
            numericExitPrice;

    }


    const profit =
        difference *
        quantity;


    const finalProfit =
        Number(
            profit.toFixed(8)
        );


    // =====================================
    // Update Trade
    // =====================================

    trade.exitPrice =
        numericExitPrice;


    trade.profit =
        finalProfit;


    trade.status =
        "CLOSED";


    trade.externalStatus =
        externalStatus;


    trade.closedAt =
        new Date();


    await trade.save();


    // =====================================
    // Find Wallet
    // =====================================

    const wallet =
        await Wallet.findOne({

            userId:
                trade.userId

        });


    if (!wallet) {

        throw new Error(
            "Wallet not found"
        );

    }


    // =====================================
    // COMPOUNDING
    // =====================================
    //
    // This is the most important part.
    //
    // Example:
    //
    // Initial:
    // 100 USDT
    //
    // Profit:
    // +20 USDT
    //
    // New balance:
    // 120 USDT
    //
    // Next trade uses:
    // 120 USDT
    //
    // Next profit:
    // +30 USDT
    //
    // New balance:
    // 150 USDT
    //
    // And so on.
    //
    // =====================================

    const oldBalance =
        toNumber(
            wallet.balance
        );


    const oldTotalProfit =
        toNumber(
            wallet.totalProfit
        );


    const oldWithdrawable =
        toNumber(
            wallet.withdrawable
        );


    const newBalance =
        Number(
            (
                oldBalance +
                finalProfit
            ).toFixed(8)
        );


    const newTotalProfit =
        Number(
            (
                oldTotalProfit +
                finalProfit
            ).toFixed(8)
        );


    wallet.balance =
        newBalance;


    wallet.totalProfit =
        newTotalProfit;


    wallet.totalTrades =
        toNumber(
            wallet.totalTrades
        ) + 1;


    // =====================================
    // Withdrawable Profit
    // =====================================

    if (
        finalProfit > 0
    ) {

        wallet.withdrawable =
            Number(
                (
                    oldWithdrawable +
                    finalProfit
                ).toFixed(8)
            );

    }


    await wallet.save();


    // =====================================
    // Find Bot
    // =====================================

    const bot =
        await Bot.findOne({

            userId:
                trade.userId

        });


    if (!bot) {

        throw new Error(
            "Bot not found"
        );

    }


    // =====================================
    // Decrease Open Trades
    // =====================================

    bot.openTrades =
        Math.max(

            0,

            toNumber(
                bot.openTrades
            ) - 1

        );


    // =====================================
    // Trade Statistics
    // =====================================

    bot.lastTradeProfitUSD =
        finalProfit;


    bot.lastTradeAt =
        new Date();


    bot.lastHeartbeat =
        new Date();


    bot.totalProfitUSD =
        Number(

            (
                toNumber(
                    bot.totalProfitUSD
                ) +
                finalProfit

            ).toFixed(8)

        );


    // =====================================
    // Winning Trade
    // =====================================

    if (
        finalProfit > 0
    ) {

        bot.winningTrades =
            toNumber(
                bot.winningTrades
            ) + 1;


        bot.consecutiveLosses =
            0;


        bot.stopReason =
            "";

    }


    // =====================================
    // Losing Trade
    // =====================================

    else if (
        finalProfit < 0
    ) {

        bot.losingTrades =
            toNumber(
                bot.losingTrades
            ) + 1;


        bot.consecutiveLosses =
            toNumber(
                bot.consecutiveLosses
            ) + 1;


        // =====================================
        // Auto Pause
        // =====================================

        const maxLosses =
            Math.max(

                1,

                toNumber(
                    bot.maxConsecutiveLosses,
                    2
                )

            );


        if (
            bot.consecutiveLosses >=
            maxLosses
        ) {

            bot.status =
                "PAUSED";


            bot.enabled =
                false;


            bot.stopReason =
                "Maximum consecutive losses reached";

        }

    }


    // =====================================
    // Save Bot
    // =====================================

    await bot.save();


    // =====================================
    // Return Result
    // =====================================

    return {

        trade,

        profitUSD:
            finalProfit,

        previousBalanceUSD:
            oldBalance,

        newBalanceUSD:
            newBalance,

        totalProfitUSD:
            newTotalProfit,

        compounded:
            finalProfit > 0,

        botStatus:
            bot.status,

        consecutiveLosses:
            bot.consecutiveLosses,

        openTrades:
            bot.openTrades

    };

}


// =====================================
// Reactivate Bot
// فعال‌سازی مجدد ربات
// =====================================

export async function reactivateBot({

    userId

}) {

    // =====================================
    // Validate User ID
    // =====================================

    if (
        !mongoose.Types.ObjectId.isValid(
            userId
        )
    ) {

        throw new Error(
            "Invalid user ID"
        );

    }


    // =====================================
    // Find Bot
    // =====================================

    const bot =
        await Bot.findOne({

            userId

        });


    if (!bot) {

        throw new Error(
            "Bot not found"
        );

    }


    // =====================================
    // Reactivate
    // =====================================

    bot.consecutiveLosses =
        0;


    bot.status =
        "ACTIVE";


    bot.enabled =
        true;


    bot.stopReason =
        "";


    bot.lastError =
        "";


    bot.lastHeartbeat =
        new Date();


    bot.lastRun =
        new Date();


    await bot.save();


    return bot;

}


// =====================================
// Default Export
// =====================================

export default {

    openTrade,

    closeTrade,

    reactivateBot

};