// ..M Bot Routes
// AutoTrade AI
// مسیرهای کنترل ربات
// File: backend/routes/Bot.js

import express from "express";
import mongoose from "mongoose";

import Bot from "../models/Bot.js";
import User from "../models/User.js";

import {
    reactivateBot
} from "../engine/tradingEngine.js";


const router =
    express.Router();


// =========================================================
// ..M RESOLVE USER
// پیدا کردن کاربر با Mongo ID یا Telegram ID
// =========================================================

async function resolveUser(
    identifier
) {

    if (!identifier) {
        return null;
    }


    // -----------------------------------------------------
    // Mongo ObjectId
    // -----------------------------------------------------

    if (
        mongoose.Types.ObjectId.isValid(
            identifier
        )
    ) {

        const user =
            await User.findById(
                identifier
            );

        if (user) {
            return user;
        }

    }


    // -----------------------------------------------------
    // Telegram ID
    // -----------------------------------------------------

    const telegramUser =
        await User.findOne({

            telegramId:
                String(identifier)

        });


    return telegramUser || null;

}


// =========================================================
// ..M DEFAULT BOT
// وضعیت پیش‌فرض ربات
// =========================================================

function defaultBot(
    userId
) {

    return {

        userId,

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

    };

}


// =========================================================
// ..M GET BOT STATUS
// GET /bot/:userId
// =========================================================

router.get(
    "/:userId",
    async (
        req,
        res
    ) => {

        try {

            const identifier =
                req.params.userId;


            const user =
                await resolveUser(
                    identifier
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            const bot =
                await Bot.findOne({

                    userId:
                        user._id

                });


            if (!bot) {

                return res.status(200).json({

                    success: true,

                    bot:
                        defaultBot(
                            user._id
                        )

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
// POST /bot/start/:userId
// =========================================================

router.post(
    "/start/:userId",
    async (
        req,
        res
    ) => {

        try {

            const identifier =
                req.params.userId;


            const user =
                await resolveUser(
                    identifier
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            // -------------------------------------------------
            // ..M ACCESS CONTROL
            // -------------------------------------------------

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


            // -------------------------------------------------
            // ..M FIND BOT
            // -------------------------------------------------

            let bot =
                await Bot.findOne({

                    userId:
                        user._id

                });


            // -------------------------------------------------
            // ..M CREATE BOT
            // -------------------------------------------------

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

                        lastRun:
                            new Date(),

                        lastHeartbeat:
                            new Date(),

                        stopReason:
                            "",

                        lastError:
                            ""

                    });

            }


            // -------------------------------------------------
            // ..M MAX LOSSES
            // -------------------------------------------------

            if (

                Number(
                    bot.consecutiveLosses || 0
                ) >=
                Number(
                    bot.maxConsecutiveLosses || 2
                )

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


            // -------------------------------------------------
            // ..M ALREADY ACTIVE
            // -------------------------------------------------

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


            // -------------------------------------------------
            // ..M ACTIVATE
            // -------------------------------------------------

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


            // -------------------------------------------------
            // ..M SYNC USER
            // -------------------------------------------------

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


// =========================================================
// ..M STOP BOT
// POST /bot/stop/:userId
// =========================================================

router.post(
    "/stop/:userId",
    async (
        req,
        res
    ) => {

        try {

            const identifier =
                req.params.userId;


            const user =
                await resolveUser(
                    identifier
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            const bot =
                await Bot.findOne({

                    userId:
                        user._id

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


            // -------------------------------------------------
            // ..M STOP
            // -------------------------------------------------

            bot.status =
                "STOPPED";

            bot.enabled =
                false;

            bot.stopReason =
                "Stopped by user";

            bot.lastHeartbeat =
                new Date();


            await bot.save();


            // -------------------------------------------------
            // ..M SYNC USER
            // -------------------------------------------------

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


// =========================================================
// ..M REACTIVATE BOT
// POST /bot/reactivate/:userId
// =========================================================

router.post(
    "/reactivate/:userId",
    async (
        req,
        res
    ) => {

        try {

            const identifier =
                req.params.userId;


            const user =
                await resolveUser(
                    identifier
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            // -------------------------------------------------
            // ..M ACCESS CONTROL
            // -------------------------------------------------

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


            // -------------------------------------------------
            // ..M REACTIVATE
            // -------------------------------------------------

            const bot =
                await reactivateBot({

                    userId:
                        user._id

                });


            // -------------------------------------------------
            // ..M SYNC USER
            // -------------------------------------------------

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


// =========================================================
// ..M EXPORT
// =========================================================

export default router;
