// =====================================
// ..M Bot Routes
// AutoTrade AI
// مسیرهای کنترل ربات
// File: backend/routes/bot.js
// =====================================

import express from "express";
import mongoose from "mongoose";

import Bot from "../models/Bot.js";
import User from "../models/User.js";

import {
    requireTelegramUser
} from "../middleware/auth.js";

import {
    reactivateBot
} from "../engine/tradingEngine.js";


const router =
    express.Router();


// =========================================================
// ..M TELEGRAM USER CHECK
// =========================================================

function getAuthenticatedTelegramId(
    req
) {

    if (
        !req.telegramUser ||
        !req.telegramUser.id
    ) {

        return null;

    }


    return String(
        req.telegramUser.id
    );

}


// =========================================================
// ..M RESOLVE CURRENT USER
// فقط کاربر احراز‌شده Telegram
// =========================================================

async function resolveCurrentUser(
    req
) {

    const telegramId =
        getAuthenticatedTelegramId(
            req
        );


    if (!telegramId) {

        return null;

    }


    return await User.findOne({

        telegramId

    });

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
// ..M ACCESS CHECK
// بررسی دسترسی معامله
// =========================================================

function hasTradingAccess(
    user
) {

    if (!user) {

        return false;

    }


    if (
        String(user.status)
            .toUpperCase() ===
        "BLOCKED"
    ) {

        return false;

    }


    return (

        user.approvalStatus ===
            "APPROVED" &&

        user.accessEnabled ===
            true &&

        user.botAccess ===
            true &&

        String(user.status)
            .toUpperCase() ===
            "ACTIVE"

    );

}


// =========================================================
// ..M GET BOT STATUS
// GET /api/bot
// =========================================================

router.get(
    "/",
    requireTelegramUser,
    async (
        req,
        res
    ) => {

        try {

            const user =
                await resolveCurrentUser(
                    req
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    authenticated: true,

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

        }

        catch (error) {

            console.error(
                "[GET BOT STATUS ERROR]",
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
// ..M GET BOT BY USER ID
// GET /api/bot/:userId
//
// userId فقط باید متعلق به Telegram فعلی باشد.
// =========================================================

router.get(
    "/:userId",
    requireTelegramUser,
    async (
        req,
        res
    ) => {

        try {

            const user =
                await resolveCurrentUser(
                    req
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    authenticated: true,

                    message:
                        "User not found"

                });

            }


            // =========================================
            // Security Check
            // =========================================

            const requestedId =
                String(
                    req.params.userId
                );


            const ownMongoId =
                String(
                    user._id
                );


            const ownTelegramId =
                String(
                    user.telegramId
                );


            if (
                requestedId !==
                    ownMongoId &&
                requestedId !==
                    ownTelegramId
            ) {

                return res.status(403).json({

                    success: false,

                    authenticated: true,

                    message:
                        "You can only access your own bot"

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

        }

        catch (error) {

            console.error(
                "[GET BOT ERROR]",
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
// POST /api/bot/start/:userId
// =========================================================

router.post(
    "/start/:userId",
    requireTelegramUser,
    async (
        req,
        res
    ) => {

        try {

            const user =
                await resolveCurrentUser(
                    req
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    authenticated: true,

                    message:
                        "User not found"

                });

            }


            // =========================================
            // Security Check
            // =========================================

            const requestedId =
                String(
                    req.params.userId
                );


            const ownMongoId =
                String(
                    user._id
                );


            const ownTelegramId =
                String(
                    user.telegramId
                );


            if (
                requestedId !==
                    ownMongoId &&
                requestedId !==
                    ownTelegramId
            ) {

                return res.status(403).json({

                    success: false,

                    authenticated: true,

                    message:
                        "You can only control your own bot"

                });

            }


            // =========================================
            // Access Control
            // =========================================

            if (
                !hasTradingAccess(
                    user
                )
            ) {

                return res.status(403).json({

                    success: false,

                    authenticated: true,

                    approved: false,

                    message:
                        "Your trading access has not been approved yet."

                });

            }


            // =========================================
            // Find Bot
            // =========================================

            let bot =
                await Bot.findOne({

                    userId:
                        user._id

                });


            // =========================================
            // Create Bot
            // =========================================

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
                            "",

                        lastError:
                            ""

                    });

            }


            // =========================================
            // Maximum Consecutive Losses
            // =========================================

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


            // =========================================
            // Already Active
            // =========================================

            if (

                bot.status ===
                    "ACTIVE" &&

                bot.enabled ===
                    true

            ) {

                user.botActive =
                    true;

                await user.save();


                return res.status(200).json({

                    success: true,

                    message:
                        "Trading bot is already active",

                    bot

                });

            }


            // =========================================
            // Activate
            // =========================================

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


            // =========================================
            // Sync User
            // =========================================

            user.botActive =
                true;


            await user.save();


            return res.status(200).json({

                success: true,

                message:
                    "Trading bot started successfully",

                bot

            });

        }

        catch (error) {

            console.error(
                "[START BOT ERROR]",
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
// POST /api/bot/stop/:userId
// =========================================================

router.post(
    "/stop/:userId",
    requireTelegramUser,
    async (
        req,
        res
    ) => {

        try {

            const user =
                await resolveCurrentUser(
                    req
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    authenticated: true,

                    message:
                        "User not found"

                });

            }


            // =========================================
            // Security Check
            // =========================================

            const requestedId =
                String(
                    req.params.userId
                );


            const ownMongoId =
                String(
                    user._id
                );


            const ownTelegramId =
                String(
                    user.telegramId
                );


            if (
                requestedId !==
                    ownMongoId &&
                requestedId !==
                    ownTelegramId
            ) {

                return res.status(403).json({

                    success: false,

                    authenticated: true,

                    message:
                        "You can only control your own bot"

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


            // =========================================
            // Stop
            // =========================================

            bot.status =
                "STOPPED";

            bot.enabled =
                false;

            bot.stopReason =
                "Stopped by user";

            bot.lastHeartbeat =
                new Date();


            await bot.save();


            // =========================================
            // Sync User
            // =========================================

            user.botActive =
                false;


            await user.save();


            return res.status(200).json({

                success: true,

                message:
                    "Trading bot stopped successfully",

                bot

            });

        }

        catch (error) {

            console.error(
                "[STOP BOT ERROR]",
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
// POST /api/bot/reactivate/:userId
// =========================================================

router.post(
    "/reactivate/:userId",
    requireTelegramUser,
    async (
        req,
        res
    ) => {

        try {

            const user =
                await resolveCurrentUser(
                    req
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    authenticated: true,

                    message:
                        "User not found"

                });

            }


            // =========================================
            // Security Check
            // =========================================

            const requestedId =
                String(
                    req.params.userId
                );


            const ownMongoId =
                String(
                    user._id
                );


            const ownTelegramId =
                String(
                    user.telegramId
                );


            if (
                requestedId !==
                    ownMongoId &&
                requestedId !==
                    ownTelegramId
            ) {

                return res.status(403).json({

                    success: false,

                    authenticated: true,

                    message:
                        "You can only control your own bot"

                });

            }


            // =========================================
            // Access Control
            // =========================================

            if (
                !hasTradingAccess(
                    user
                )
            ) {

                return res.status(403).json({

                    success: false,

                    authenticated: true,

                    approved: false,

                    message:
                        "Your trading access has not been approved yet."

                });

            }


            // =========================================
            // Reactivate
            // =========================================

            const bot =
                await reactivateBot({

                    userId:
                        user._id

                });


            // =========================================
            // Sync User
            // =========================================

            user.botActive =
                true;


            await user.save();


            return res.status(200).json({

                success: true,

                message:
                    "Trading bot reactivated successfully",

                bot

            });

        }

        catch (error) {

            console.error(
                "[REACTIVATE BOT ERROR]",
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