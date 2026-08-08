// =====================================
// AutoTrade AI
// Trading Service
// Execution Layer
// =====================================


const {
    placeOrder
} = require("./exchangeService");





// اجرای معامله

async function executeTrade({

    signal,

    symbol,

    amount

}) {



    if(
        !signal ||
        !symbol ||
        !amount
    ){

        throw new Error(
            "Invalid trade data"
        );

    }




    // اگر AI گفت صبر کن، معامله نکن

    if(signal === "WAIT"){


        return {


            executed:false,


            reason:
            "AI decided to wait"


        };


    }






    const order =
    await placeOrder({

        symbol,

        type:signal,

        amount

    });






    return {


        executed:true,


        order


    };

}




module.exports = {


    executeTrade


};
