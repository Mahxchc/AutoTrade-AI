// =====================================
// Authentication Middleware :: M
// AutoTrade AI
// File: backend/middleware/auth.js
// =====================================

import {
    validateTelegramInitData
} from "../utils/telegramAuth.js";


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
            req.headers["x-telegram-init-data"] ||
            req.headers["x-telegram-initdata"] ||
            req.body?.initData ||
            req.query?.initData;


        if (!initData) {

            return res.status(401).json({

                success: false,

                authenticated: false,

                message:
                    "Telegram authentication required"

            });

        }


        const result =
            validateTelegramInitData(initData);


        if (!result.valid) {

            return res.status(401).json({

                success: false,

                authenticated: false,

                message:
                    result.message ||
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


        next();

    }

    catch (error) {

        console.error(
            "[TELEGRAM AUTH MIDDLEWARE ERROR]",
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
// Optional Telegram User
// =====================================

export function optionalTelegramUser(
    req,
    res,
    next
) {

    try {

        const initData =
            req.headers["x-telegram-init-data"] ||
            req.headers["x-telegram-initdata"] ||
            req.body?.initData ||
            req.query?.initData;


        if (!initData) {

            return next();

        }


        const result =
            validateTelegramInitData(initData);


        if (
            result.valid &&
            result.user &&
            result.user.id
        ) {

            req.telegramUser =
                result.user;

            req.telegramId =
                String(result.user.id);

        }


        next();

    }

    catch (error) {

        console.error(
            "[OPTIONAL TELEGRAM AUTH ERROR]",
            error
        );

        next();

    }

}


// =====================================
// Required Admin
// =====================================

export function requiredAdmin(
    req,
    res,
    next
) {

    try {

        if (!req.telegramUser) {

            return res.status(401).json({

                success: false,

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

                message:
                    "Admin access required"

            });

        }


        next();

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
// Compatibility Alias
// =====================================
//
// Supports files that use:
// requiredTelegramUser
//
// =====================================

export const requiredTelegramUser =
    requireTelegramUser;