// =====================================
// ..M AutoTrade AI
// Authentication Routes
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
// Admin Check :: M
// بررسی سازنده
// =====================================

function isAdminTelegramUser(
    telegramId
) {

    const adminTelegramId =
        String(
            process.env.ADMIN_TELEGRAM_ID || ""
        ).trim();


    if (!adminTelegramId) {

        return false;

    }


    return (
        String(telegramId) ===
        adminTelegramId
    );

}


// =====================================
// Build User Response :: M
// ساخت اطلاعات کاربر برای Frontend
// =====================================

function buildUserResponse(
    user
) {

    return {

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

        phoneNumber:
            user.phoneNumber,

        accessEnabled:
            user.accessEnabled,

        approvalStatus:
            user.approvalStatus,

        isAdmin:
            user.isAdmin,

        botAccess:
            user.botAccess,

        botActive:
            user.botActive,

        status:
            user.status,

        walletId:
            user.walletId,

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
// ورود و ثبت کاربر
// =====================================

router.post(
    "/telegram",
    requireTelegramUser,
    async (
        req,
        res,
        next
    ) => {

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

                    success:
                        false,

                    authenticated:
                        false,

                    message:
                        "اطلاعات کاربر تلگرام پیدا نشد"

                });

            }


            const telegramId =
                String(
                    telegramUser.id
                );


            // =================================
            // Check Admin
            // =================================

            const adminUser =
                isAdminTelegramUser(
                    telegramId
                );


            // =================================
            // Find Existing User
            // =================================

            let user =
                await User.findOne({

                    telegramId

                });


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

                        phoneNumber:
                            "",

                        // -------------------------
                        // سازنده بدون تأیید
                        // -------------------------

                        accessEnabled:
                            adminUser,

                        approvalStatus:
                            adminUser
                                ? "APPROVED"
                                : "PENDING",

                        isAdmin:
                            adminUser,

                        botAccess:
                            adminUser,

                        botActive:
                            false,

                        status:
                            adminUser
                                ? "ACTIVE"
                                : "PENDING",

                        lastLogin:
                            new Date()

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


                user.lastLogin =
                    new Date();


                // =================================
                // Admin Protection :: M
                // سازنده همیشه دسترسی دارد
                // =================================

                if (adminUser) {

                    user.isAdmin =
                        true;

                    user.accessEnabled =
                        true;

                    user.approvalStatus =
                        "APPROVED";

                    user.status =
                        "ACTIVE";

                }


                await user.save();

            }


            // =================================
            // Attach User
            // =================================

            req.user =
                user;


            // =================================
            // Access Information
            // =================================

            const accessGranted =
                user.isAdmin === true ||
                user.accessEnabled === true ||
                user.botAccess === true ||
                user.approvalStatus === "APPROVED" ||
                user.status === "ACTIVE";


            // =================================
            // Response
            // =================================

            return res.json({

                success:
                    true,

                authenticated:
                    true,

                approved:
                    accessGranted,

                isAdmin:
                    user.isAdmin === true,

                message:
                    accessGranted
                        ? "ورود با موفقیت انجام شد"
                        : "حساب شما ثبت شد و منتظر تأیید مدیریت است",

                user:
                    buildUserResponse(
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
    async (
        req,
        res,
        next
    ) => {

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

                    success:
                        false,

                    authenticated:
                        false,

                    message:
                        "کاربر تلگرام پیدا نشد"

                });

            }


            const telegramId =
                String(
                    telegramUser.id
                );


            // =================================
            // Find User
            // =================================

            const user =
                await User.findOne({

                    telegramId

                });


            // =================================
            // User Not Found
            // =================================

            if (!user) {

                return res.status(404).json({

                    success:
                        false,

                    authenticated:
                        true,

                    message:
                        "حساب کاربری پیدا نشد"

                });

            }


            // =================================
            // Admin Check
            // =================================

            const adminUser =
                isAdminTelegramUser(
                    telegramId
                );


            // =================================
            // Admin Protection :: M
            // =================================

            if (adminUser) {

                let changed =
                    false;


                if (
                    user.isAdmin !== true
                ) {

                    user.isAdmin =
                        true;

                    changed =
                        true;

                }


                if (
                    user.accessEnabled !== true
                ) {

                    user.accessEnabled =
                        true;

                    changed =
                        true;

                }


                if (
                    user.approvalStatus !==
                    "APPROVED"
                ) {

                    user.approvalStatus =
                        "APPROVED";

                    changed =
                        true;

                }


                if (
                    user.status !==
                    "ACTIVE"
                ) {

                    user.status =
                        "ACTIVE";

                    changed =
                        true;

                }


                if (
                    changed
                ) {

                    await user.save();

                }

            }


            // =================================
            // Update Last Login
            // =================================

            user.lastLogin =
                new Date();


            await user.save();


            // =================================
            // Access
            // =================================

            const accessGranted =
                user.isAdmin === true ||
                user.accessEnabled === true ||
                user.botAccess === true ||
                user.approvalStatus === "APPROVED" ||
                user.status === "ACTIVE";


            // =================================
            // Response
            // =================================

            return res.json({

                success:
                    true,

                authenticated:
                    true,

                approved:
                    accessGranted,

                isAdmin:
                    user.isAdmin === true,

                user:
                    buildUserResponse(
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