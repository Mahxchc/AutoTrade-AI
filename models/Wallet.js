// =====================================
// AutoTrade AI
// Wallet Model
// =====================================

import mongoose from "mongoose";


const walletSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


    currency: {
        type: String,
        default: "USDT"
    },


    balance: {
        type: Number,
        default: 0
    },


    lockedBalance: {
        type: Number,
        default: 0
    },


    totalDeposit: {
        type: Number,
        default: 0
    },


    totalWithdraw: {
        type: Number,
        default: 0
    },


    lastUpdate: {
        type: Date,
        default: Date.now
    },


    createdAt: {
        type: Date,
        default: Date.now
    }


});


const Wallet = mongoose.model(
    "Wallet",
    walletSchema
);


export default Wallet;
