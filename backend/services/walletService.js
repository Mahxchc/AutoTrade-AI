// =====================================
// AutoTrade AI
// Wallet Service
// Wallet Management Layer
// =====================================


const Wallet = require("../models/Wallet");



// ذخیره موقت کیف پول‌ها
// بعداً با Database جایگزین می‌شود

const wallets = {};




// گرفتن یا ساخت کیف پول کاربر

function getWallet(userId){


    if(!wallets[userId]){


        wallets[userId] =
            new Wallet({

                userId

            });


    }


    return wallets[userId];


}






// اضافه کردن سود

function addProfit({

    userId,

    amount

}){


    const wallet =
        getWallet(userId);



    wallet.addProfit(amount);



    return wallet.getInfo();


}






// ثبت معامله

function registerTrade(userId){


    const wallet =
        getWallet(userId);



    wallet.addTrade();



    return wallet.getInfo();


}






// برداشت

function withdraw({

    userId,

    amount

}){


    const wallet =
        getWallet(userId);



    wallet.withdraw(amount);



    return wallet.getInfo();


}






module.exports = {


    getWallet,

    addProfit,

    registerTrade,

    withdraw


};
