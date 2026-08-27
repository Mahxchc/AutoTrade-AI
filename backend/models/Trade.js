// =====================================
// Trade Model :: M
// AutoTrade AI
// Real Trade Database Model
// File: backend/models/Trade.js
// =====================================

import mongoose from "mongoose";


// =====================================
// Trade Schema
// =====================================

const tradeSchema = new mongoose.Schema(

    {

        // =====================================
        // User Reference
        // =====================================

        userId: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref:
                "User",

            required:
                true,

            index:
                true

        },


        // =====================================
        // Market
        // =====================================

        symbol: {

            type:
                String,

            required:
                true,

            uppercase:
                true,

            trim:
                true,

            index:
                true

        },


        market: {

            type:
                String,

            enum: [

                "crypto",
                "forex",
                "stocks",
                "other"

            ],

            default:
                "crypto",

            index:
                true

        },


        // =====================================
        // Trade Side
        // =====================================

        side: {

            type:
                String,

            enum: [

                "BUY",
                "SELL"

            ],

            required:
                true

        },


        // =====================================
        // Trade Quantity
        // =====================================

        quantity: {

            type:
                Number,

            required:
                true,

            min:
                0,

            default:
                0

        },


        // =====================================
        // Entry Price
        // =====================================

        entryPrice: {

            type:
                Number,

            required:
                true,

            min:
                0

        },


        // =====================================
        // Exit Price
        // =====================================

        exitPrice: {

            type:
                Number,

            default:
                null,

            min:
                0

        },


        // =====================================
        // Stop Loss
        // =====================================

        stopLossPrice: {

            type:
                Number,

            default:
                null,

            min:
                0

        },


        // =====================================
        // Take Profit
        // =====================================

        takeProfitPrice: {

            type:
                Number,

            default:
                null,

            min:
                0

        },


        // =====================================
        // Gross Profit / Loss USD
        // =====================================

        profitUSD: {

            type:
                Number,

            default:
                0

        },


        // =====================================
        // Trading Fees USD
        // =====================================

        feesUSD: {

            type:
                Number,

            default:
                0,

            min:
                0

        },


        // =====================================
        // Net Profit / Loss USD
        // =====================================

        netProfitUSD: {

            type:
                Number,

            default:
                0

        },


        // =====================================
        // AI Signal
        // =====================================

        aiSignal: {

            type:
                String,

            enum: [

                "BUY",
                "SELL",
                "WAIT"

            ],

            default:
                "WAIT"

        },


        // =====================================
        // AI Confidence
        // =====================================

        aiConfidence: {

            type:
                Number,

            default:
                0,

            min:
                0,

            max:
                100

        },


        // =====================================
        // AI Reason
        // =====================================

        aiReason: {

            type:
                String,

            default:
                "",

            trim:
                true

        },


        // =====================================
        // Trade Status
        // =====================================

        status: {

            type:
                String,

            enum: [

                "OPEN",
                "CLOSED",
                "CANCELLED",
                "FAILED"

            ],

            default:
                "OPEN",

            index:
                true

        },


        // =====================================
        // External Broker Order ID
        // =====================================

        externalOrderId: {

            type:
                String,

            default:
                null,

            index:
                true,

            trim:
                true

        },


        // =====================================
        // External Order Status
        // =====================================

        externalStatus: {

            type:
                String,

            default:
                null,

            trim:
                true

        },


        // =====================================
        // Error Message
        // =====================================

        errorMessage: {

            type:
                String,

            default:
                "",

            trim:
                true

        },


        // =====================================
        // Trade Open Time
        // =====================================

        openedAt: {

            type:
                Date,

            default:
                Date.now

        },


        // =====================================
        // Trade Close Time
        // =====================================

        closedAt: {

            type:
                Date,

            default:
                null

        }

    },

    {

        timestamps:
            true

    }

);


// =====================================
// Database Indexes
// =====================================

tradeSchema.index({

    userId:
        1,

    createdAt:
        -1

});


tradeSchema.index({

    status:
        1,

    createdAt:
        -1

});


tradeSchema.index({

    userId:
        1,

    status:
        1,

    createdAt:
        -1

});


// =====================================
// Prevent Invalid Closed Trade
// =====================================

tradeSchema.pre(
    "save",
    function (next) {

        try {

            if (
                this.status ===
                "CLOSED"
            ) {

                if (
                    this.exitPrice ===
                    null ||
                    this.exitPrice ===
                    undefined
                ) {

                    return next(
                        new Error(
                            "Closed trade must have an exit price"
                        )
                    );

                }


                if (
                    !this.closedAt
                ) {

                    this.closedAt =
                        new Date();

                }

            }


            next();

        }

        catch (error) {

            next(error);

        }

    }
);


// =====================================
// Normalize Profit Values
// =====================================

tradeSchema.pre(
    "save",
    function (next) {

        try {

            this.profitUSD =
                Number(
                    this.profitUSD
                ) || 0;


            this.feesUSD =
                Math.max(
                    0,
                    Number(
                        this.feesUSD
                    ) || 0
                );


            this.netProfitUSD =
                Number(
                    this.netProfitUSD
                ) || 0;


            next();

        }

        catch (error) {

            next(error);

        }

    }
);


// =====================================
// Trade Model
// =====================================

const Trade =
    mongoose.model(
        "Trade",
        tradeSchema
    );


export default Trade;