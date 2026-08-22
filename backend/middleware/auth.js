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


        if (!result || !result.valid) {

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


        // =================================
        // Attach Telegram User
        // =================================

        req.telegramUser =
            result.user;


        req.telegramId =
            String(result.user.id);


        // =================================
        // Continue
        // =================================

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
// Required Telegram User
// =====================================
//
// Compatibility alias
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

        // ---------------------------------
        // Telegram authentication required
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
        // Admin Telegram ID
        // ---------------------------------

        const adminTelegramId =
            process.env.ADMIN_TELEGRAM_ID;


        if (!adminTelegramId) {

            console.error(
                "[ADMIN AUTH] ADMIN_TELEGRAM_ID is missing"
            );


            return res.status(500).json({

                success: false,

                message:
                    "ADMIN_TELEGRAM_ID is not configured"

            });

        }


        // ---------------------------------
        // Compare Telegram IDs
        // ---------------------------------

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


        // ---------------------------------
        // Admin confirmed
        // ---------------------------------

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
// Required Admin
// =====================================
//
// Compatibility alias
// =====================================

export const requiredAdmin =
    requireAdmin;


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


        // ---------------------------------
        // No authentication data
        // ---------------------------------

        if (!initData) {

            return next();

        }


        // ---------------------------------
        // Validate Telegram data
        // ---------------------------------

        const result =
            validateTelegramInitData(
                initData
            );


        // ---------------------------------
        // Valid Telegram user
        // ---------------------------------

        if (
            result &&
            result.valid &&
            result.user &&
            result.user.id
        ) {

            req.telegramUser =
                result.user;


            req.telegramId =
                String(result.user.id);

        }


        return next();

    }

    catch (error) {

        console.error(
            "[OPTIONAL TELEGRAM AUTH ERROR]",
            error
        );


        // Optional authentication
        // must not block the request

        return next();

    }

}


// =====================================
// Default Export
// =====================================

export default {
    requireTelegramUser,
    requiredTelegramUser,
    requireAdmin,
    requiredAdmin,
    optionalTelegramUser
};