// =====================================
// Trading Service :: M
// AutoTrade AI
// لایه اجرای معاملات
// File: backend/services/tradingService.js
// =====================================

import Bot from "../models/Bot.js";

import {
    placeOrder,
    checkOrderStatus
} from "./exchangeService.js";


// =====================================
// Execute Trade
// اجرای یک معامله
// =====================================

export async function executeTrade({

    userId,

    signal,

    symbol,

    quantity,

    market = "crypto",

    orderType = "MARKET",

    stopLossPrice = null,

    takeProfitPrice = null

}) {

    // =====================================
    // Validate User
    // =====================================

    if (!userId) {

        throw new Error(
            "User ID is required"
        );

    }


    // =====================================
    // Validate Symbol
    // =====================================

    if (!symbol) {

        throw new Error(
            "Symbol is required"
        );

    }


    // =====================================
    // Validate Quantity
    // =====================================

    const numericQuantity =
        Number(quantity);


    if (
        !Number.isFinite(
            numericQuantity
        ) ||
        numericQuantity <= 0
    ) {

        throw new Error(
            "Trade quantity must be greater than zero"
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
    // Check Bot Status
    // =====================================

    if (
        bot.enabled !== true ||
        bot.status !== "ACTIVE"
    ) {

        return {

            executed:
                false,

            status:
                "BOT_NOT_ACTIVE",

            reason:
                "Bot is not active",

            order:
                null

        };

    }


    // =====================================
    // Check Consecutive Losses
    // =====================================

    const consecutiveLosses =
        Number(
            bot.consecutiveLosses || 0
        );


    const maxConsecutiveLosses =
        Math.max(

            1,

            Number(
                bot.maxConsecutiveLosses || 2
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


        return {

            executed:
                false,

            status:
                "BOT_PAUSED",

            reason:
                "Bot paused after maximum consecutive losses",

            order:
                null

        };

    }


    // =====================================
    // Check Open Trades
    // =====================================

    const openTrades =
        Number(
            bot.openTrades || 0
        );


    const maxOpenTrades =
        Math.max(

            1,

            Number(
                bot.maxOpenTrades || 1
            )

        );


    if (
        openTrades >=
        maxOpenTrades
    ) {

        return {

            executed:
                false,

            status:
                "MAX_OPEN_TRADES",

            reason:
                "Maximum open trades reached",

            order:
                null

        };

    }


    // =====================================
    // WAIT Signal
    // =====================================

    if (
        signal === "WAIT"
    ) {

        bot.lastSignal =
            "WAIT";

        bot.lastSignalAt =
            new Date();

        bot.lastHeartbeat =
            new Date();


        await bot.save();


        return {

            executed:
                false,

            status:
                "WAITING",

            reason:
                "AI decided to wait",

            order:
                null

        };

    }


    // =====================================
    // Validate Signal
    // =====================================

    if (
        signal !== "BUY" &&
        signal !== "SELL"
    ) {

        throw new Error(
            "Invalid trading signal"
        );

    }


    // =====================================
    // Update Bot Signal
    // =====================================

    bot.lastSignal =
        signal;

    bot.lastSignalAt =
        new Date();

    bot.lastRun =
        new Date();

    bot.lastHeartbeat =
        new Date();


    await bot.save();


    // =====================================
    // Place Exchange Order
    // =====================================

    const order =
        await placeOrder({

            symbol,

            type:
                signal,

            amount:
                numericQuantity,

            market,

            orderType,

            stopLossPrice,

            takeProfitPrice

        });


    // =====================================
    // Validate Order ID
    // =====================================

    if (
        !order ||
        !order.orderId
    ) {

        return {

            executed:
                false,

            status:
                "NOT_CONFIRMED",

            reason:
                "Exchange did not provide a confirmed order ID",

            order:
                order || null

        };

    }


    // =====================================
    // Check Exchange Status
    // =====================================

    const orderStatus =
        await checkOrderStatus({

            orderId:
                order.orderId

        });


    const currentStatus =
        String(
            orderStatus?.status || ""
        ).toUpperCase();


    const confirmedStatuses = [

        "FILLED",

        "COMPLETED",

        "EXECUTED"

    ];


    const executed =
        confirmedStatuses.includes(
            currentStatus
        );


    // =====================================
    // Successful Execution
    // =====================================

    if (
        executed
    ) {

        bot.openTrades =
            Number(
                bot.openTrades || 0
            ) + 1;

        bot.totalTrades =
            Number(
                bot.totalTrades || 0
            ) + 1;

        bot.lastHeartbeat =
            new Date();


        await bot.save();

    }


    // =====================================
    // Return
    // =====================================

    return {

        executed,

        status:
            orderStatus?.status ||
            currentStatus,

        order,

        orderStatus

    };

}


// =====================================
// Default Export
// =====================================

export default {

    executeTrade

};