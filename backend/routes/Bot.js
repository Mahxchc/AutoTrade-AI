// =====================================
// AutoTrade AI
// Bot Routes
// =====================================

import express from "express";
import mongoose from "mongoose";

import Bot from "../models/Bot.js";
import User from "../models/User.js";

const router = express.Router();

// =====================================
// GET BOT STATUS
// GET /api/bot/:userId
// =====================================

router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const bot = await Bot.findOne({ userId });

        if (!bot) {
            return res.status(200).json({
                success: true,
                bot: {
                    status: "STOPPED",
                    strategy: "AI Scalping",
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
        console.error("Get Bot Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get bot status"
        });
    }
});

// =====================================
// START BOT
// POST /api/bot/start/:userId
// =====================================

router.post("/start/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // =====================================
        // Approval Check
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

        const bot = await Bot.findOneAndUpdate(
            { userId },
            {
                $set: {
                    status: "ACTIVE",
                    lastRun: new Date()
                }
            },
            {
                new: true,
                upsert: true
            }
        );

        user.botActive = true;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Trading bot started successfully",
            bot
        });

    } catch (error) {
        console.error("Start Bot Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to start bot"
        });
    }
});

// =====================================
// STOP BOT
// POST /api/bot/stop/:userId
// =====================================

router.post("/stop/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const bot = await Bot.findOneAndUpdate(
            { userId },
            {
                $set: {
                    status: "STOPPED"
                }
            },
            {
                new: true
            }
        );

        user.botActive = false;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Trading bot stopped successfully",
            bot
        });

    } catch (error) {
        console.error("Stop Bot Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to stop bot"
        });
    }
});

export default router;
