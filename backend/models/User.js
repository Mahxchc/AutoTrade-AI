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
            required: true,
            trim: true
        },

        lastName: {
            type: String,
            required: true,
            trim: true
        },

        phoneNumber: {
            type: String,
            required: true,
            trim: true
        },

        // =====================================
        // Access / Approval
        // =====================================

        accessEnabled: {
            type: Boolean,
            default: false
        },

        approvalStatus: {
            type: String,
            enum: [
                "PENDING",
                "APPROVED",
                "REJECTED"
            ],
            default: "PENDING",
            index: true
        },

        // =====================================
        // Admin / Owner
        // =====================================

        isAdmin: {
            type: Boolean,
            default: false,
            index: true
        },

        // =====================================
        // Bot Permission
        // =====================================

        botAccess: {
            type: Boolean,
            default: false
        },

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
            default: "PENDING",
            index: true
        },

        // =====================================
        // Login / Activity
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
