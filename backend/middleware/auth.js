// =====================================
// Auth Middleware:: M
// AutoTrade AI
// Telegram WebApp Authentication
// Authentication & Access Control
// File: backend/middleware/auth.js
// =====================================

import User from "../models/User.js";

import {
    validateTelegramInitData
} from "../utils/telegramAuth.js";


// =====================================
// Require Telegram User Authentication
// =====================================

export async function requireUser(
    req,
    res,
    next
) {

    try {

        const initData =
            req.headers[
                "x-telegram-init-data"
            ];


        // =====================================
        // Telegram initData Required
        // =====================================

        if (!initData) {

            return res.status(401).json({

                success: false,

                message:
                    "Telegram authentication required"

            });

        }


        // =====================================
        // Validate Telegram Signature
        // =====================================

        const telegramResult =
            validateTelegramInitData(
                initData
            );


        if (
            !telegramResult.valid
        ) {

            return res.status(401).json({

                success: false,

                message:
                    telegramResult.message

            });

        }


        // =====================================
        // Telegram User
        // =====================================

        const telegramUser =
            telegramResult.user;


        const telegramId =
            String(
                telegramUser.id
            );


        // =====================================
        // Find Existing User
        // =====================================

        let user =
            await User.findOne({

                telegramId

            });


        // =====================================
        // Create New User
        // =====================================

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

        else {

            // =====================================
            // Update Telegram Profile Information
            // =====================================

            user.username =
                telegramUser.username ||
                "";

            user.firstName =
                telegramUser.first_name ||
                "";

            user.lastName =
                telegramUser.last_name ||
                "";

            user.lastLogin =
                new Date();


            await user.save();

        }


        // =====================================
        // Blocked User
        // =====================================

        if (
            user.status ===
            "BLOCKED"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "User account is blocked"

            });

        }


        // =====================================
        // Attach Authenticated User
        // =====================================

        req.user =
            user;


        req.telegramUser =
            telegramUser;


        req.telegramId =
            telegramId;


        // =====================================
        // Continue
        // =====================================

        next();

    }

    catch (error) {

        console.error(
            "Auth middleware error:",
            error
        );


        next(error);

    }

}


// =====================================
// Require Approved User
// =====================================

export function requireApprovedUser(
    req,
    res,
    next
) {

    // =====================================
    // Authentication Check
    // =====================================

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message:
                "Authentication required"

        });

    }


    // =====================================
    // Account Status Check
    // =====================================

    if (
        req.user.status ===
        "BLOCKED"
    ) {

        return res.status(403).json({

            success: false,

            message:
                "User account is blocked"

        });

    }


    // =====================================
    // Approval Check
    // =====================================

    if (
        req.user.approvalStatus !==
        "APPROVED"
    ) {

        return res.status(403).json({

            success: false,

            message:
                "User approval is required"

        });

    }


    // =====================================
    // Access Check
    // =====================================

    if (
        req.user.accessEnabled !==
        true
    ) {

        return res.status(403).json({

            success: false,

            message:
                "User access is disabled"

        });

    }


    // =====================================
    // Account Must Be Active
    // =====================================

    if (
        req.user.status !==
        "ACTIVE"
    ) {

        return res.status(403).json({

            success: false,

            message:
                "User account is not active"

        });

    }


    next();

}


// =====================================
// Require Admin
// =====================================

export function requireAdmin(
    req,
    res,
    next
) {

    // =====================================
    // Authentication Check
    // =====================================

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message:
                "Authentication required"

        });

    }


    // =====================================
    // Admin Permission
    // =====================================

    if (
        req.user.isAdmin !==
        true
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Admin permission required"

        });

    }


    next();

}