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


    walletId: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Wallet",

        default: null

    },


    botActive: {

        type: Boolean,

        default: false

    },


    createdAt: {

        type: Date,

        default: Date.now

    },


    lastLogin: {

        type: Date,

        default: Date.now

    }


});



const User = mongoose.model(
    "User",
    userSchema
);



export default User;
