// =====================================
// AutoTrade AI
// Risk Manager Engine
// Real Trading Risk Control
// =====================================



// محاسبه مقدار مجاز ورود به معامله

export function calculatePositionSize({

    balance,

    riskPercent = 1,

    entryPrice,

    stopLossPrice


}){


    if(

        balance <= 0 ||

        entryPrice <= 0 ||

        stopLossPrice <= 0

    ){

        throw new Error(
            "Invalid trading parameters"
        );

    }



    const riskAmount =

        balance *

        (riskPercent / 100);



    const priceRisk =

        Math.abs(

            entryPrice -

            stopLossPrice

        );



    const positionSize =

        riskAmount /

        priceRisk;



    return {


        riskAmount,


        positionSize,


        riskPercent


    };


}





// بررسی اجازه باز کردن معامله

export function checkTradePermission({

    activeTrades,

    maxOpenTrades = 5,

    dailyLoss,

    maxDailyLossPercent = 5

}){



    if(

        activeTrades >= maxOpenTrades

    ){

        return {


            allowed:false,


            reason:
            "Maximum open trades reached"


        };

    }





    if(

        dailyLoss >= maxDailyLossPercent

    ){

        return {


            allowed:false,


            reason:
            "Daily loss limit reached"


        };

    }





    return {


        allowed:true,


        reason:
        "Trade approved"


    };


}






// محاسبه حد سود و ضرر

export function calculateTargets({

    entryPrice,

    riskReward = 2,

    stopLossPrice,

    type

}){


    const risk =

        Math.abs(

            entryPrice -

            stopLossPrice

        );



    let takeProfit;



    if(type === "BUY"){


        takeProfit =

            entryPrice +

            (risk * riskReward);


    }

    else{


        takeProfit =

            entryPrice -

            (risk * riskReward);


    }





    return {


        stopLoss: stopLossPrice,


        takeProfit


    };


          }
