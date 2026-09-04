// =====================================
// ..M AutoTrade AI
// User Model
// File: backend/models/User.js
// مرحله ۲۱ از ۲۰
// ثبت‌نام مرحله‌ای کاربر
// =====================================

import mongoose from "mongoose";


// =====================================
// User Schema :: M
// =====================================

const UserSchema =
    new mongoose.Schema(

        {

            // ---------------------------------
            // Telegram ID
            // ---------------------------------

            telegramId: {

                type: String,

                required: true,

                unique: true,

                index: true

            },


            // ---------------------------------
            // Telegram Username
            // ---------------------------------

            username: {

                type: String,

                default: ""

            },


            // ---------------------------------
            // First Name
            // ---------------------------------

            firstName: {

                type: String,

                default: ""

            },


            // ---------------------------------
            // Last Name
            // ---------------------------------

            lastName: {

                type: String,

                default: ""

            },


            // ---------------------------------
            // Phone Number
            // ---------------------------------

            phoneNumber: {

                type: String,

                default: ""

            },


            // ---------------------------------
            // Registration Step
            // ---------------------------------
            //
            // NAME
            // PHONE
            // COMPLETED
            //
            // ---------------------------------

            registrationStep: {

                type: String,

                enum: [

                    "NAME",
                    "PHONE",
                    "COMPLETED"

                ],

                default: "NAME"

            },


            // ---------------------------------
            // Access
            // ---------------------------------

            accessEnabled: {

                type: Boolean,

                default: false

            },


            // ---------------------------------
            // Approval
            // ---------------------------------

            approvalStatus: {

                type: String,

                enum: [

                    "PENDING",
                    "APPROVED",
                    "REJECTED"

                ],

                default: "PENDING"

            },


            // ---------------------------------
            // Admin
            // ---------------------------------

            isAdmin: {

                type: Boolean,

                default: false

            },


            // ---------------------------------
            // Bot Access
            // ---------------------------------

            botAccess: {

                type: Boolean,

                default: false

            },


            // ---------------------------------
            // Bot Active
            // ---------------------------------

            botActive: {

                type: Boolean,

                default: false

            },


            // ---------------------------------
            // Wallet
            // ---------------------------------

            walletId: {

                type:
                    mongoose.Schema.Types.ObjectId,

                ref:
                    "Wallet",

                default: null

            },


            // ---------------------------------
            // Account Status
            // ---------------------------------

            status: {

                type: String,

                enum: [

                    "PENDING",
                    "ACTIVE",
                    "BLOCKED"

                ],

                default: "PENDING"

            },


            // ---------------------------------
            // Last Login
            // ---------------------------------

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
// Export Model :: M
// =====================================

const User =
    mongoose.models.User ||
    mongoose.model(
        "User",
        UserSchema
    );


export default User;