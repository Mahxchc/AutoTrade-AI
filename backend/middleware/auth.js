// =====================================
// ..M Auth Middleware
// AutoTrade AI
// Authentication & Access Control
// File: backend/middleware/auth.js
// =====================================

import mongoose from "mongoose";
import User from "../models/User.js";


// =====================================
// ..M Require User Authentication
// احراز هویت کاربر
// =====================================

export async function requireUser(req, res, next) {

    try {

        const userId =
            req.headers["x-user-id"];


        // =====================================
        // ..M بررسی وجود User ID
        // =====================================

        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"

            });

        }


        // =====================================
        // ..M بررسی معتبر بودن MongoDB ID
        // =====================================

        if (
            !mongoose.Types.ObjectId.isValid(
                userId
            )
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid user ID"

            });

        }


        // =====================================
        // ..M پیدا کردن کاربر
        // =====================================

        const user =
            await User.findById(
                userId
            );


        // =====================================
        // ..M کاربر پیدا نشد
        // =====================================

        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "User not found"

            });

        }


        // =====================================
        // ..M بررسی وضعیت Block
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
        // ..M ذخیره کاربر داخل Request
        // =====================================

        req.user =
            user;


        next();

    }

    catch (error) {

        console.error(
            "Require User Error:",
            error
        );

        next(error);

    }

}


// =====================================
// ..M Require Approved User
// کاربر باید تأیید شده باشد
// =====================================

export function requireApprovedUser(
    req,
    res,
    next
) {

    // =====================================
    // ..M بررسی Authentication
    // =====================================

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message:
                "Authentication required"

        });

    }


    // =====================================
    // ..M بررسی وضعیت حساب
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


    // =====================================
    // ..M بررسی Approval
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
    // ..M بررسی دسترسی
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


    next();

}


// =====================================
// ..M Require Bot Access
// اجازه استفاده از ربات
// =====================================

export function requireBotAccess(
    req,
    res,
    next
) {

    // =====================================
    // ..M Authentication
    // =====================================

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message:
                "Authentication required"

        });

    }


    // =====================================
    // ..M Approval
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
    // ..M Access Enabled
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
    // ..M Bot Access
    // =====================================

    if (
        req.user.botAccess !==
        true
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Trading bot access is disabled"

        });

    }


    // =====================================
    // ..M Active Account
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
// ..M Require Admin
// دسترسی مدیر
// =====================================

export function requireAdmin(
    req,
    res,
    next
) {

    // =====================================
    // ..M Authentication
    // =====================================

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message:
                "Authentication required"

        });

    }


    // =====================================
    // ..M بررسی Admin
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


    // =====================================
    // ..M Admin باید Active باشد
    // =====================================

    if (
        req.user.status ===
        "BLOCKED"
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Admin account is blocked"

        });

    }


    next();

}


// =====================================
// ..M Export
// =====================================

export default {

    requireUser,

    requireApprovedUser,

    requireBotAccess,

    requireAdmin

};