// ============================================================
// ::M AutoTrade AI
// APP.JS VERSION 2
// Telegram + Dashboard + Backend + Navigation
// ============================================================

"use strict";


// ============================================================
// ::M TELEGRAM
// ============================================================

const tg = window.Telegram?.WebApp || null;

let user = null;

if (tg) {
    tg.ready();
    tg.expand();

    user = tg.initDataUnsafe?.user || null;
}


// ============================================================
// ::M CONFIG
// ============================================================

const API_URL =
    "https://autotrade-backend-02cc.onrender.com";

const REFRESH_INTERVAL = 30000;


// ============================================================
// ::M BOT STATE
// ============================================================

const bot = {
    active: false,
    balance: 0,
    totalProfit: 0,
    todayProfit: 0,
    totalTrades: 0,
    activeTrades: 0,
    confidence: 0,
    accuracy: 0,
    strategy: "AI Scalping",
    riskLevel: "MEDIUM",
    signal: "WAIT"
};


// ============================================================
// ::M HELPERS
// ============================================================

function $(id) {
    return document.getElementById(id);
}


function setText(id, value) {

    const element = $(id);

    if (element) {
        element.textContent = value;
    }

}


function formatMoney(value) {

    const number = Number(value) || 0;

    return "$" + number.toFixed(2);

}


function formatNumber(value) {

    const number = Number(value) || 0;

    return number.toLocaleString("en-US");

}


// ============================================================
// ::M USER
// ============================================================

function updateUserUI() {

    if (!user) {

        setText(
            "userName",
            "کاربر"
        );

        return;
    }


    const firstName =
        user.first_name ||
        user.username ||
        "کاربر";


    setText(
        "userName",
        firstName
    );

}


updateUserUI();


// ============================================================
// ::M DASHBOARD
// ============================================================

function updateDashboard(data) {

    if (!data) {
        return;
    }


    // --------------------------------------------------------
    // Balance
    // --------------------------------------------------------

    if (data.balance !== undefined) {

        bot.balance =
            Number(data.balance) || 0;

    }


    setText(
        "balance",
        formatMoney(bot.balance)
    );


    // تومان فعلاً بدون نرخ تبدیل واقعی
    setText(
        "balanceRial",
        "0"
    );


    // --------------------------------------------------------
    // Profit
    // --------------------------------------------------------

    if (data.totalProfit !== undefined) {

        bot.totalProfit =
            Number(data.totalProfit) || 0;

    }

    else if (data.profit !== undefined) {

        bot.totalProfit =
            Number(data.profit) || 0;

    }


    setText(
        "totalProfit",
        formatMoney(bot.totalProfit)
    );


    // --------------------------------------------------------
    // Today Profit
    // --------------------------------------------------------

    if (data.todayProfit !== undefined) {

        bot.todayProfit =
            Number(data.todayProfit) || 0;

    }


    setText(
        "todayProfit",
        formatMoney(bot.todayProfit)
    );


    // --------------------------------------------------------
    // Trades
    // --------------------------------------------------------

    if (data.totalTrades !== undefined) {

        bot.totalTrades =
            Number(data.totalTrades) || 0;

    }

    else if (data.trades !== undefined) {

        bot.totalTrades =
            Number(data.trades) || 0;

    }


    setText(
        "totalTrades",
        formatNumber(bot.totalTrades)
    );


    // --------------------------------------------------------
    // Active Trades
    // --------------------------------------------------------

    if (data.activeTrades !== undefined) {

        bot.activeTrades =
            Number(data.activeTrades) || 0;

    }


    setText(
        "activeTrades",
        formatNumber(bot.activeTrades)
    );


    // --------------------------------------------------------
    // AI Confidence
    // --------------------------------------------------------

    if (data.confidence !== undefined) {

        bot.confidence =
            Number(data.confidence) || 0;

    }

    else if (data.aiAccuracy !== undefined) {

        bot.confidence =
            Number(data.aiAccuracy) || 0;

    }


    setText(
        "aiConfidence",
        Math.round(bot.confidence)
    );


    // --------------------------------------------------------
    // Accuracy
    // --------------------------------------------------------

    if (data.aiAccuracy !== undefined) {

        bot.accuracy =
            Number(data.aiAccuracy) || 0;

    }


    // --------------------------------------------------------
    // Strategy
    // --------------------------------------------------------

    if (data.strategy) {

        bot.strategy =
            data.strategy;

    }


    setText(
        "strategy",
        bot.strategy
    );


    // --------------------------------------------------------
    // Risk
    // --------------------------------------------------------

    if (data.riskLevel) {

        bot.riskLevel =
            data.riskLevel;

    }


    setText(
        "riskLevel",
        bot.riskLevel
    );


    // --------------------------------------------------------
    // Signal
    // --------------------------------------------------------

    if (data.signal) {

        bot.signal =
            data.signal;

    }


    updateSignalUI();

}


// ============================================================
// ::M SIGNAL
// ============================================================

function updateSignalUI() {

    const signal =
        String(bot.signal || "WAIT")
            .toUpperCase();


    const latestSignal =
        $("latestSignal");

    const signalValue =
        $("signalValue");


    if (!latestSignal ||
        !signalValue) {

        return;
    }


    if (
        signal === "BUY" ||
        signal === "LONG"
    ) {

        latestSignal.textContent =
            "سیگنال خرید";

        signalValue.textContent =
            "BUY";

        signalValue.style.color =
            "#00d982";

        return;
    }


    if (
        signal === "SELL" ||
        signal === "SHORT"
    ) {

        latestSignal.textContent =
            "سیگنال فروش";

        signalValue.textContent =
            "SELL";

        signalValue.style.color =
            "#ff5364";

        return;
    }


    latestSignal.textContent =
        "در حال انتظار برای سیگنال";

    signalValue.textContent =
        "WAIT";

    signalValue.style.color =
        "#a34cff";

}


// ============================================================
// ::M BOT STATUS UI
// ============================================================

function updateBotUI() {

    const status =
        $("aiStatus");

    const statusText =
        $("bot
