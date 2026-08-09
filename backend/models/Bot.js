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
        // شناسه کاربر صاحب ربات
        // =====================================

        userId: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,

            unique: true,

            index: true

        },


        // =====================================
        // Status:: M
        // وضعیت فعلی ربات
        // =====================================

        status: {

            type: String,

            enum: [

                "ACTIVE",      // فعال

                "STOPPED",     // متوقف

                "PAUSED",      // توقف موقت

                "ERROR"        // خطای سیستم

            ],

            default: "STOPPED",

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
        // Maximum Daily Loss:: M
        // حداکثر درصد ضرر روزانه
        // =====================================

        maxDailyLossPercent: {

            type: Number,

            default: 3,

            min: 0.5,

            max: 10

        },


        // =====================================
        // Daily Profit USD:: M
        // مجموع سود امروز به دلار
        // =====================================

        dailyProfitUSD: {

            type: Number,

            default: 0

        },


        // =====================================
        // Daily Loss USD:: M
        // مجموع ضرر امروز به دلار
        // =====================================

        dailyLossUSD: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Daily Reset:: M
        // زمان شروع محاسبه روز جدید
        // =====================================

        dailyResetAt: {

            type: Date,

            default: Date.now

        },


        // =====================================
        // Open Trades:: M
        // تعداد معاملات باز
        // =====================================

        openTrades: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Maximum Open Trades:: M
        // حداکثر تعداد معاملات همزمان
        // =====================================

        maxOpenTrades: {

            type: Number,

            default: 3,

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
        // درصد دقت ثبت‌شده هوش مصنوعی
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
        // آخرین اجرای موتور ربات
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
        // آخرین خطای ثبت‌شده
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
        // تعداد معاملات سودده
        // =====================================

        winningTrades: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Losing Trades:: M
        // تعداد معاملات ضررده
        // =====================================

        losingTrades: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Total Profit USD:: M
        // مجموع سود خالص به دلار
        // =====================================

        totalProfitUSD: {

            type: Number,

            default: 0

        },


        // =====================================
        // Total Fees USD:: M
        // مجموع کارمزدها به دلار
        // =====================================

        totalFeesUSD: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Enabled:: M
        // اجازه فعالیت ربات
        // =====================================

        enabled: {

            type: Boolean,

            default: false,

            index: true

        }

    },

    {

        timestamps: true

    }
);


// =====================================
// Database Indexes:: M
// ایندکس‌های مورد نیاز دیتابیس
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
