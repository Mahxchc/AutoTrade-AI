// =====================================
// Auth Routes :: M
// AutoTrade AI
// Telegram Authentication
// File: backend/routes/auth.js
// =====================================

import express from "express";

import {
    requireTelegramUser
} from "../middleware/auth.js";

import User from "../models/User.js";


const router = express.Router();


// =====================================
// Telegram Login
// =====================================

router.post(
    "/telegram",
    requireTelegramUser,
    async (req, res, next) => {

        try {

            // Telegram user
            const telegramUser =
                req.telegramUser;


            if (
                !telegramUser ||
                !telegramUser.id
            ) {

                return res.status(401).json({

                    success: false,

                    authenticated: false,

                    message:
                        "Telegram user information is missing"

                });

            }


            // =====================================
            // Find Database User
            // =====================================

            const user =
                await User.findOne({

                    telegramId:
                        String(
                            telegramUser.id
                        )

                });


            // =====================================
            // User Not Found
            // =====================================

            if (!user) {

                return res.status(404).json({

                    success: false,

                    authenticated: true,

                    message:
                        "Telegram user is authenticated but not registered"

                });

            }


            // =====================================
            // Save Database User In Request
            // =====================================

            req.user =
                user;


            // =====================================
            // Success
            // =====================================

            return res.json({

                success: true,

                authenticated: true,

                message:
                    "Telegram authentication successful",

                user: {

                    id:
                        user._id,

                    telegramId:
                        user.telegramId,

                    username:
                        user.username,

                    firstName:
                        user.firstName,

                    lastName:
                        user.lastName,

                    status:
                        user.status,

                    accessEnabled:
                        user.accessEnabled,

                    isAdmin:
                        user.isAdmin,

                    botAccess:
                        user.botAccess,

                    botActive:
                        user.botActive

                }

            });

        }

        catch (error) {

            console.error(
                "[AUTH TELEGRAM ERROR]",
                error
            );

            next(error);

        }

    }
);


// =====================================
// Current Authenticated User
// =====================================

router.get(
    "/me",
    requireTelegramUser,
    async (req, res, next) => {

        try {

            const telegramUser =
                req.telegramUser;


            if (
                !telegramUser ||
                !telegramUser.id
            ) {

                return res.status(401).json({

                    success: false,

                    authenticated: false,

                    message:
                        "Telegram user information is missing"

                });

            }


            // =====================================
            // Find Database User
            // =====================================

            const user =
                await User.findOne({

                    telegramId:
                        String(
                            telegramUser.id
                        )

                });


            if (!user) {

                return res.status(404).json({

                    success: false,

                    authenticated: true,

                    message:
                        "User not found"

                });

            }


            return res.json({

                success: true,

                authenticated: true,

                user: {

                    id:
                        user._id,

                    telegramId:
                        user.telegramId,

                    username:
                        user.username,

                    firstName:
                        user.firstName,

                    lastName:
                        user.lastName,

                    status:
                        user.status,

                    accessEnabled:
                        user.accessEnabled,

                    isAdmin:
                        user.isAdmin,

                    botAccess:
                        user.botAccess,

                    botActive:
                        user.botActive

                }

            });

        }

        catch (error) {

            console.error(
                "[AUTH ME ERROR]",
                error
            );

            next(error);

        }

    }
);


export default router;