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

import {
    reactivateBot
} from "../engine/tradingEngine.js";


const router = express.Router();


// =====================================
// GET BOT STATUS:: M
// دریافت وضعیت ربات
// GET /api/bot/:userId
// =====================================

router.get("/:userId", async (req, res) => {

    try {

        const { userId } =
            req.params;


        // =====================================
        // بررسی شناسه کاربر:: M
        // =====================================

        if (
            !mongoose.Types.ObjectId.isValid(
                userId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid user ID"

            });

        }


        // =====================================
        // پیدا کردن کاربر:: M
        // =====================================

        const user =
            await User.findById(
                userId
            );


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        // =====================================
        // پیدا کردن ربات:: M
        // =====================================

        const bot =
            await Bot.findOne({

                userId

            });


        // =====================================
        // اگر ربات وجود نداشت:: M
        // =====================================

        if (!bot) {

            return res.status(200).json({

                success: true,

                bot: {

                    status:
                        "STOPPED",

                    enabled:
                        false,

                    strategy:
                        "AI Scalping",

                    market:
                        "crypto",

                    riskLevel:
                        "LOW",

                    riskPercent:
                        1,

                    maxOpenTrades:
                        1,

                    openTrades:
                        0,

                    maxConsecutiveLosses:
                        2,

                    consecutiveLosses:
                        0,

                    lastSignal:
                        "WAIT",

                    accuracy:
                        0,

                    confidence:
                        0,

                    stopReason:
                        ""

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

            message:
                "Failed to get bot status"

        });

    }

});


// =====================================
// START BOT:: M
// شروع ربات
// POST /api/bot/start/:userId
// =====================================

router.post(
    "/start/:userId",
    async (req, res) => {

        try {

            const { userId } =
                req.params;


            // =====================================
            // بررسی شناسه کاربر:: M
            // =====================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    userId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid user ID"

                });

            }


            // =====================================
            // پیدا کردن کاربر:: M
            // =====================================

            const user =
                await User.findById(
                    userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            // =====================================
            // بررسی دسترسی کاربر:: M
            // =====================================

            if (

                user.approvalStatus !==
                    "APPROVED" ||

                user.accessEnabled !==
                    true ||

                user.botAccess !==
                    true ||

                user.status !==
                    "ACTIVE"

            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Your trading access has not been approved yet."

                });

            }


            // =====================================
            // پیدا کردن ربات:: M
            // =====================================

            let bot =
                await Bot.findOne({

                    userId

                });


            // =====================================
            // ساخت ربات در صورت نبودن:: M
            // =====================================

            if (!bot) {

                bot =
                    await Bot.create({

                        userId,

                        status:
                            "ACTIVE",

                        enabled:
                            true,

                        strategy:
                            "AI Scalping",

                        market:
                            "crypto",

                        riskLevel:
                            "LOW",

                        riskPercent:
                            1,

                        maxOpenTrades:
                            1,

                        openTrades:
                            0,

                        maxConsecutiveLosses:
                            2,

                        consecutiveLosses:
                            0,

                        lastSignal:
                            "WAIT",

                        lastRun:
                            new Date(),

                        lastHeartbeat:
                            new Date(),

                        stopReason:
                            ""

                    });

            }


            // =====================================
            // جلوگیری از شروع مجدد بعد از ۲ ضرر:: M
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

                await bot.save();


                user.botActive =
                    false;

                await user.save();


                return res.status(409).json({

                    success: false,

                    message:
                        "Bot is paused. Please reactivate it first.",

                    bot

                });

            }


            // =====================================
            // اگر از قبل فعال است:: M
            // =====================================

            if (

                bot.status ===
                    "ACTIVE" &&

                bot.enabled ===
                    true

            ) {

                return res.status(200).json({

                    success: true,

                    message:
                        "Trading bot is already active",

                    bot

                });

            }


            // =====================================
            // فعال کردن ربات:: M
            // =====================================

            bot.status =
                "ACTIVE";


            bot.enabled =
                true;


            bot.stopReason =
                "";


            bot.lastError =
                "";


            bot.lastRun =
                new Date();


            bot.lastHeartbeat =
                new Date();


            await bot.save();


            // =====================================
            // همگام‌سازی User:: M
            // =====================================

            user.botActive =
                true;


            await user.save();


            return res.status(200).json({

                success: true,

                message:
                    "Trading bot started successfully",

                bot

            });


        } catch (error) {

            console.error(
                "Start Bot Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to start bot"

            });

        }

    }
);


// =====================================
// STOP BOT:: M
// توقف دستی ربات
// POST /api/bot/stop/:userId
// =====================================

router.post(
    "/stop/:userId",
    async (req, res) => {

        try {

            const { userId } =
                req.params;


            // =====================================
            // بررسی شناسه کاربر:: M
            // =====================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    userId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid user ID"

                });

            }


            // =====================================
            // پیدا کردن کاربر:: M
            // =====================================

            const user =
                await User.findById(
                    userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            // =====================================
            // پیدا کردن ربات:: M
            // =====================================

            const bot =
                await Bot.findOne({

                    userId

                });


            if (!bot) {

                user.botActive =
                    false;

                await user.save();


                return res.status(200).json({

                    success: true,

                    message:
                        "Trading bot is already stopped",

                    bot:
                        null

                });

            }


            // =====================================
            // توقف دستی:: M
            // =====================================

            bot.status =
                "STOPPED";


            bot.enabled =
                false;


            bot.stopReason =
                "Stopped by user";


            bot.lastHeartbeat =
                new Date();


            await bot.save();


            // =====================================
            // همگام‌سازی User:: M
            // =====================================

            user.botActive =
                false;


            await user.save();


            return res.status(200).json({

                success: true,

                message:
                    "Trading bot stopped successfully",

                bot

            });


        } catch (error) {

            console.error(
                "Stop Bot Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to stop bot"

            });

        }

    }
);


// =====================================
// REACTIVATE BOT:: M
// فعال‌سازی مجدد بعد از توقف خودکار
// POST /api/bot/reactivate/:userId
// =====================================

router.post(
    "/reactivate/:userId",
    async (req, res) => {

        try {

            const { userId } =
                req.params;


            // =====================================
            // بررسی شناسه کاربر:: M
            // =====================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    userId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid user ID"

                });

            }


            // =====================================
            // پیدا کردن کاربر:: M
            // =====================================

            const user =
                await User.findById(
                    userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            // =====================================
            // بررسی دسترسی کاربر:: M
            // =====================================

            if (

                user.approvalStatus !==
                    "APPROVED" ||

                user.accessEnabled !==
                    true ||

                user.botAccess !==
                    true ||

                user.status !==
                    "ACTIVE"

            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "Your trading access has not been approved yet."

                });

            }


            // =====================================
            // فعال‌سازی مجدد از Trading Engine:: M
            // =====================================

            const bot =
                await reactivateBot({

                    userId

                });


            // =====================================
            // همگام‌سازی User:: M
            // =====================================

            user.botActive =
                true;


            await user.save();


            return res.status(200).json({

                success: true,

                message:
                    "Trading bot reactivated successfully",

                bot

            });


        } catch (error) {

            console.error(
                "Reactivate Bot Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to reactivate bot"

            });

        }

    }
);


// =====================================
// EXPORT ROUTER:: M
// خروجی مسیرهای ربات
// =====================================

export default router;
