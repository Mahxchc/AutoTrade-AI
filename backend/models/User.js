// =====================================
// AutoTrade AI
// User Model
// =====================================

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        // Telegram identity
        telegramId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },

        username: {
            type: String,
            default: ""
        },

        firstName: {
            type: String,
            default: ""
        },

        // Account access
        accessEnabled: {
            type: Boolean,
            default: false
        },

        // Admin / owner control
        isAdmin: {
            type: Boolean,
            default: false
        },

        // Bot permission
        botAccess: {
            type: Boolean,
            default: false
        },

        // Current bot state
        botActive: {
            type: Boolean,
            default: false
        },

        // Wallet
        walletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wallet",
            default: null
        },

        // Account status
        status: {
            type: String,
            enum: [
                "PENDING",
                "ACTIVE",
                "BLOCKED"
            ],
            default: "PENDING"
        },

        // Timestamps
        createdAt: {
            type: Date,
            default: Date.now
        },

        lastLogin: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model(
    "User",
    userSchema
);

export default User;
