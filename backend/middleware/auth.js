// =====================================
// Auth Middleware:: M
// AutoTrade AI
// Authentication & Access Control
// File: backend/middleware/auth.js
// =====================================

import User from "../models/User.js";


// =====================================
// Require User Authentication
// =====================================

export async function requireUser(
    req,
    res,
    next
) {

    try {

        const userId =
            req.headers["x-user-id"];


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"

            });

        }


        const user =
            await User.findById(
                userId
            );


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "User not found"

            });

        }


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


        req.user =
            user;


        next();

    }

    catch (error) {

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
        req.user.approvalStatus !==
        "APPROVED"
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
