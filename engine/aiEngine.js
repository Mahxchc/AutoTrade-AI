// =====================================
// AutoTrade AI
// AI Engine
// =====================================



// تحلیل بازار

export function analyzeMarket({

    symbol,

    priceData = [],

}){


    if(!symbol){

        throw new Error(
            "Symbol is required"
        );

    }



    if(priceData.length < 2){


        return {

            action:"HOLD",

            confidence:0,

            reason:
            "Not enough market data"


        };

    }





    const currentPrice =

        priceData[
            priceData.length - 1
        ];



    const previousPrice =

        priceData[
            priceData.length - 2
        ];





    let action = "HOLD";

    let confidence = 50;

    let reason =
    "Market analysis";





    if(currentPrice > previousPrice){


        action = "BUY";


        confidence = 60;


        reason =
        "Positive price movement";


    }





    if(currentPrice < previousPrice){


        action = "SELL";


        confidence = 60;


        reason =
        "Negative price movement";


    }





    return {


        symbol,


        action,


        confidence,


        reason


    };


}






// بررسی اعتبار سیگنال AI

export function validateSignal({

    confidence,

    minimumConfidence = 70


}){


    return confidence >= minimumConfidence;


}
