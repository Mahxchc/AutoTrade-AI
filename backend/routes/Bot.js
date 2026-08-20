// ..M Bot.js
// AutoTrade AI
// مسیرهای کنترل ربات

import express from "express";
import mongoose from "mongoose";

import Bot from "../models/Bot.js";
import User from "../models/User.js";

import {
    reactivateBot
} from "../engine/tradingEngine.js";

const router = express.Router();


// =========================================================
// ..M FIND USER
// پیدا کردن کاربر با MongoDB ID یا Telegram ID
// =========================================================

async function findUser(identifier) {

    if (!identifier) {
        return null;
    }

    // اگر MongoDB ObjectId باشد
    if (
        mongoose.Types.ObjectId.isValid(identifier) &&
        String(new mongoose.Types.ObjectId(identifier)) ===
        String(identifier)
    ) {

        return await User.findById(identifier);
    }

    // در غیر این صورت Telegram ID
    return await User.findOne({
        telegramId: String(identifier)
    });
}


// =========================================================
// ..M GET BOT STATUS
// دریافت وضعیت ربات
// GET /bot/:userId
// =========================================================

router.get(
    "/:userId",
    async (req, res) => {

        try {

            const {
                userId
            } = req.params;


            const user =
                await findUser(userId);


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            const bot =
                await Bot.findOne({
                    userId: user._id
                });


            // اگر ربات هنوز ساخته نشده
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

    }
);


// =========================================================
// ..M START BOT
// شروع ربات
// POST /bot/start/:userId
// =========================================================

router.post(
    "/start/:userId",
    async (req, res) => {

        try {

            const {
                userId
            } = req.params;


            const user =
                await findUser(userId);


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            // =====================================================
            // ..M ACCESS CHECK
            // =====================================================

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


            // =====================================================
            // ..M FIND BOT
            // =====================================================

            let bot =
                await Bot.findOne({
                    userId: user._id
                });


            // =====================================================
            // ..M CREATE BOT
            // =====================================================

            if (!bot) {

                bot =
                    await Bot.create({

                        userId:
                            user._id,

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

                        accuracy:
                            0,

                        confidence:
                            0,

                        lastRun:
                            new Date(),

                        lastHeartbeat:
                            new Date(),

                        stopReason:
                            ""

                    });

            }


            // =====================================================
            // ..M LOSS PROTECTION
            // =====================================================

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


            // =====================================================
            // ..M ALREADY ACTIVE
            // =====================================================

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


            // =====================================================
            // ..M ACTIVATE BOT
            // =====================================================

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


            // =====================================================
            // ..M SYNC USER
            // =====================================================

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
                    error.message ||
                    "Failed to start bot"

            });

        }

    }
);


// =========================================================
// ..M STOP BOT
// توقف ربات
// POST /bot/stop/:userId
// =========================================================

router.post(
    "/stop/:userId",
    async (req, res) => {

        try {

            const {
                userId
            } = req.params;


            const user =
                await findUser(userId);


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            const bot =
                await Bot.findOne({
                    userId: user._id
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


            bot.status =
                "STOPPED";

            bot.enabled =
                false;

            bot.stopReason =
                "Stopped by user";

            bot.lastHeartbeat =
                new Date();


            await bot.save();


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
                    error.message ||
                    "Failed to stop bot"

            });

        }

    }
);


// =========================================================
// ..M REACTIVATE BOT
// فعال‌سازی مجدد
// POST /bot/reactivate/:userId
// =========================================================

router.post(
    "/reactivate/:userId",
    async (req, res) => {

        try {

            const {
                userId
            } = req.params;


            const user =
                await findUser(userId);


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


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


            const bot =
                await reactivateBot({

                    userId:
                        user._id

                });


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
                    error.message ||
                    "Failed to reactivate bot"

            });

        }

    }
);


// =========================================================
// ..M EXPORT
// =========================================================

export default router;