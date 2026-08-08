// =====================================
// AutoTrade AI
// Wallet Routes
// =====================================

import express from "express";
import mongoose from "mongoose";
import Wallet from "../models/Wallet.js";

const router = express.Router();

// =====================================
// GET USER WALLET
// GET /api/wallet/:userId
// =====================================

router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const wallet = await Wallet.findOne({ userId });

        // Wallet does not exist yet
        if (!wallet) {
            return res.status(200).json({
                success: true,
                wallet: {
                    balance: 0,
                    currency: "USDT"
                },
                message: "Wallet not found"
            });
        }

        return res.status(200).json({
            success: true,
            wallet
        });
    } catch (error) {
        console.error("Get Wallet Error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to get wallet"
        });
    }
});

export default router;
