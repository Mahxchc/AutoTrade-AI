// =====================================
// Wallet Model:: M
// AutoTrade AI
// Wallet Database Model
// File: backend/models/Wallet.js
// =====================================

import mongoose from "mongoose";


// =====================================
// Wallet Schema:: M
// =====================================

const walletSchema = new mongoose.Schema(

    {

        // =====================================
        // User Reference:: M
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
        // USD Balance:: M
        // =====================================

        balanceUSD: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Total Profit USD:: M
        // =====================================

        totalProfitUSD: {

            type: Number,

            default: 0

        },


        // =====================================
        // Total Trades:: M
        // =====================================

        totalTrades: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Withdrawable USD:: M
        // =====================================

        withdrawableUSD: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Display Currency:: M
        // =====================================

        currency: {

            type: String,

            default: "USD",

            uppercase: true,

            trim: true

        },


        // =====================================
        // Wallet Status:: M
        // =====================================

        status: {

            type: String,

            enum: [

                "ACTIVE",

                "LOCKED"

            ],

            default: "ACTIVE",

            index: true

        },


        // =====================================
        // Last Balance Update:: M
        // =====================================

        lastBalanceUpdate: {

            type: Date,

            default: Date.now

        }

    },

    {

        timestamps: true

    }

);


// =====================================
// Wallet Model:: M
// =====================================

const Wallet = mongoose.model(

    "Wallet",

    walletSchema

);


export default Wallet;
