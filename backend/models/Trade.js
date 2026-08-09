// =====================================
// Trade Model:: M
// AutoTrade AI
// Real Trade Database Model
// File: backend/models/Trade.js
// =====================================

import mongoose from "mongoose";


// =====================================
// Trade Schema:: M
// =====================================

const tradeSchema = new mongoose.Schema(

    {

        // =====================================
        // User Reference:: M
        // =====================================

        userId: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref: "User",

            required: true,

            index: true

        },


        // =====================================
        // Market:: M
        // =====================================

        symbol: {

            type: String,

            required: true,

            uppercase: true,

            trim: true,

            index: true

        },


        market: {

            type: String,

            enum: [

                "crypto",

                "forex",

                "stocks",

                "other"

            ],

            default: "crypto",

            index: true

        },


        // =====================================
        // Trade Side:: M
        // =====================================

        side: {

            type: String,

            enum: [

                "BUY",

                "SELL"

            ],

            required: true

        },


        // =====================================
        // Trade Quantity:: M
        // =====================================

        quantity: {

            type: Number,

            required: true,

            min: 0

        },


        // =====================================
        // Entry Price:: M
        // =====================================

        entryPrice: {

            type: Number,

            required: true,

            min: 0

        },


        // =====================================
        // Exit Price:: M
        // =====================================

        exitPrice: {

            type: Number,

            default: null,

            min: 0

        },


        // =====================================
        // Stop Loss:: M
        // =====================================

        stopLossPrice: {

            type: Number,

            default: null,

            min: 0

        },


        // =====================================
        // Take Profit:: M
        // =====================================

        takeProfitPrice: {

            type: Number,

            default: null,

            min: 0

        },


        // =====================================
        // Profit / Loss USD:: M
        // =====================================

        profitUSD: {

            type: Number,

            default: 0

        },


        // =====================================
        // Trading Fees USD:: M
        // =====================================

        feesUSD: {

            type: Number,

            default: 0,

            min: 0

        },


        // =====================================
        // Net Profit USD:: M
        // =====================================

        netProfitUSD: {

            type: Number,

            default: 0

        },


        // =====================================
        // AI Signal:: M
        // =====================================

        aiSignal: {

            type: String,

            enum: [

                "BUY",

                "SELL",

                "WAIT"

            ],

            default: "WAIT"

        },


        // =====================================
        // AI Confidence:: M
        // =====================================

        aiConfidence: {

            type: Number,

            default: 0,

            min: 0,

            max: 100

        },


        // =====================================
        // AI Reason:: M
        // =====================================

        aiReason: {

            type: String,

            default: "",

            trim: true

        },


        // =====================================
        // Trade Status:: M
        // =====================================

        status: {

            type: String,

            enum: [

                "OPEN",

                "CLOSED",

                "CANCELLED",

                "FAILED"

            ],

            default: "OPEN",

            index: true

        },


        // =====================================
        // External Broker Order ID:: M
        // =====================================

        externalOrderId: {

            type: String,

            default: null,

            index: true

        },


        // =====================================
        // External Order Status:: M
        // =====================================

        externalStatus: {

            type: String,

            default: null

        },


        // =====================================
        // Error Message:: M
        // =====================================

        errorMessage: {

            type: String,

            default: ""

        },


        // =====================================
        // Trade Open Time:: M
        // =====================================

        openedAt: {

            type: Date,

            default: Date.now

        },


        // =====================================
        // Trade Close Time:: M
        // =====================================

        closedAt: {

            type: Date,

            default: null

        }

    },

    {

        timestamps: true

    }

);


// =====================================
// Database Indexes:: M
// =====================================

tradeSchema.index({

    userId: 1,

    createdAt: -1

});


tradeSchema.index({

    status: 1,

    createdAt: -1

});


// =====================================
// Trade Model:: M
// =====================================

const Trade = mongoose.model(

    "Trade",

    tradeSchema

);


export default Trade;
