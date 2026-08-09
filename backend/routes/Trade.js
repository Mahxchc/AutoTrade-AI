// =====================================
// Trade Routes:: M
// AutoTrade AI
// Trade History & Access API
// File: backend/routes/Trade.js
// =====================================

import express from "express";

import mongoose from "mongoose";

import Trade from "../models/Trade.js";

import {
    requireUser,
    requireApprovedUser,
    requireAdmin
} from "../middleware/auth.js";


const router = express.Router();


// =====================================
// GET MY TRADES:: M
// GET /api/trades/me
// =====================================

router.get(
    "/me",
    requireUser,
    requireApprovedUser,
    async (req, res, next) => {

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
// GET USER TRADES:: M
// GET /api/trades/:userId
// =====================================
//
// Owner can see own trades.
// Admin can see any user's trades.
// =====================================

router.get(
    "/:userId",
    requireUser,
    async (req, res, next) => {

        try {

            const {
                userId
            } = req.params;


            // =====================================
            // Validate User ID:: M
            // =====================================

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


            // =====================================
            // Permission Check:: M
            // =====================================

            const isOwner =
                req.user._id.toString() ===
                userId;


            const isAdmin =
                req.user.isAdmin === true;


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


            // =====================================
            // Get Trades:: M
            // =====================================

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
// CREATE TRADE:: M
// POST /api/trades
// =====================================
//
// IMPORTANT:
// Direct client-created trades are disabled.
//
// Real trades must be created by the
// Trading Engine after a real broker/exchange
// order has been successfully executed.
// =====================================

router.post(
    "/",
    requireUser,
    requireApprovedUser,
    async (req, res) => {

        return res.status(403).json({

            success: false,

            message:
                "Direct trade creation is disabled. Trades are created by the Trading Engine."

        });

    }
);


// =====================================
// ADMIN GET ALL TRADES:: M
// GET /api/trades/admin/all
// =====================================

router.get(
    "/admin/all",
    requireUser,
    requireAdmin,
    async (req, res, next) => {

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


export default router;
