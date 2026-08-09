// =====================================
// Trading Service:: M
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
// Execute Trade:: M
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
    // بررسی اطلاعات اصلی معامله:: M
    // =====================================

    if (!userId) {

        throw new Error(
            "User ID is required"
        );

    }


    if (!symbol) {

        throw new Error(
            "Symbol is required"
        );

    }


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
    // دریافت ربات کاربر:: M
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
    // بررسی فعال بودن ربات:: M
    // =====================================

    if (

        bot.enabled !== true ||

        bot.status !== "ACTIVE"

    ) {

        return {

            executed: false,

            status: "BOT_NOT_ACTIVE",

            reason:
                "Bot is not active",

            order: null

        };

    }


    // =====================================
    // بررسی توقف خودکار بعد از ضرر متوالی:: M
    // =====================================

    if (

        bot.consecutiveLosses >=
        bot.maxConsecutiveLosses

    ) {


        bot.status = "PAUSED";

        bot.enabled = false;

        bot.stopReason =
            "Maximum consecutive losses reached";

        bot.lastHeartbeat =
            new Date();


        await bot.save();


        return {

            executed: false,

            status: "BOT_PAUSED",

            reason:
                "Bot paused after maximum consecutive losses",

            order: null

        };

    }


    // =====================================
    // بررسی تعداد معاملات باز:: M
    // =====================================

    if (

        bot.openTrades >=
        bot.maxOpenTrades

    ) {

        return {

            executed: false,

            status: "MAX_OPEN_TRADES",

            reason:
                "Maximum open trades reached",

            order: null

        };

    }


    // =====================================
    // سیگنال انتظار:: M
    // =====================================

    if (signal === "WAIT") {

        bot.lastSignal = "WAIT";

        bot.lastSignalAt =
            new Date();

        bot.lastHeartbeat =
            new Date();

        await bot.save();


        return {

            executed: false,

            status: "WAITING",

            reason:
                "AI decided to wait",

            order: null

        };

    }


    // =====================================
    // بررسی سیگنال خرید یا فروش:: M
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
    // ثبت آخرین سیگنال AI:: M
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
    // ارسال سفارش به لایه صرافی:: M
    // =====================================

    const order =
        await placeOrder({

            symbol,

            type: signal,

            amount:
                numericQuantity,

            market,

            orderType,

            stopLossPrice,

            takeProfitPrice

        });


    // =====================================
    // بررسی دریافت شناسه سفارش:: M
    // =====================================

    if (

        !order ||

        !order.orderId

    ) {

        return {

            executed: false,

            status: "NOT_CONFIRMED",

            reason:
                "Exchange did not provide a confirmed order ID",

            order:
                order || null

        };

    }


    // =====================================
    // بررسی وضعیت سفارش:: M
    // =====================================

    const orderStatus =
        await checkOrderStatus({

            orderId:
                order.orderId

        });


    // =====================================
    // وضعیت‌های تأیید شده:: M
    // =====================================

    const confirmedStatuses = [

        "FILLED",

        "COMPLETED",

        "EXECUTED"

    ];


    const currentStatus =

        String(

            orderStatus?.status || ""

        ).toUpperCase();


    const executed =

        confirmedStatuses.includes(

            currentStatus

        );


    // =====================================
    // اگر معامله تأیید شد:: M
    // =====================================

    if (executed) {

        bot.openTrades += 1;

        bot.totalTrades += 1;

        bot.lastHeartbeat =
            new Date();


        await bot.save();

    }


    // =====================================
    // نتیجه اجرای معامله:: M
    // =====================================

    return {

        executed,

        status:
            orderStatus.status,

        order,

        orderStatus

    };

}
