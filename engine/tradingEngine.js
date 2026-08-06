// =====================================
// AutoTrade AI
// Trading Engine
// =====================================


import Trade from "../models/Trade.js";
import Wallet from "../models/Wallet.js";

import {
    checkTradePermission,
    calculatePositionSize
} from "./riskManager.js";





export async function openTrade({

    userId,

    symbol,

    market = "crypto",

    type,

    entryPrice,

    stopLossPrice,

    balance,

    riskPercent = 1

}){


    const permission = checkTradePermission({

        activeTrades: 0

    });



    if(!permission.allowed){


        throw new Error(
            permission.reason
        );


    }




    const position = calculatePositionSize({

        balance,

        riskPercent,

        entryPrice,

        stopLossPrice

    });





    const trade = await Trade.create({

        userId,

        symbol,

        market,

        type,

        entryPrice,

        amount:
        position.positionSize,

        status:"OPEN",

        aiReason:
        "AI Trading Signal"

    });





    return trade;


}







export async function closeTrade({

    tradeId,

    exitPrice

}){



    const trade = await Trade.findById(
        tradeId
    );



    if(!trade){


        throw new Error(
            "Trade not found"
        );


    }





    trade.exitPrice = exitPrice;


    trade.status = "CLOSED";


    trade.closedAt = new Date();




    const difference =

        trade.type === "BUY"

        ?

        exitPrice - trade.entryPrice

        :

        trade.entryPrice - exitPrice;




    trade.profit =

        difference *

        trade.amount;




    await trade.save();




    return trade;


}
