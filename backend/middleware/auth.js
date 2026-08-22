// =====================================
// Auth Middleware:: M
// AutoTrade AI
// Telegram WebApp Authentication
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


        if (!initData) {

            return res.status(401).json({

                success: false,

                message:
                    "Telegram authentication required"

            });

        }


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


        const telegramUser =
            telegramResult.user;


        const telegramId =
            String(
                telegramUser.id
            );


        let user =
            await User.findOne({
                telegramId
            });


        // =====================================
        // Create Telegram User
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

                    accessEnabled: false,

                    isAdmin: false,

                    botAccess: false,

                    botActive: false,

                    status: "PENDING"

                });

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
        // Attach User
        // =====================================

        req.user =
            user;


        req.telegramUser =
            telegramUser;


        req.telegramId =
            telegramId;


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

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message:
                "Authentication required"

        });

    }


    if (
        req.user.status !==
        "ACTIVE"
    ) {

        return res.status(403).json({

            success: false,

            message:
                "User approval is required"

        });

    }


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

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message:
                "Authentication required"

        });

    }


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