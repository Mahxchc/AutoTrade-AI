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

function toNumber(
    value,
    fallback = 0
) {

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
    // Validate User
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
        toNumber(
            entryPrice
        );

    const numericStopLossPrice =
        toNumber(
            stopLossPrice
        );


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
    // Check Bot
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

    const consecutiveLosses =
        toNumber(
            bot.consecutiveLosses
        );

    const maxConsecutiveLosses =
        Math.max(
            1,
            toNumber(
                bot.maxConsecutiveLosses,
                2
            )
        );


    if (
        consecutiveLosses >=
        maxConsecutiveLosses
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


    if (
        wallet.status !== "ACTIVE"
    ) {

        throw new Error(
            "Wallet is not active"
        );

    }


    // =====================================
    // Current Capital
    // =====================================
    //
    // موجودی فعلی مبنای معامله بعدی است.
    //
    // مثال:
    //
    // 2 USDT
    // +0.5 profit
    // = 2.5 USDT
    //
    // معامله بعدی بر اساس 2.5 USDT
    // محاسبه می‌شود.
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
    // Open Trades
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
        toNumber(
            exitPrice
        );


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
    // Calculate P/L
    // =====================================

    const entryPrice =
        toNumber(
            trade.entryPrice
        );

    const quantity =
        toNumber(
            trade.quantity
        );


    if (
        entryPrice <= 0 ||
        quantity <= 0
    ) {

        throw new Error(
            "Invalid trade data"
        );

    }


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
    // Find Wallet BEFORE updating trade
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


    if (
        wallet.status !== "ACTIVE"
    ) {

        throw new Error(
            "Wallet is not active"
        );

    }


    // =====================================
    // Current Capital
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


    if (
        oldBalance < 0
    ) {

        throw new Error(
            "Wallet balance is invalid"
        );

    }


    // =====================================
    // New Capital
    // =====================================
    //
    // سود:
    //
    // 2.00000000
    // +0.50000000
    // =2.50000000
    //
    // ضرر:
    //
    // 2.50000000
    // -0.20000000
    // =2.30000000
    //
    // =====================================

    const raw