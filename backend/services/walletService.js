// =====================================
// Wallet Model:: M
// AutoTrade AI
// Wallet Database Model
// File: backend/models/Wallet.js
// =====================================

import mongoose from "mongoose";


const walletSchema = new mongoose.Schema(

    {

        // =====================================
        // User Reference
        // =====================================

        userId: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,

            unique: true,

            index: true

        },


        // =====================================
        // Balance
        // =====================================

        balance: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Total Profit
        // =====================================

        totalProfit: {

            type: Number,

            default: 0

        },


        // =====================================
        // Total Trades
        // =====================================

        totalTrades: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Withdrawable Balance
        // =====================================

        withdrawable: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Currency
        // =====================================

        currency: {

            type: String,

            default: "USDT",

            uppercase: true,

            trim: true

        },


        // =====================================
        // Wallet Status
        // =====================================

        status: {

            type: String,

            enum: [

                "ACTIVE",

                "LOCKED"

            ],

            default: "ACTIVE"

        }

    },

    {

        timestamps: true

    }

);


// =====================================
// Wallet Model
// =====================================

const Wallet = mongoose.model(

    "Wallet",

    walletSchema

);


export default Wallet;
