// =====================================
// User Model:: M
// AutoTrade AI
// User Database Model
// File: backend/models/User.js
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


        lastName: {

            type: String,

            default: "",

            trim: true

        },


        // =====================================
        // Contact Information
        // =====================================

        phoneNumber: {

            type: String,

            default: "",

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

            type:
                mongoose.Schema.Types.ObjectId,

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


// =====================================
// User Model
// =====================================

const User = mongoose.model(

    "User",

    userSchema

);


export default User;