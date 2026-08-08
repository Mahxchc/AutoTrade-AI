// =====================================
// AutoTrade AI
// User Routes
// =====================================

import express from "express";
import User from "../models/User.js";

const router = express.Router();

// =====================================
// GET USER
// GET /api/users/:telegramId
// =====================================

router.get("/:telegramId", async (req, res) => {
    try {
        const { telegramId } = req.params;

        if (!telegramId) {
            return res.status(400).json({
                success: false,
                message: "Telegram ID is required"
            });
        }

        const user = await User.findOne({ telegramId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Get User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get user"
        });
    }
});

// =====================================
// CREATE USER
// POST /api/users
// =====================================

router.post("/", async (req, res) => {
    try {
        const {
            telegramId,
            username,
            firstName
        } = req.body;

        if (!telegramId) {
            return res.status(400).json({
                success: false,
                message: "Telegram ID is required"
            });
        }

        const existingUser = await User.findOne({ telegramId });

        if (existingUser) {
            return res.status(200).json({
                success: true,
                message: "User already exists",
                user: existingUser
            });
        }

        const user = await User.create({
            telegramId,
            username: username || "",
            firstName: firstName || ""
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user
        });
    } catch (error) {
        console.error("Create User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create user"
        });
    }
});

export default router;
