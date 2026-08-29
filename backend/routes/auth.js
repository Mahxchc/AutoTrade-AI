// =====================================
// ..M AutoTrade AI
// Auth Routes
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
// Helper :: M
// Safe User Response
// =====================================

function userResponse(user) {

    return {

        id:
            user._id,

        telegramId:
            user.telegramId,

        username:
            user.username || "",

        firstName:
            user.firstName || "",

        lastName:
            user.lastName || "",

        phoneNumber:
            user.phoneNumber || "",

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
            user.botActive,

        walletId:
            user.walletId || null,

        createdAt:
            user.createdAt,

        updatedAt:
            user.updatedAt,

        lastLogin:
            user.lastLogin

    };

}


// =====================================
// Telegram Login :: M
// ورود از طریق Telegram Mini App
// =====================================

router.post(
    "/telegram",
    requireTelegramUser,
    async (req, res, next) => {

        try {

            // =================================
            // Telegram User :: M
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
                        "کاربر Telegram پیدا نشد"

                });

            }


            // =================================
            // Telegram ID :: M
            // =================================

            const telegramId =
                String(
                    telegramUser.id
                );


            // =================================
            // Find Existing User :: M
            // =================================

            let user =
                await User.findOne({

                    telegramId

                });


            // =================================
            // Create New User :: M
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

                        phoneNumber:
                            "",

                        accessEnabled:
                            false,

                        approvalStatus:
                            "PENDING",

                        isAdmin:
                            false,

                        botAccess:
                            false,

                        botActive:
                            false,

                        status:
                            "PENDING",

                        lastLogin:
                            new Date()

                    });

            }

            // =================================
            // Update Existing User :: M
            // =================================

            else {

                // ---------------------------------
                // Telegram Username
                // ---------------------------------

                if (
                    telegramUser.username
                ) {

                    user.username =
                        telegramUser.username;

                }


                // ---------------------------------
                // First Name
                // ---------------------------------

                if (
                    telegramUser.first_name
                ) {

                    user.firstName =
                        telegramUser.first_name;

                }


                // ---------------------------------
                // Last Name
                // ---------------------------------

                if (
                    telegramUser.last_name
                ) {

                    user.lastName =
                        telegramUser.last_name;

                }


                // ---------------------------------
                // Last Login
                // ---------------------------------

                user.lastLogin =
                    new Date();


                // ---------------------------------
                // IMPORTANT SECURITY RULE
                // ---------------------------------
                //
                // ورود مجدد کاربر نباید
                // accessEnabled را خودکار فعال کند.
                //
                // ---------------------------------

                await user.save();

            }


            // =================================
            // Attach User To Request :: M
            // =================================

            req.user =
                user;


            // =================================
            // Response :: M
            // =================================

            return res.json({

                success:
                    true,

                authenticated:
                    true,

                message:
                    "احراز هویت Telegram با موفقیت انجام شد",

                user:
                    userResponse(
                        user
                    )

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
// Current User :: M
// کاربر فعلی
// =====================================

router.get(
    "/me",
    requireTelegramUser,
    async (req, res, next) => {

        try {

            // =================================
            // Telegram User :: M
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
                        "کاربر Telegram پیدا نشد"

                });

            }


            // =================================
            // Find User :: M
            // =================================

            const user =
                await User.findOne({

                    telegramId:
                        String(
                            telegramUser.id
                        )

                });


            // =================================
            // User Not Found :: M
            // =================================

            if (!user) {

                return res.status(404).json({

                    success: false,

                    authenticated: false,

                    message:
                        "حساب کاربری پیدا نشد"

                });

            }


            // =================================
            // Update Last Login :: M
            // =================================

            user.lastLogin =
                new Date();


            // =================================
            // Sync Telegram Information :: M
            // =================================

            if (
                telegramUser.username
            ) {

                user.username =
                    telegramUser.username;

            }


            if (
                telegramUser.first_name
            ) {

                user.firstName =
                    telegramUser.first_name;

            }


            if (
                telegramUser.last_name
            ) {

                user.lastName =
                    telegramUser.last_name;

            }


            await user.save();


            // =================================
            // Attach User :: M
            // =================================

            req.user =
                user;


            // =================================
            // Response :: M
            // =================================

            return res.json({

                success:
                    true,

                authenticated:
                    true,

                user:
                    userResponse(
                        user
                    )

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
// Export Router :: M
// =====================================

export default router;