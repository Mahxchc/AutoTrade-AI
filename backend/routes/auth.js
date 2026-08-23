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


const router =
    express.Router();


// =====================================
// Telegram Login
// =====================================

router.post(
    "/telegram",
    requireTelegramUser,
    async (req, res, next) => {

        try {

            // =================================
            // Telegram User From Middleware
            // =================================

            const telegramUser =
                req.telegramUser;


            if (
                !telegramUser ||
                !telegramUser.id
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Telegram user not found"

                });

            }


            const telegramId =
                String(
                    telegramUser.id
                );


            // =================================
            // Find Existing User
            // =================================

            let user =
                await User.findOne({

                    telegramId:
                        telegramId

                });


            // =================================
            // Create User If Not Exists
            // =================================

            if (!user) {

                user =
                    await User.create({

                        telegramId:
                            telegramId,

                        username:
                            telegramUser.username ||
                            "",

                        firstName:
                            telegramUser.first_name ||
                            "",

                        lastName:
                            telegramUser.last_name ||
                            "",

                        accessEnabled:
                            false,

                        isAdmin:
                            false,

                        botAccess:
                            false,

                        botActive:
                            false,

                        status:
                            "PENDING"

                    });

            }

            else {

                // =================================
                // Update Telegram Information
                // =================================

                user.username =
                    telegramUser.username ||
                    user.username ||
                    "";

                user.firstName =
                    telegramUser.first_name ||
                    user.firstName ||
                    "";

                user.lastName =
                    telegramUser.last_name ||
                    user.lastName ||
                    "";


                await user.save();

            }


            // =================================
            // Attach User To Request
            // =================================

            req.user =
                user;


            // =================================
            // Response
            // =================================

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

            // =================================
            // Telegram User
            // =================================

            const telegramUser =
                req.telegramUser;


            if (
                !telegramUser ||
                !telegramUser.id
            ) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Telegram user not found"

                });

            }


            // =================================
            // Find User
            // =================================

            const user =
                await User.findOne({

                    telegramId:
                        String(
                            telegramUser.id
                        )

                });


            // =================================
            // User Not Found
            // =================================

            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User account not found"

                });

            }


            // =================================
            // Attach User
            // =================================

            req.user =
                user;


            // =================================
            // Response
            // =================================

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


// =====================================
// Export Router
// =====================================

export default router;