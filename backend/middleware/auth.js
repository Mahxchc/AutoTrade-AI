// =====================================
// Authentication Middleware :: M
// AutoTrade AI
// File: backend/middleware/auth.js
// =====================================

import {
    validateTelegramInitData
} from "../utils/telegramAuth.js";


// =====================================
// Get Telegram Init Data
// =====================================

function getTelegramInitData(req) {

    return (
        req.headers["x-telegram-init-data"] ||
        req.headers["x-telegram-initdata"] ||
        req.body?.initData ||
        req.query?.initData ||
        null
    );

}


// =====================================
// Require Telegram User
// =====================================

export function requireTelegramUser(
    req,
    res,
    next
) {

    try {

        const initData =
            getTelegramInitData(req);


        if (!initData) {

            return res.status(401).json({

                success: false,

                authenticated: false,

                message:
                    "Telegram authentication required"

            });

        }


        const result =
            validateTelegramInitData(
                initData
            );


        if (
            !result ||
            !result.valid
        ) {

            return res.status(401).json({

                success: false,

                authenticated: false,

                message:
                    result?.message ||
                    "Invalid Telegram authentication"

            });

        }


        if (
            !result.user ||
            !result.user.id
        ) {

            return res.status(401).json({

                success: false,

                authenticated: false,

                message:
                    "Telegram user information is missing"

            });

        }


        req.telegramUser =
            result.user;


        req.telegramId =
            String(result.user.id);


        return next();

    }

    catch (error) {

        console.error(
            "[TELEGRAM AUTH ERROR]",
            error
        );


        return res.status(401).json({

            success: false,

            authenticated: false,

            message:
                "Telegram authentication failed"

        });

    }

}


// =====================================
// requireUser
// =====================================
//
// Compatibility alias
// =====================================

export const requireUser =
    requireTelegramUser;


// =====================================
// requiredTelegramUser
// =====================================

export const requiredTelegramUser =
    requireTelegramUser;


// =====================================
// Require Admin
// =====================================

export function requireAdmin(
    req,
    res,
    next
) {

    try {

        if (!req.telegramUser) {

            return res.status(401).json({

                success: false,

                authenticated: false,

                message:
                    "Telegram authentication required"

            });

        }


        const adminTelegramId =
            process.env.ADMIN_TELEGRAM_ID;


        if (!adminTelegramId) {

            return res.status(500).json({

                success: false,

                message:
                    "ADMIN_TELEGRAM_ID is not configured"

            });

        }


        if (
            String(req.telegramUser.id) !==
            String(adminTelegramId)
        ) {

            return res.status(403).json({

                success: false,

                authenticated: true,

                message:
                    "Admin access required"

            });

        }


        req.isAdmin = true;


        return next();

    }

    catch (error) {

        console.error(
            "[ADMIN AUTH ERROR]",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Admin authentication failed"

        });

    }

}


// =====================================
// requiredAdmin
// =====================================

export const requiredAdmin =
    requireAdmin;


// =====================================
// Require Approved User
// =====================================

export async function requireApprovedUser(
    req,
    res,
    next
) {

    try {

        // ---------------------------------
        // Telegram authentication
        // ---------------------------------

        if (!req.telegramUser) {

            return res.status(401).json({

                success: false,

                authenticated: false,

                message:
                    "Telegram authentication required"

            });

        }


        // ---------------------------------
        // Load User Model
        // ---------------------------------

        const User =
            (
                await import(
                    "../models/User.js"
                )
            ).default;


        // ---------------------------------
        // Find User
        // ---------------------------------

        const user =
            await User.findOne({

                telegramId:
                    String(
                        req.telegramUser.id
                    )

            });


        if (!user) {

            return res.status(404).json({

                success: false,

                authenticated: true,

                approved: false,

                message:
                    "User not found"

            });

        }


        // ---------------------------------
        // Blocked User
        // ---------------------------------

        if (
            String(user.status)
                .toUpperCase() ===
            "BLOCKED"
        ) {

            return res.status(403).json({

                success: false,

                authenticated: true,

                approved: false,

                message:
                    "User account is blocked"

            });

        }


        // ---------------------------------
        // Approval Check
        // ---------------------------------

        const approved =
            user.accessEnabled === true ||
            user.botAccess === true ||
            String(user.approvalStatus)
                .toUpperCase() ===
                "APPROVED" ||
            String(user.status)
                .toUpperCase() ===
                "ACTIVE";


        if (!approved) {

            return res.status(403).json({

                success: false,

                authenticated: true,

                approved: false,

                message:
                    "User approval is required"

            });

        }


        // ---------------------------------
        // Attach Database User
        // ---------------------------------

        req.user =
            user;


        req.telegramId =
            String(
                req.telegramUser.id
            );


        return next();

    }

    catch (error) {

        console.error(
            "[APPROVED USER ERROR]",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "User approval verification failed"

        });

    }

}


// =====================================
// Optional Telegram User
// =====================================

export function optionalTelegramUser(
    req,
    res,
    next
) {

    try {

        const initData =
            getTelegramInitData(req);


        if (!initData) {

            return next();

        }


        const result =
            validateTelegramInitData(
                initData
            );


        if (
            result &&
            result.valid &&
            result.user &&
            result.user.id
        ) {

            req.telegramUser =
                result.user;


            req.telegramId =
                String(
                    result.user.id
                );

        }


        return next();

    }

    catch (error) {

        console.error(
            "[OPTIONAL TELEGRAM AUTH ERROR]",
            error
        );


        return next();

    }

}


// =====================================
// Default Export
// =====================================

export default {

    requireUser,

    requireTelegramUser,

    requiredTelegramUser,

    requireAdmin,

    requiredAdmin,

    requireApprovedUser,

    optionalTelegramUser

};