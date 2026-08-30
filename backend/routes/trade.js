// =====================================
// ..M Trade Routes
// AutoTrade AI
// Trade History & Access API
// File: backend/routes/trade.js
// =====================================

import express from "express";
import mongoose from "mongoose";

import Trade from "../models/Trade.js";
import User from "../models/User.js";

import {
    requireUser,
    requireApprovedUser,
    requireAdmin
} from "../middleware/auth.js";


const router =
    express.Router();


// =====================================
// ..M GET MY TRADES
// GET /api/trades/me
// =====================================

router.get(
    "/me",
    requireUser,
    requireApprovedUser,
    async (
        req,
        res,
        next
    ) => {

        try {

            const trades =
                await Trade.find({

                    userId:
                        req.user._id

                })
                .sort({
                    createdAt: -1
                })
                .limit(100);


            return res.status(200).json({

                success: true,

                count:
                    trades.length,

                trades

            });

        }

        catch (error) {

            next(error);

        }

    }
);


// =====================================
// ..M ADMIN GET ALL TRADES
// GET /api/trades/admin/all
// =====================================
//
// این مسیر باید قبل از /:userId باشد.
// ادمین می‌تواند معاملات همه کاربران را ببیند.
// =====================================

router.get(
    "/admin/all",
    requireUser,
    requireAdmin,
    async (
        req,
        res,
        next
    ) => {

        try {

            const trades =
                await Trade.find({})
                .populate(
                    "userId",
                    "telegramId username firstName lastName"
                )
                .sort({
                    createdAt: -1
                })
                .limit(500);


            return res.status(200).json({

                success: true,

                count:
                    trades.length,

                trades

            });

        }

        catch (error) {

            next(error);

        }

    }
);


// =====================================
// ..M GET USER TRADES
// GET /api/trades/:userId
// =====================================
//
// کاربر فقط معاملات خودش را می‌بیند.
// ادمین می‌تواند معاملات هر کاربر را ببیند.
// =====================================

router.get(
    "/:userId",
    requireUser,
    async (
        req,
        res,
        next
    ) => {

        try {

            const {
                userId
            } = req.params;


            // =================================
            // ..M Validate User ID
            // =================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    userId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid user ID"

                });

            }


            // =================================
            // ..M Find Authenticated User
            // =================================

            const authenticatedUser =
                await User.findOne({

                    telegramId:
                        String(
                            req.telegramUser.id
                        )

                });


            if (!authenticatedUser) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Authenticated user not found"

                });

            }


            // =================================
            // ..M Permission
            // =================================

            const isOwner =
                authenticatedUser._id.toString() ===
                String(userId);


            const isAdmin =
                authenticatedUser.isAdmin === true;


            if (
                !isOwner &&
                !isAdmin
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "You do not have permission to view these trades"

                });

            }


            // =================================
            // ..M Get Trades
            // =================================

            const trades =
                await Trade.find({

                    userId

                })
                .sort({
                    createdAt: -1
                })
                .limit(100);


            return res.status(200).json({

                success: true,

                count:
                    trades.length,

                trades

            });

        }

        catch (error) {

            next(error);

        }

    }
);


// =====================================
// ..M CREATE TRADE
// POST /api/trades
// =====================================
//
// معامله مستقیماً از Mini App ساخته نمی‌شود.
//
// تمام معاملات واقعی باید فقط توسط
// Trading Engine ایجاد شوند.
//
// این کار از جعل معامله توسط کاربر جلوگیری می‌کند.
// =====================================

router.post(
    "/",
    requireUser,
    requireApprovedUser,
    async (
        req,
        res
    ) => {

        return res.status(403).json({

            success: false,

            message:
                "Direct trade creation is disabled. Trades are created by the Trading Engine."

        });

    }
);


// =====================================
// ..M ADMIN CREATE TRADE BLOCK
// =====================================
//
// حتی ادمین هم نباید از API عمومی معامله بسازد.
// معاملات باید از Trading Engine عبور کنند.
// =====================================

router.post(
    "/admin",
    requireUser,
    requireAdmin,
    async (
        req,
        res
    ) => {

        return res.status(403).json({

            success: false,

            message:
                "Manual trade creation is disabled. Trades are created by the Trading Engine."

        });

    }
);


// =====================================
// ..M EXPORT
// =====================================

export default router;