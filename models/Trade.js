// =====================================
// AutoTrade AI
// Trade Model
// =====================================

import mongoose from "mongoose";


const tradeSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


    symbol: {
        type: String,
        required: true
    },


    market: {
        type: String,
        default: "crypto"
    },


    type: {
        type: String,
        enum: [
            "BUY",
            "SELL"
        ],
        required: true
    },


    entryPrice: {
        type: Number,
        default: 0
    },


    exitPrice: {
        type: Number,
        default: 0
    },


    amount: {
        type: Number,
        default: 0
    },


    profit: {
        type: Number,
        default: 0
    },


    status: {
        type: String,
        enum: [
            "OPEN",
            "CLOSED"
        ],
        default: "OPEN"
    },


    createdAt: {
        type: Date,
        default: Date.now
    }


});


const Trade = mongoose.model(
    "Trade",
    tradeSchema
);


export default Trade;
