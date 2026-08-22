// =====================================
// Authentication Middleware :: M
// AutoTrade AI
// File: backend/middleware/auth.js
// =====================================

import {
    validateTelegramInitData
} from "../utils/telegramAuth.js";


// =====================================
// Required Telegram User
// =====================================

export function requiredTelegramUser(
    req,
    res,
    next
) {

    try {

        // ---------------------------------
        // Get Telegram initData
        // ---------------------------------

        const initData =
            req.headers["x-telegram-init-data"] ||
            req.headers["x-telegram-initdata"] ||
            req.body?.initData ||
            req.query?.initData;


        // ---------------------------------
        // Missing initData
        // ---------------------------------

        if (!initData) {

            return res.status(401).json({

                success: false,

                message:
                    "Telegram authentication required"

            });

        }


        // ---------------------------------
        // Validate Telegram signature
        // ---------------------------------

        const result =
            validateTelegramInitData(initData);


        if (!result.valid) {

            return res.status(401).json({

                success: false,

                message:
                    result.message ||
                    "Invalid Telegram authentication"

            });

        }


        // ---------------------------------
        // Attach Telegram user
        // ---------------------------------

        req.telegramUser =
            result.user;


        req.telegramId =
            String(result.user.id);


        // ---------------------------------
        // Continue
        // ---------------------------------

        next();

    }

    catch (error) {

        console.error(
            "Telegram middleware error:",
            error
        );


        return res.status(401).json({

            success: false,

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


        if (result.valid) {

            req.telegramUser =
                result.user;


            req.telegramId =
                String(result.user.id);

        }


        next();

    }

    catch (error) {

        console.error(
            "Optional Telegram authentication error:",
            error
        );

        next();

    }

}


// =====================================
// Admin Authentication
// =====================================

export function requiredAdmin(
    req,
    res,
    next
) {

    if (!req.telegramUser) {

        return res.status(401).json({

            success: false,

            message:
                "Telegram authentication required"

        });

    }


    // Admin ID must be configured
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