// =====================================
// Wallet Routes:: M
// AutoTrade AI
// Wallet API
// File: backend/routes/Wallet.js
// =====================================

import express from "express";

import mongoose from "mongoose";

import Wallet from "../models/Wallet.js";

import {
    requireUser,
    requireApprovedUser
} from "../middleware/auth.js";


const router = express.Router();


// =====================================
// GET MY WALLET
// GET /api/wallet/me
// =====================================

router.get(
    "/me",
    requireUser,
    requireApprovedUser,
    async (req, res, next) => {

        try {

            const userId =
                req.user._id;


            let wallet =
                await Wallet.findOne({

                    userId

                });


            // =====================================
            // Create Wallet If Missing
            // =====================================

            if (!wallet) {

                wallet =
                    await Wallet.create({

                        userId,

                        balanceUSD: 0,

                        totalProfitUSD: 0,

                        totalTrades: 0,

                        withdrawableUSD: 0,

                        currency: "USD"

                    });

            }


            return res.status(200).json({

                success: true,

                wallet

            });

        }

        catch (error) {

            next(error);

        }

    }
);


// =====================================
// GET WALLET BY USER ID
// GET /api/wallet/:userId
// =====================================
//
// Admin only.
// Normal users must use /me.
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
            // Validate ObjectId
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
            // User Can Only Access Own Wallet
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
                        "You do not have permission to access this wallet"

                });

            }


            const wallet =
                await Wallet.findOne({

                    userId

                });


            // =====================================
            // Wallet Not Created Yet
            // =====================================

            if (!wallet) {

                return res.status(200).json({

                    success: true,

                    wallet: {

                        userId,

                        balanceUSD: 0,

                        totalProfitUSD: 0,

                        totalTrades: 0,

                        withdrawableUSD: 0,

                        currency: "USD"

                    },

                    message:
                        "Wallet not found"

                });

            }


            return res.status(200).json({

                success: true,

                wallet

            });

        }

        catch (error) {

            next(error);

        }

    }
);


export default router;
