// =====================================
// AutoTrade AI
// Trade Routes
// =====================================

import express from "express";
import mongoose from "mongoose";
import Trade from "../models/Trade.js";

const router = express.Router();

// =====================================
// GET USER TRADES
// GET /api/trades/:userId
// =====================================

router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const trades = await Trade.find({ userId })
            .sort({ createdAt: -1 })
            .limit(100);

        return res.status(200).json({
            success: true,
            trades
        });

    } catch (error) {
        console.error("Get Trades Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get trades"
        });
    }
});

// =====================================
// CREATE TRADE
// INTERNAL USE
// POST /api/trades
// =====================================
//
// IMPORTANT:
// This endpoint is intended for the backend
// trading engine, not for direct client control.
//
// In the next stage we will move actual trade
// creation behind the Trading Engine / broker
// integration.
//

router.post("/", async (req, res) => {
    try {
        const {
            userId,
            symbol,
            side,
            quantity,
            entryPrice,
            exitPrice,
            profit,
            status
        } = req.body;

        if (!userId || !symbol || !side || quantity == null) {
            return res.status(400).json({
                success: false,
                message: "Required trade data is missing"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const allowedSides = ["BUY", "SELL"];

        if (!allowedSides.includes(side)) {
            return res.status(400).json({
                success: false,
                message: "Invalid trade side"
            });
        }

        if (Number(quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be greater than zero"
            });
        }

        const trade = await Trade.create({
            userId,
            symbol,
            side,
            quantity,
            entryPrice: entryPrice ?? null,
            exitPrice: exitPrice ?? null,
            profit: profit ?? 0,
            status: status || "OPEN"
        });

        return res.status(201).json({
            success: true,
            message: "Trade created successfully",
            trade
        });

    } catch (error) {
        console.error("Create Trade Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create trade"
        });
    }
});

export default router;
