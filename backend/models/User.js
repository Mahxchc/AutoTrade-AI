// =====================================
// ..M
// AutoTrade AI
// User Model
// File: backend/models/User.js
// =====================================

import mongoose from "mongoose";

// =====================================
// ..M
// User Schema
// =====================================

const userSchema = new mongoose.Schema(
    {
        // =====================================
        // ..M
        // Telegram Information
        // =====================================

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

        lastName: {
            type: String,
            default: ""
        },

        phoneNumber: {
            type: String,
            default: ""
        },

        // =====================================
        // ..M
        // Registration Progress
        // =====================================

        // NAME    = منتظر نام و نام خانوادگی
        // PHONE   = منتظر شماره تلفن
        // COMPLETED = ثبت‌نام کامل شده و منتظر تأیید مدیریت

        registrationStep: {
            type: String,
            enum: ["NAME", "PHONE", "COMPLETED"],
            default: "NAME"
        },

        // =====================================
        // ..M
        // Access / Approval
        // =====================================

        accessEnabled: {
            type: Boolean,
            default: false
        },

        approvalStatus: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING"
        },

        // =====================================
        // ..M
        // Admin
        // =====================================

        isAdmin: {
            type: Boolean,
            default: false
        },

        // =====================================
        // ..M
        // Bot Access
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
        // ..M
        // Wallet
        // =====================================

        walletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Wallet",
            default: null
        },

        // =====================================
        // ..M
        // User Status
        // =====================================

        status: {
            type: String,
            enum: ["PENDING", "ACTIVE", "BLOCKED"],
            default: "PENDING"
        },

        // =====================================
        // ..M
        // Financial Information
        // =====================================

        balance: {
            type: Number,
            default: 0
        },

        totalProfit: {
            type: Number,
            default: 0
        },

        todayProfit: {
            type: Number,
            default: 0
        },

        // =====================================
        // ..M
        // Login Information
        // =====================================

        lastLogin: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// =====================================
// ..M
// Export User Model
// =====================================

const User = mongoose.model("User", userSchema);

export default User;