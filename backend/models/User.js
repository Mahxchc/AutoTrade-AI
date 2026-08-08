// =====================================
// AutoTrade AI
// User Model
// =====================================

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        // =====================================
        // Telegram Identity
        // =====================================

        telegramId: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true
        },

        username: {
            type: String,
            default: "",
            trim: true
        },

        firstName: {
            type: String,
            default: "",
            trim: true
        },

        // =====================================
        // Account Access
        // =====================================

        accessEnabled: {
            type: Boolean,
            default: false
        },

        // =====================================
        // Admin / Owner Control
        // =====================================

        isAdmin: {
            type: Boolean,
            default: false
        },

        // =====================================
        // Bot Permission
        // =====================================

        botAccess: {
            type: Boolean,
            default: false
        },

        // =====================================
        // Current Bot State
        // =====================================

        botActive: {
            type: Boolean,
            default: false
        },

        // =====================================
        // Wallet
        // =====================================

        walletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wallet",
            default: null
        },

        // =====================================
        // Account Status
        // =====================================

        status: {
            type: String,
            enum: [
                "PENDING",
                "ACTIVE",
                "BLOCKED"
            ],
            default: "PENDING"
        },

        // =====================================
        // Last Login
        // =====================================

        lastLogin: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

export default User;
