// =====================================
// ..M AutoTrade AI
// Authentication Middleware
// File: backend/middleware/auth.js
// =====================================

import {
    validateTelegramInitData
} from "../utils/telegramAuth.js";

import User from "../models/User.js";


// =====================================
// Get Telegram InitData :: M
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
// Require Telegram User :: M
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
                    "احراز هویت Telegram لازم است"

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
                    "احراز هویت Telegram نامعتبر است"

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
                    "اطلاعات کاربر Telegram موجود نیست"

            });

        }


        // =================================
        // Save Telegram User :: M
        // =================================

        req.telegramUser =
            result.user;


        // =================================
        // Save Telegram ID :: M
        // =================================

        req.telegramId =
            String(
                result.user.id
            );


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
                "احراز هویت Telegram انجام نشد"

        });

    }

}


// =====================================
// Require User :: M
// =====================================

export const requireUser =
    requireTelegramUser;


// =====================================
// Required Telegram User :: M
// =====================================

export const requiredTelegramUser =
    requireTelegramUser;


// =====================================
// Require Admin :: M
// فقط سازنده / مدیر
// =====================================

export async function requireAdmin(
    req,
    res,
    next
) {

    try {

        // =================================
        // Telegram Authentication
        // =================================

        if (!req.telegramUser) {

            return res.status(401).json({

                success: false,

                authenticated: false,

                message:
                    "احراز هویت Telegram لازم است"

            });

        }


        const telegramId =
            String(
                req.telegramUser.id
            );


        // =================================
        // Admin Telegram ID
        // =================================

        const adminTelegramId =
            process.env.ADMIN_TELEGRAM_ID;


        if (!adminTelegramId) {

            return res.status(500).json({

                success: false,

                message:
                    "ADMIN_TELEGRAM_ID در تنظیمات سرور ثبت نشده است"

            });

        }


        // =================================
        // Check Admin Telegram ID
        // =================================

        if (
            telegramId !==
            String(adminTelegramId)
        ) {

            return res.status(403).json({

                success: false,

                authenticated: true,

                admin: false,

                message:
                    "دسترسی مدیر لازم است"

            });

        }


        // =================================
        // Find Admin In Database
        // =================================

        const user =
            await User.findOne({

                telegramId

            });


        if (!user) {

            return res.status(403).json({

                success: false,

                authenticated: true,

                admin: false,

                message:
                    "حساب مدیر در سیستم پیدا نشد"

            });

        }


        // =================================
        // Database Admin Check
        // =================================

        if (
            user.isAdmin !== true
        ) {

            return res.status(403).json({

                success: false,

                authenticated: true,

                admin: false,

                message:
                    "این حساب به عنوان مدیر ثبت نشده است"

            });

        }


        // =================================
        // Admin Request Data
        // =================================

        req.user =
            user;

        req.isAdmin =
            true;

        req.telegramId =
            telegramId;


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
                "بررسی دسترسی مدیر انجام نشد"

        });

    }

}


// =====================================
// Required Admin :: M
// =====================================

export const requiredAdmin =
    requireAdmin;


// =====================================
// Require Approved User :: M
// =====================================
// کاربران عادی فقط در صورت تأیید
// صریح مدیریت اجازه استفاده دارند.
//
// Admin از این محدودیت عبور می‌کند.
// =====================================

export async function requireApprovedUser(
    req,
    res,
    next
) {

    try {

        // =================================
        // Telegram Authentication
        // =================================

        if (!req.telegramUser) {

            return res.status(401).json({

                success: false,

                authenticated: false,

                approved: false,

                message:
                    "احراز هویت Telegram لازم است"

            });

        }


        const telegramId =
            String(
                req.telegramUser.id
            );


        // =================================
        // Find User
        // =================================

        const user =
            await User.findOne({

                telegramId

            });


        if (!user) {

            return res.status(404).json({

                success: false,

                authenticated: true,

                approved: false,

                message:
                    "حساب کاربری پیدا نشد"

            });

        }


        // =================================
        // Blocked User
        // =================================

        if (
            String(
                user.status
            ).toUpperCase() ===
            "BLOCKED"
        ) {

            return res.status(403).json({

                success: false,

                authenticated: true,

                approved: false,

                message:
                    "حساب کاربری مسدود شده است"

            });

        }


        // =================================
        // ADMIN BYPASS :: M
        // =================================

        if (
            user.isAdmin === true
        ) {

            req.user =
                user;

            req.telegramId =
                telegramId;

            req.isAdmin =
                true;

            return next();

        }


        // =================================
        // Explicit Approval :: M
        // =================================

        const approved =
            user.accessEnabled === true &&
            String(
                user.approvalStatus
            ).toUpperCase() ===
            "APPROVED" &&
            String(
                user.status
            ).toUpperCase() ===
            "ACTIVE";


        // =================================
        // Not Approved
        // =================================

        if (!approved) {

            return res.status(403).json({

                success: false,

                authenticated: true,

                approved: false,

                status:
                    user.status,

                approvalStatus:
                    user.approvalStatus,

                accessEnabled:
                    user.accessEnabled,

                message:
                    "حساب شما هنوز توسط مدیریت تأیید نشده است"

            });

        }


        // =================================
        // Approved User
        // =================================

        req.user =
            user;

        req.telegramId =
            telegramId;

        req.isAdmin =
            false;


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
                "بررسی تأیید کاربر انجام نشد"

        });

    }

}


// =====================================
// Optional Telegram User :: M
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
// Default Export :: M
// =====================================

export default {

    requireTelegramUser,

    requireUser,

    requiredTelegramUser,

    requireAdmin,

    requiredAdmin,

    requireApprovedUser,

    optionalTelegramUser

};