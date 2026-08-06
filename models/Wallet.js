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


    // نوع دارایی
    currency: {
        type: String,
        default: "USDT"
    },


    // موجودی ارز دیجیتال
    balance: {
        type: Number,
        default: 0
    },


    // موجودی قفل شده در معاملات
    lockedBalance: {
        type: Number,
        default: 0
    },


    // موجودی ریالی
    tomanBalance: {
        type: Number,
        default: 0
    },


    // شماره شبا برای برداشت ریالی
    shebaNumber: {
        type: String,
        default: null
    },


    // نام صاحب حساب
    accountOwnerName: {
        type: String,
        default: null
    },


    // مجموع واریزها
    totalDeposit: {
        type: Number,
        default: 0
    },


    // مجموع برداشت‌ها
    totalWithdraw: {
        type: Number,
        default: 0
    },


    // وضعیت درخواست برداشت
    withdrawStatus: {
        type: String,
        enum: [
            "none",
            "pending",
            "approved",
            "paid",
            "rejected"
        ],
        default: "none"
    },


    // آخرین درخواست برداشت
    lastWithdrawDate: {
        type: Date,
        default: null
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
