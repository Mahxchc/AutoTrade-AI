// =====================================
// AutoTrade AI
// User Model
// =====================================

import mongoose from "mongoose";


const userSchema = new mongoose.Schema({

    telegramId: {
        type: String,
        required: true,
        unique: true
    },


    username: {
        type: String,
        default: ""
    },


    firstName: {
        type: String,
        default: ""
    },


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


    isActive: {
        type: Boolean,
        default: false
    },


    createdAt: {
        type: Date,
        default: Date.now
    }


});



const User = mongoose.model(
    "User",
    userSchema
);



export default User;
