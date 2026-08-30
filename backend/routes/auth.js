// =====================================
// ..M AutoTrade AI
// Telegram Authentication Routes
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
// Admin Telegram ID :: M
// =====================================

function getAdminTelegramId() {

    return String(
        process.env.ADMIN_TELEGRAM_ID || ""
    ).trim();

}


// =====================================
// Check Admin :: M
// =====================================

function isTelegramAdmin(
    telegramUser
) {

    if (
        !telegramUser ||
        !telegramUser.id
    ) {

        return false;

    }


    const adminId =
        getAdminTelegramId();


    if (!adminId) {

        return false;

    }


    return (
        String(
            telegramUser.id
        ) === adminId
    );

}


// =====================================
// Build User Response :: M
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
            user.username || "",

        firstName:
            user.firstName || "",

        lastName:
            user.lastName || "",

        phoneNumber:
            user.phoneNumber || "",

        accessEnabled:
            user.accessEnabled === true,

        approvalStatus:
            user.approvalStatus || "PENDING",

        isAdmin:
            user.isAdmin === true,

        botAccess:
            user.botAccess === true,

        botActive:
            user.botActive === true,

        status:
            user.status || "PENDING",

        lastLogin:
            user.lastLogin || null,

        createdAt:
            user.createdAt || null,

        updatedAt:
            user.updatedAt || null

    };

}


// =====================================
// Telegram Login
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

                    success: false,

                    authenticated: false,

                    message:
                        "Telegram user not found"

                });

            }


            // =================================
            // Telegram ID
            // =================================

            const telegramId =
                String(
                    telegramUser.id
                );


            // =================================
            // Admin Check
            // =================================

            const admin =
                isTelegramAdmin(
                    telegramUser
                );


            // =================================
            // Find User
            // =================================

            let user =
                await User.findOne({

                    telegramId:
                        telegramId

                });


            // =================================
            // Create New User
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

                        phoneNumber:
                            "",

                        // =========================
                        // Admin / User Access
                        // =========================

                        accessEnabled:
                            admin,

                        approvalStatus:
                            admin
                                ? "APPROVED"
                                : "PENDING",

                        isAdmin:
                            admin,

                        // =========================
                        // Bot Access
                        // =========================

                        botAccess:
                            admin,

                        botActive:
                            false,

                        // =========================
                        // Account Status
                        // =========================

                        status:
                            admin
                                ? "ACTIVE"
                                : "PENDING",

                        // =========================
                        // Login
                        // =========================

                        lastLogin:
                            new Date()

                    });

            }

            else {

                // =================================
                // Update Telegram Information
                // =================================

                if (
                    telegramUser.username !==
                    undefined
                ) {

                    user.username =
                        telegramUser.username ||
                        "";

                }


                if (
                    telegramUser.first_name !==
                    undefined
                ) {

                    user.firstName =
                        telegramUser.first_name ||
                        "";

                }


                if (
                    telegramUser.last_name !==
                    undefined
                ) {

                    user.lastName =
                        telegramUser.last_name ||
                        "";

                }


                // =================================
                // Update Login Time
                // =================================

                user.lastLogin =
                    new Date();


                // =================================
                // Admin Protection
                // =================================

                if (admin) {

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


                // =================================
                // Save
                // =================================

                await user.save();

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

                isAdmin:
                    user.isAdmin === true,

                approved:
                    user.accessEnabled === true ||
                    user.approvalStatus ===
                        "APPROVED" ||
                    user.status ===
                        "ACTIVE",

                message:
                    "Telegram authentication successful",

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
// Current Authenticated User
// GET /api/auth/me
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

                    success: false,

                    authenticated: false,

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

                    authenticated: true,

                    message:
                        "User account not found"

                });

            }


            // =================================
            // Check Admin
            // =================================

            const admin =
                isTelegramAdmin(
                    telegramUser
                );


            // =================================
            // Restore Admin Access
            // =================================

            if (admin) {

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
                    user.accessEnabled !==
                    true
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
                    user.botAccess !==
                    true
                ) {

                    user.botAccess =
                        true;

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


                if (changed) {

                    await user.save();

                }

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

                isAdmin:
                    user.isAdmin === true,

                approved:
                    user.accessEnabled === true ||
                    user.approvalStatus ===
                        "APPROVED" ||
                    user.status ===
                        "ACTIVE",

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
// Admin Status Check
// GET /api/auth/admin
// =====================================

router.get(
    "/admin",
    requireTelegramUser,
    async (
        req,
        res,
        next
    ) => {

        try {

            const telegramUser =
                req.telegramUser;


            if (
                !telegramUser ||
                !telegramUser.id
            ) {

                return res.status(401).json({

                    success: false,

                    isAdmin: false,

                    message:
                        "Telegram authentication required"

                });

            }


            const admin =
                isTelegramAdmin(
                    telegramUser
                );


            if (!admin) {

                return res.status(403).json({

                    success: false,

                    isAdmin: false,

                    message:
                        "Admin access required"

                });

            }


            const user =
                await User.findOne({

                    telegramId:
                        String(
                            telegramUser.id
                        )

                });


            return res.json({

                success: true,

                isAdmin: true,

                user:
                    user
                        ? buildUserResponse(
                            user
                        )
                        : null

            });

        }

        catch (error) {

            console.error(
                "[AUTH ADMIN ERROR]",
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