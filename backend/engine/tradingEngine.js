// =====================================
// Trading Engine:: M
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
// Open Trade:: M
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
    // بررسی شناسه کاربر:: M
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
    // بررسی اطلاعات معامله:: M
    // =====================================

    if (!symbol) {

        throw new Error(
            "Symbol is required"
        );

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
        !Number.isFinite(
            numericEntryPrice
        ) ||
        numericEntryPrice <= 0
    ) {

        throw new Error(
            "Invalid entry price"
        );

    }


    if (
        !Number.isFinite(
            numericStopLossPrice
        ) ||
        numericStopLossPrice <= 0
    ) {

        throw new Error(
            "Invalid stop-loss price"
        );

    }


    // =====================================
    // بررسی صحیح بودن حد ضرر:: M
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
    // بررسی کاربر:: M
    // =====================================

    const user =
        await User.findById(userId);


    if (!user) {

        throw new Error(
            "User not found"
        );

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
    // دریافت ربات:: M
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
    // بررسی فعال بودن ربات:: M
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
    // بررسی ضررهای متوالی:: M
    // =====================================

    if (

        bot.consecutiveLosses >=
        bot.maxConsecutiveLosses

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
    // دریافت کیف پول:: M
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
    // بررسی معاملات باز:: M
    // =====================================

    const activeTrades =
        await Trade.countDocuments({

            userId,

            status: "OPEN"

        });


    if (

        activeTrades >=
        bot.maxOpenTrades

    ) {

        throw new Error(
            "Maximum open trades reached"
        );

    }


    // =====================================
    // محاسبه حجم معامله:: M
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


    // =====================================
    // ثبت معامله:: M
    // =====================================

    const trade =
        await Trade.create({

            userId,

            symbol:
                symbol.toUpperCase(),

            market,

            side,

            quantity:
                position.positionSize,

            entryPrice:
                numericEntryPrice,

            exitPrice:
                null,

            profit: 0,

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
    // به‌روزرسانی وضعیت ربات:: M
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
// Close Trade:: M
// بستن معامله و ثبت نتیجه
// =====================================

export async function closeTrade({

    tradeId,

    exitPrice,

    externalStatus = "FILLED"

}) {


    // =====================================
    // بررسی شناسه معامله:: M
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
    // پیدا کردن معامله:: M
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
    // محاسبه سود یا ضرر:: M
    // =====================================

    const difference =

        trade.side === "BUY"

            ?

        numericExitPrice -
        trade.entryPrice

            :

        trade.entryPrice -
        numericExitPrice;


    const profit =

        difference *
        trade.quantity;


    const finalProfit =
        Number(
            profit.toFixed(8)
        );


    // =====================================
    // ثبت نتیجه معامله:: M
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
    // دریافت کیف پول:: M
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
    // به‌روزرسانی کیف پول:: M
    // =====================================

    wallet.balance =
        Number(
            wallet.balance
        ) + finalProfit;


    wallet.totalProfit =
        Number(
            wallet.totalProfit
        ) + finalProfit;


    wallet.totalTrades += 1;


    if (finalProfit > 0) {

        wallet.withdrawable =
            Number(
                wallet.withdrawable
            ) + finalProfit;

    }


    await wallet.save();


    // =====================================
    // دریافت ربات:: M
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
    // کاهش معاملات باز:: M
    // =====================================

    bot.openTrades =
        Math.max(

            0,

            Number(
                bot.openTrades
            ) - 1

        );


    // =====================================
    // ثبت آمار معامله:: M
    // =====================================

    bot.lastTradeProfitUSD =
        finalProfit;


    bot.lastTradeAt =
        new Date();


    bot.lastHeartbeat =
        new Date();


    bot.totalProfitUSD =
        Number(
            bot.totalProfitUSD
        ) + finalProfit;


    // =====================================
    // معامله سودده:: M
    // صفر کردن ضررهای متوالی
    // =====================================

    if (finalProfit > 0) {


        bot.winningTrades += 1;


        bot.consecutiveLosses =
            0;


        bot.stopReason =
            "";

    }


    // =====================================
    // معامله ضررده:: M
    // افزایش ضررهای متوالی
    // =====================================

    else if (finalProfit < 0) {


        bot.losingTrades += 1;


        bot.consecutiveLosses += 1;


        // =====================================
        // توقف خودکار بعد از ۲ ضرر:: M
        // =====================================

        if (

            bot.consecutiveLosses >=
            bot.maxConsecutiveLosses

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
    // ذخیره وضعیت نهایی ربات:: M
    // =====================================

    await bot.save();


    // =====================================
    // نتیجه نهایی:: M
    // =====================================

    return {

        trade,

        profitUSD:
            finalProfit,

        botStatus:
            bot.status,

        consecutiveLosses:
            bot.consecutiveLosses,

        openTrades:
            bot.openTrades

    };

}


// =====================================
// Reactivate Bot:: M
// فعال‌سازی مجدد بعد از توقف
// =====================================

export async function reactivateBot({

    userId

}) {


    // =====================================
    // بررسی شناسه کاربر:: M
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
    // دریافت ربات:: M
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
    // فعال‌سازی مجدد:: M
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
