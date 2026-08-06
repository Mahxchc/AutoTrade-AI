// =====================================
// AutoTrade AI
// Bot Model
// =====================================

import mongoose from "mongoose";


const botSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


    status: {
        type: String,
        enum: [
            "ACTIVE",
            "STOPPED"
        ],
        default: "STOPPED"
    },


    strategy: {
        type: String,
        default: "AI Scalping"
    },


    market: {
        type: String,
        default: "crypto"
    },


    riskLevel: {
        type: String,
        enum: [
            "LOW",
            "MEDIUM",
            "HIGH"
        ],
        default: "MEDIUM"
    },


    lastSignal: {
        type: String,
        default: "WAIT"
    },


    accuracy: {
        type: Number,
        default: 0
    },


    confidence: {
        type: Number,
        default: 0
    },


    lastRun: {
        type: Date,
        default: null
    },


    createdAt: {
        type: Date,
        default: Date.now
    }


});


const Bot = mongoose.model(
    "Bot",
    botSchema
);


export default Bot;
