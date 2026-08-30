// =====================================
// ..M User Routes
// AutoTrade AI
// File: backend/routes/user.js
// =====================================

import express from "express";

import User from "../models/User.js";

import {
    requireTelegramUser
} from "../middleware/auth.js";


const router =
    express.Router();


// =====================================
// GET CURRENT USER :: M
// GET /api/users/me
// =====================================

router.get(
    "/me",
    requireTelegramUser,
    async (req, res) => {

        try {

            const telegramId =
                String(
                    req.telegramUser.id
                );


            const user =
                await User.findOne({

                    telegramId

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

                user

            });

        }

        catch (error) {

            console.error(
                "[GET CURRENT USER ERROR]",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to get current user"

            });

        }

    }
);


// =====================================
// GET USER BY TELEGRAM ID :: M
// GET /api/users/:telegramId
// =====================================

router.get(
    "/:telegramId",
    requireTelegramUser,
    async (req, res) => {

        try {

            const requestedTelegramId =
                String(
                    req.params.telegramId
                );


            const authenticatedTelegramId =
                String(
                    req.telegramUser.id
                );


            // =================================
            // Security Check
            // =================================

            if (
                requestedTelegramId !==
                authenticatedTelegramId
            ) {

                return res.status(403).json({

                    success: false,

                    authenticated: true,

                    message:
                        "You can only access your own account"

                });

            }


            const user =
                await User.findOne({

                    telegramId:
                        authenticatedTelegramId

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

                user

            });

        }

        catch (error) {

            console.error(
                "[GET USER ERROR]",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to get user"

            });

        }

    }
);


// =====================================
// CREATE / UPDATE CURRENT USER :: M
// POST /api/users
// =====================================

router.post(
    "/",
    requireTelegramUser,
    async (req, res) => {

        try {

            // =================================
            // Telegram Identity
            // =================================

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
                        "Telegram user not found"

                });

            }


            const telegramId =
                String(
                    telegramUser.id
                );


            // =================================
            // Find User
            // =================================

            let user =
                await User.findOne({

                    telegramId

                });


            // =================================
            // Admin Detection
            // =================================

            const adminTelegramId =
                process.env.ADMIN_TELEGRAM_ID;


            const isAdmin =
                Boolean(
                    adminTelegramId &&
                    String(
                        adminTelegramId
                    ) ===
                    telegramId
                );


            // =================================
            // Create New User
            // =================================

            if (!user) {

                user =
                    await User.create({

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
                            isAdmin,

                        approvalStatus:
                            isAdmin
                                ? "APPROVED"
                                : "PENDING",

                        isAdmin,

                        botAccess:
                            isAdmin,

                        botActive:
                            false,

                        status:
                            isAdmin
                                ? "ACTIVE"
                                : "PENDING",

                        lastLogin:
                            new Date()

                    });

            }

            // =================================
            // Update Existing User
            // =================================

            else {

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


                user.lastLogin =
                    new Date();


                // =================================
                // Admin Protection
                // =================================

                if (isAdmin) {

                    user.isAdmin =
                        true;

                    user.accessEnabled =
                        true;

                    user.approvalStatus =
                        "APPROVED";

                    user.botAccess =
                        true;

                    user.status =
                        "ACTIVE";

                }


                await user.save();

            }


            // =================================
            // Response
            // =================================

            return res.status(200).json({

                success: true,

                authenticated: true,

                message:
                    "User authenticated",

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

                    approvalStatus:
                        user.approvalStatus,

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
                "[CREATE / UPDATE USER ERROR]",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Failed to create or update user"

            });

        }

    }
);


// =====================================
// Export Router :: M
// =====================================

export default router;