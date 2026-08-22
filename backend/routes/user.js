// =====================================
// User Routes:: M
// AutoTrade AI
// File: backend/routes/user.js
// =====================================

import express from "express";
import User from "../models/User.js";

const router = express.Router();


// =====================================
// GET USER BY TELEGRAM ID
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

        const user = await User.findOne({
            telegramId: String(telegramId)
        });

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

        console.error(
            "GET USER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to get user"
        });

    }

});


// =====================================
// CREATE / UPDATE USER
// =====================================

router.post("/", async (req, res) => {

    try {

        const {
            telegramId,
            username = "",
            firstName = "",
            lastName = ""
        } = req.body;


        if (!telegramId) {

            return res.status(400).json({
                success: false,
                message: "Telegram ID is required"
            });

        }


        let user = await User.findOne({
            telegramId: String(telegramId)
        });


        // =====================================
        // CREATE NEW USER
        // =====================================

        if (!user) {

            user = await User.create({

                telegramId: String(telegramId),

                username,

                firstName,

                lastName,

                lastLogin: new Date()

            });

        }

        // =====================================
        // UPDATE EXISTING USER
        // =====================================

        else {

            user.username = username;
            user.firstName = firstName;
            user.lastName = lastName;
            user.lastLogin = new Date();

            await user.save();

        }


        return res.status(200).json({

            success: true,

            message: "User authenticated",

            user

        });

    } catch (error) {

        console.error(
            "CREATE / UPDATE USER ERROR:",
            error
        );

        return res.status(500).json({

            success: false,

            message: "Failed to create or update user"

        });

    }

});


export default router;
