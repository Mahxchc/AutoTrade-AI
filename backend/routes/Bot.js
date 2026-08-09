// =====================================
// Bot Routes:: M
// AutoTrade AI
// مسیرهای کنترل ربات
// File: backend/routes/bot.js
// =====================================

import express from "express";
import mongoose from "mongoose";

import Bot from "../models/Bot.js";
import User from "../models/User.js";

const router = express.Router();


// =====================================
// GET BOT STATUS:: M
// دریافت وضعیت ربات
// GET /api/bot/:userId
// =====================================

router.get("/:userId", async (req, res) => {

    try {

        const { userId } = req.params;


        // بررسی معتبر بودن شناسه کاربر
        if (!mongoose.Types.ObjectId.isValid(userId)) {

            return res.status(400).json({

                success: false,

                message: "Invalid user ID"

            });

        }


        // پیدا کردن کاربر
        const user = await User.findById(userId);


        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }


        // پیدا کردن ربات
        const bot = await Bot.findOne({ userId });


        // اگر ربات هنوز ساخته نشده باشد
        if (!bot) {

            return res.status(200).json({

                success: true,

                bot: {

                    status: "STOPPED",

                    enabled: false,

                    strategy: "AI Scalping",

                    market: "crypto",

                    riskLevel: "LOW",

                    riskPercent: 1,

                    maxDailyLossPercent: 3,

                    openTrades: 0,

                    maxOpenTrades: 3,

                    lastSignal: "WAIT",

                    accuracy: 0,

                    confidence: 0

                }

            });

        }


        return res.status(200).json({

            success: true,

            bot

        });


    } catch (error) {

        console.error(
            "Get Bot Status Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to get bot status"

        });

    }

});


// =====================================
// START BOT:: M
// شروع ربات
// POST /api/bot/start/:userId
// =====================================

router.post("/start/:userId", async (req, res) => {

    try {

        const { userId } = req.params;


        // بررسی شناسه کاربر
        if (!mongoose.Types.ObjectId.isValid(userId)) {

            return res.status(400).json({

                success: false,

                message: "Invalid user ID"

            });

        }


        // پیدا کردن کاربر
        const user = await User.findById(userId);


        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }


        // =====================================
        // بررسی تأیید دسترسی کاربر
        // =====================================

        if (

            user.approvalStatus !== "APPROVED" ||

            user.accessEnabled !== true ||

            user.botAccess !== true ||

            user.status !== "ACTIVE"

        ) {

            return res.status(403).json({

                success: false,

                message:
                    "Your trading access has not been approved yet."

            });

        }


        // =====================================
        // پیدا کردن یا ساخت ربات
        // =====================================

        let bot = await Bot.findOne({ userId });


        if (!bot) {

            bot = await Bot.create({

                userId,

                status: "ACTIVE",

                enabled: true,

                strategy: "AI Scalping",

                market: "crypto",

                riskLevel: "LOW",

                riskPercent: 1,

                maxDailyLossPercent: 3,

                maxOpenTrades: 3,

                lastSignal: "WAIT",

                lastRun: new Date(),

                lastHeartbeat: new Date(),

                stopReason: ""

            });

        }

        else {

            // =====================================
            // بررسی وضعیت فعلی ربات
            // =====================================

            if (bot.status === "ACTIVE" && bot.enabled === true) {

                return res.status(200).json({

                    success: true,

                    message: "Trading bot is already active",

                    bot

                });

            }


            // =====================================
            // فعال کردن ربات
            // =====================================

            bot.status = "ACTIVE";

            bot.enabled = true;

            bot.stopReason = "";

            bot.lastError = "";

            bot.lastRun = new Date();

            bot.lastHeartbeat = new Date();


            await bot.save();

        }


        // همگام‌سازی وضعیت ربات در User
        user.botActive = true;

        await user.save();


        return res.status(200).json({

            success: true,

            message: "Trading bot started successfully",

            bot

        });


    } catch (error) {

        console.error(
            "Start Bot Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to start bot"

        });

    }

});


// =====================================
// STOP BOT:: M
// توقف ربات
// POST /api/bot/stop/:userId
// =====================================

router.post("/stop/:userId", async (req, res) => {

    try {

        const { userId } = req.params;


        // بررسی شناسه کاربر
        if (!mongoose.Types.ObjectId.isValid(userId)) {

            return res.status(400).json({

                success: false,

                message: "Invalid user ID"

            });

        }


        // پیدا کردن کاربر
        const user = await User.findById(userId);


        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User not found"

            });

        }


        // پیدا کردن ربات
        const bot = await Bot.findOne({ userId });


        if (!bot) {

            user.botActive = false;

            await user.save();


            return res.status(200).json({

                success: true,

                message: "Trading bot is already stopped",

                bot: null

            });

        }


        // =====================================
        // توقف ربات
        // =====================================

        bot.status = "STOPPED";

        bot.enabled = false;

        bot.stopReason = "Stopped by user";

        bot.lastHeartbeat = new Date();


        await bot.save();


        // همگام‌سازی وضعیت کاربر
        user.botActive = false;

        await user.save();


        return res.status(200).json({

            success: true,

            message: "Trading bot stopped successfully",

            bot

        });


    } catch (error) {

        console.error(
            "Stop Bot Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Failed to stop bot"

        });

    }

});


// =====================================
// EXPORT ROUTER:: M
// خروجی مسیرهای ربات
// =====================================

export default router;
