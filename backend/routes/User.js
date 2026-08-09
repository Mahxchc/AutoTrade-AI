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

        user.lastLogin = new Date();
        await user.save();

        return res.status(200).json({
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
// CREATE USER / APPLICATION
// POST /api/users
// =====================================

router.post("/", async (req, res) => {
    try {
        const {
            telegramId,
            username,
            firstName,
            lastName,
            phoneNumber
        } = req.body;

        if (
            !telegramId ||
            !firstName ||
            !lastName ||
            !phoneNumber
        ) {
            return res.status(400).json({
                success: false,
                message: "Telegram ID, first name, last name and phone number are required"
            });
        }

        let user = await User.findOne({ telegramId });

        // =====================================
        // Existing User
        // =====================================

        if (user) {
            user.username = username || user.username;
            user.firstName = firstName;
            user.lastName = lastName;
            user.phoneNumber = phoneNumber;
            user.lastLogin = new Date();

            await user.save();

            return res.status(200).json({
                success: true,
                message: "User information updated",
                user
            });
        }

        // =====================================
        // New User
        // =====================================

        user = await User.create({
            telegramId,
            username: username || "",
            firstName,
            lastName,
            phoneNumber,

            accessEnabled: false,
            approvalStatus: "PENDING",

            botAccess: false,
            botActive: false,

            status: "PENDING"
        });

        return res.status(201).json({
            success: true,
            message:
                "Your request has been sent to the owner for approval.",
            user
        });

    } catch (error) {
        console.error("Create User Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to submit application"
        });
    }
});

export default router;
