// =====================================
// Bot Model:: M
// AutoTrade AI
// مدل وضعیت و تنظیمات ربات
// File: backend/models/Bot.js
// =====================================

import mongoose from "mongoose";


// =====================================
// Bot Schema:: M
// ساختار اطلاعات ربات
// =====================================

const botSchema = new mongoose.Schema(
    {

        // =====================================
        // User Reference:: M
        // کاربر صاحب ربات
        // =====================================

        userId: {

            type: mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,

            unique: true,

            index: true

        },


        // =====================================
        // Status:: M
        // وضعیت ربات
        // =====================================

        status: {

            type: String,

            enum: [

                "ACTIVE",

                "STOPPED",

                "PAUSED",

                "ERROR"

            ],

            default: "STOPPED",

            index: true

        },


        // =====================================
        // Enabled:: M
        // اجازه فعالیت ربات
        // =====================================

        enabled: {

            type: Boolean,

            default: false,

            index: true

        },


        // =====================================
        // Stop Reason:: M
        // دلیل توقف ربات
        // =====================================

        stopReason: {

            type: String,

            default: ""

        },


        // =====================================
        // Strategy:: M
        // استراتژی معاملاتی
        // =====================================

        strategy: {

            type: String,

            default: "AI Scalping",

            trim: true

        },


        // =====================================
        // Market:: M
        // بازار معاملاتی
        // =====================================

        market: {

            type: String,

            enum: [

                "crypto",

                "forex",

                "stocks",

                "other"

            ],

            default: "crypto",

            index: true

        },


        // =====================================
        // Risk Level:: M
        // سطح ریسک
        // =====================================

        riskLevel: {

            type: String,

            enum: [

                "LOW",

                "MEDIUM",

                "HIGH"

            ],

            default: "LOW"

        },


        // =====================================
        // Risk Percent:: M
        // درصد ریسک هر معامله
        // =====================================

        riskPercent: {

            type: Number,

            default: 1,

            min: 0.1,

            max: 5

        },


        // =====================================
        // Maximum Consecutive Losses:: M
        // حداکثر ضررهای متوالی
        // =====================================

        maxConsecutiveLosses: {

            type: Number,

            default: 2,

            min: 1,

            max: 10

        },


        // =====================================
        // Consecutive Losses:: M
        // تعداد ضررهای متوالی فعلی
        // =====================================

        consecutiveLosses: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Daily Profit USD:: M
        // سود امروز به دلار
        // =====================================

        dailyProfitUSD: {

            type: Number,

            default: 0

        },


        // =====================================
        // Daily Loss USD:: M
        // ضرر امروز به دلار
        // =====================================

        dailyLossUSD: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Open Trades:: M
        // معاملات باز
        // =====================================

        openTrades: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Maximum Open Trades:: M
        // حداکثر معاملات باز
        // =====================================

        maxOpenTrades: {

            type: Number,

            default: 1,

            min: 1,

            max: 20

        },


        // =====================================
        // Last Signal:: M
        // آخرین سیگنال هوش مصنوعی
        // =====================================

        lastSignal: {

            type: String,

            enum: [

                "BUY",

                "SELL",

                "HOLD",

                "WAIT"

            ],

            default: "WAIT"

        },


        // =====================================
        // AI Accuracy:: M
        // دقت هوش مصنوعی
        // =====================================

        accuracy: {

            type: Number,

            default: 0,

            min: 0,

            max: 100

        },


        // =====================================
        // AI Confidence:: M
        // میزان اطمینان هوش مصنوعی
        // =====================================

        confidence: {

            type: Number,

            default: 0,

            min: 0,

            max: 100

        },


        // =====================================
        // Last Signal Time:: M
        // زمان آخرین سیگنال
        // =====================================

        lastSignalAt: {

            type: Date,

            default: null

        },


        // =====================================
        // Last Run:: M
        // آخرین اجرای موتور
        // =====================================

        lastRun: {

            type: Date,

            default: null

        },


        // =====================================
        // Last Heartbeat:: M
        // آخرین علامت زنده بودن ربات
        // =====================================

        lastHeartbeat: {

            type: Date,

            default: null

        },


        // =====================================
        // Last Error:: M
        // آخرین خطای سیستم
        // =====================================

        lastError: {

            type: String,

            default: ""

        },


        // =====================================
        // Total Trades:: M
        // تعداد کل معاملات
        // =====================================

        totalTrades: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Winning Trades:: M
        // معاملات سودده
        // =====================================

        winningTrades: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Losing Trades:: M
        // معاملات ضررده
        // =====================================

        losingTrades: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Total Profit USD:: M
        // مجموع سود و زیان به دلار
        // =====================================

        totalProfitUSD: {

            type: Number,

            default: 0

        },


        // =====================================
        // Total Fees USD:: M
        // مجموع کارمزد به دلار
        // =====================================

        totalFeesUSD: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Last Trade Profit USD:: M
        // سود یا ضرر آخرین معامله
        // =====================================

        lastTradeProfitUSD: {

            type: Number,

            default: 0

        },


        // =====================================
        // Last Trade Time:: M
        // زمان آخرین معامله
        // =====================================

        lastTradeAt: {

            type: Date,

            default: null

        }

    },

    {

        timestamps: true

    }
);


// =====================================
// Database Indexes:: M
// ایندکس‌های دیتابیس
// =====================================

botSchema.index({

    status: 1,

    enabled: 1

});


botSchema.index({

    userId: 1,

    status: 1

});


// =====================================
// Bot Model:: M
// مدل نهایی ربات
// =====================================

const Bot = mongoose.model(

    "Bot",

    botSchema

);


export default Bot;
