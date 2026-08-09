// =====================================
// AutoTrade AI
// Trading Engine
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
// Open Trade
// =====================================
//
// IMPORTANT:
//
// This function prepares and records a trade
// only when all internal checks pass.
//
// It does NOT claim to execute a real
// broker/exchange order.
//
// Real execution will be connected through
// a dedicated broker/exchange adapter.
//

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

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid user ID");
    }

    // =====================================
    // Validate Basic Data
    // =====================================

    if (!symbol) {
        throw new Error("Symbol is required");
    }

    if (
        side !== "BUY" &&
        side !== "SELL"
    ) {
        throw new Error(
            "Trade side must be BUY or SELL"
        );
    }

    const numericEntryPrice =
        Number(entryPrice);

    const numericStopLossPrice =
        Number(stopLossPrice);

    if (
        !Number.isFinite(numericEntryPrice) ||
        numericEntryPrice <= 0
    ) {
        throw new Error(
            "Invalid entry price"
        );
    }

    if (
        !Number.isFinite(numericStopLossPrice) ||
        numericStopLossPrice <= 0
    ) {
        throw new Error(
            "Invalid stop-loss price"
        );
    }

    // =====================================
    // Check User
    // =====================================

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

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
    // Check Bot
    // =====================================

    const bot = await Bot.findOne({
        userId
    });

    if (!bot) {
        throw new Error(
            "Trading bot is not configured"
        );
    }

    if (bot.status !== "ACTIVE") {
        throw new Error(
            "Trading bot is not active"
        );
    }

    // =====================================
    // Get Wallet
    // =====================================

    const wallet = await Wallet.findOne({
        userId
    });

    if (!wallet) {
        throw new Error(
            "Wallet not found"
        );
    }

    const balance =
        Number(wallet.balance);

    if (
        !Number.isFinite(balance) ||
        balance <= 0
    ) {
        throw new Error(
            "Insufficient wallet balance"
        );
    }

    // =====================================
    // Count Open Trades
    // =====================================

    const activeTrades =
        await Trade.countDocuments({
            userId,
            status: "OPEN"
        });

    // =====================================
    // Calculate Daily Loss
    // =====================================

    const startOfDay = new Date();

    startOfDay.setHours(
        0,
        0,
        0,
        0
    );

    const dailyLossResult =
        await Trade.aggregate([
            {
                $match: {
                    userId:
                        new mongoose.Types.ObjectId(
                            userId
                        ),

                    status: "CLOSED",

                    closedAt: {
                        $gte: startOfDay
                    },

                    profit: {
                        $lt: 0
                    }
                }
            },

            {
                $group: {
                    _id: null,

                    totalLoss: {
                        $sum: "$profit"
                    }
                }
            }
        ]);

    const dailyLossAmount =
        Math.abs(
            dailyLossResult[0]?.totalLoss || 0
        );

    // =====================================
    // Risk Permission
    // =====================================

    const permission =
        checkTradePermission({
            activeTrades,
            maxOpenTrades: 5,

            dailyLossAmount,
            balance,

            maxDailyLossPercent: 5
        });

    if (!permission.allowed) {
        throw new Error(
            permission.reason
        );
    }

    // =====================================
    // Position Size
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
        !Number.isFinite(
            position.positionSize
        ) ||
        position.positionSize <= 0
    ) {
        throw new Error(
            "Invalid calculated position size"
        );
    }

    // =====================================
    // Create Trade Record
    // =====================================
    //
    // This record represents the internal
    // trading state.
    //
    // A real external order must be confirmed
    // by the broker/exchange before we mark
    // it as successfully executed.
    //

    const trade = await Trade.create({
        userId,

        symbol:
            symbol.toUpperCase(),

        market,

        side,

        quantity:
            position.positionSize,

        entryPrice:
            numericEntryPrice,

        exitPrice: null,

        profit: 0,

        status: "OPEN",

        externalOrderId: null,

        externalStatus: "NOT_EXECUTED",

        openedAt: new Date()
    });

    // =====================================
    // Update Bot
    // =====================================

    bot.lastRun = new Date();

    bot.lastHeartbeat = new Date();

    await bot.save();

    return trade;
}


// =====================================
// Close Trade
// =====================================
//
// IMPORTANT:
//
// A production implementation should receive
// the actual fill/close result from the broker.
//
// This function records the confirmed
// external result.
//

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

    const numericExitPrice =
        Number(exitPrice);

    if (
        !Number.isFinite(
            numericExitPrice
        ) ||
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

    if (trade.status !== "OPEN") {
        throw new Error(
            "Trade is not open"
        );
    }

    // =====================================
    // Calculate P/L
    // =====================================

    const difference =
        trade.side === "BUY"
            ? numericExitPrice -
              trade.entryPrice
            : trade.entryPrice -
              numericExitPrice;

    const profit =
        difference *
        trade.quantity;

    // =====================================
    // Update Trade
    // =====================================

    trade.exitPrice =
        numericExitPrice;

    trade.profit =
        Number(
            profit.toFixed(8)
        );

    trade.status =
        "CLOSED";

    trade.externalStatus =
        externalStatus;

    trade.closedAt =
        new Date();

    await trade.save();

    // =====================================
    // Update Wallet
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

    wallet.balance +=
        trade.profit;

    wallet.totalProfit +=
        trade.profit;

    wallet.totalTrades += 1;

    if (trade.profit > 0) {
        wallet.withdrawable +=
            trade.profit;
    }

    await wallet.save();

    return trade;
        }
