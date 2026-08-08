// =====================================
// AutoTrade AI
// User Service
// User Management Layer
// =====================================


import User from "../models/User.js";




// پیدا کردن یا ساخت کاربر

async function getOrCreateUser({

    telegramId,

    username,

    firstName

}) {


    let user = await User.findOne({

        telegramId

    });




    if(!user){


        user = await User.create({

            telegramId,

            username,

            firstName

        });


    }



    user.lastLogin = new Date();


    await user.save();



    return user;


}






// گرفتن اطلاعات کاربر

async function getUserInfo(telegramId){


    const user =
    await User.findOne({

        telegramId

    });



    return user;


}






// فعال کردن ربات

async function activateBot(telegramId){


    const user =
    await User.findOne({

        telegramId

    });



    if(!user){

        throw new Error(
            "User not found"
        );

    }



    user.botActive = true;


    await user.save();



    return user;


}






module.exports = {

    getOrCreateUser,

    getUserInfo,

    activateBot

};
