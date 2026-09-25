// =====================================
// AutoTrade AI
// Risk Manager Engine
// مدیریت ریسک و حجم معاملات
// File: backend/engine/riskManager.js
// =====================================


// =====================================
// Default Settings
// =====================================

// حداکثر درصدی از موجودی که یک معامله
// می‌تواند به عنوان ارزش پوزیشن درگیر کند.
//
// مثال:
// Balance = 150 USDT
// Max Position = 20%
// Maximum Position Value = 30 USDT
//
const DEFAULT_MAX_POSITION_PERCENT = 20;


// =====================================
// Calculate Position Size
// =====================================
//
// هدف:
//
// 1. محاسبه مقدار ریسک
// 2. محاسبه حجم معامله بر اساس Stop Loss
// 3. جلوگیری از All-In
// 4. محدود کردن ارزش پوزیشن
//
// =====================================

export function calculatePositionSize({

    balance,

    riskPercent = 1,

    entryPrice,

    stopLossPrice,

    maxPositionPercent =
        DEFAULT_MAX_POSITION_PERCENT

}) {

    const numericBalance =
        Number(balance);


    const numericRiskPercent =
        Number(riskPercent);


    const numericEntryPrice =
        Number(entryPrice);


    const numericStopLossPrice =
        Number(stopLossPrice);


    const numericMaxPositionPercent =
        Number(maxPositionPercent);


    // =====================================
    // Validate Numbers
    // =====================================

    if (
        !Number.isFinite(
            numericBalance
        ) ||

        !Number.isFinite(
            numericRiskPercent
        ) ||

        !Number.isFinite(
            numericEntryPrice
        ) ||

        !Number.isFinite(
            numericStopLossPrice
        ) ||

        !Number.isFinite(
            numericMaxPositionPercent
        )
    ) {

        throw new Error(
            "Trading parameters must be valid numbers"
        );

    }


    // =====================================
    // Validate Balance
    // =====================================

    if (
        numericBalance <= 0
    ) {

        throw new Error(
            "Balance must be greater than zero"
        );

    }


    // =====================================
    // Validate Risk
    // =====================================

    if (
        numericRiskPercent <= 0 ||
        numericRiskPercent > 100
    ) {

        throw new Error(
            "Risk percentage must be between 0 and 100"
        );

    }


    // =====================================
    // Validate Position Limit
    // =====================================

    if (
        numericMaxPositionPercent <= 0 ||
        numericMaxPositionPercent > 100
    ) {

        throw new Error(
            "Maximum position percentage must be between 0 and 100"
        );

    }


    // =====================================
    // Validate Prices
    // =====================================

    if (
        numericEntryPrice <= 0 ||
        numericStopLossPrice <= 0
    ) {

        throw new Error(
            "Entry price and stop-loss price must be greater than zero"
        );

    }


    // =====================================
    // Calculate Price Risk
    // =====================================

    const priceRisk =
        Math.abs(

            numericEntryPrice -
            numericStopLossPrice

        );


    if (
        priceRisk <= 0
    ) {

        throw new Error(
            "Stop-loss price must be different from entry price"
        );

    }


    // =====================================
    // Calculate Risk Amount
    // =====================================
    //
    // مثال:
    //
    // Balance = 150 USDT
    // Risk = 1%
    //
    // Risk Amount = 1.5 USDT
    //
    // =====================================

    const riskAmount =
        numericBalance *
        (
            numericRiskPercent /
            100
        );


    // =====================================
    // Calculate Position From Risk
    // =====================================

    const riskBasedPositionSize =
        riskAmount /
        priceRisk;


    // =====================================
    // Maximum Position Value
    // =====================================
    //
    // مثال:
    //
    // Balance = 150 USDT
    // Max Position = 20%
    //
    // Maximum Position Value = 30 USDT
    //
    // =====================================

    const maxPositionValue =
        numericBalance *
        (
            numericMaxPositionPercent /
            100
        );


    // =====================================
    // Maximum Quantity
    // =====================================

    const maxPositionQuantity =
        maxPositionValue /
        numericEntryPrice;


    // =====================================
    // Final Position Size
    // =====================================
    //
    // همیشه کمترین مقدار انتخاب می‌شود:
    //
    // Risk-based quantity
    // یا
    // Maximum allowed quantity
    //
    // بنابراین معامله All-In نمی‌شود.
    //
    // =====================================

    const positionSize =
        Math.min(

            riskBasedPositionSize,

            maxPositionQuantity

        );


    if (
        !Number.isFinite(
            positionSize
        ) ||

        positionSize <= 0
    ) {

        throw new Error(
            "Calculated position size is invalid"
        );

    }


    // =====================================
    // Actual Position Value
    // =====================================

    const positionValue =
        positionSize *
        numericEntryPrice;


    // =====================================
    // Actual Risk At Stop Loss
    // =====================================

    const actualRisk =
        positionSize *
        priceRisk;


    // =====================================
    // Return
    // =====================================

    return {

        riskAmount:
            Number(
                riskAmount.toFixed(8)
            ),

        actualRisk:
            Number(
                actualRisk.toFixed(8)
            ),

        positionSize:
            Number(
                positionSize.toFixed(8)
            ),

        positionValue:
            Number(
                positionValue.toFixed(8)
            ),

        maxPositionValue:
            Number(
                maxPositionValue.toFixed(8)
            ),

        maxPositionPercent:
            numericMaxPositionPercent,

        riskPercent:
            numericRiskPercent

    };

}


// =====================================
// Check Trade Permission
// =====================================

export function checkTradePermission({

    activeTrades = 0,

    maxOpenTrades = 5,

    dailyLossAmount = 0,

    balance = 0,

    maxDailyLossPercent = 5

}) {

    const openTrades =
        Number(activeTrades);


    const maximumOpenTrades =
        Number(maxOpenTrades);


    const lossAmount =
        Number(dailyLossAmount);


    const accountBalance =
        Number(balance);


    const maximumDailyLossPercent =
        Number(maxDailyLossPercent);


    // =====================================
    // Validate Parameters
    // =====================================

    if (
        !Number.isFinite(
            openTrades
        ) ||

        !Number.isFinite(
            maximumOpenTrades
        ) ||

        !Number.isFinite(
            lossAmount
        ) ||

        !Number.isFinite(
            accountBalance
        ) ||

        !Number.isFinite(
            maximumDailyLossPercent
        )
    ) {

        return {

            allowed:
                false,

            reason:
                "Invalid risk parameters"

        };

    }


    // =====================================
    // Validate Open Trade Limits
    // =====================================

    if (
        openTrades < 0 ||
        maximumOpenTrades <= 0
    ) {

        return {

            allowed:
                false,

            reason:
                "Invalid open trade limits"

        };

    }


    // =====================================
    // Maximum Open Trades
    // =====================================

    if (
        openTrades >=
        maximumOpenTrades
    ) {

        return {

            allowed:
                false,

            reason:
                "Maximum open trades reached"

        };

    }


    // =====================================
    // Balance Check
    // =====================================

    if (
        accountBalance <= 0
    ) {

        return {

            allowed:
                false,

            reason:
                "Account balance is unavailable"

        };

    }


    // =====================================
    // Daily Loss Limit
    // =====================================

    if (
        maximumDailyLossPercent <= 0
    ) {

        return {

            allowed:
                false,

            reason:
                "Invalid daily loss limit"

        };

    }


    // =====================================
    // Calculate Daily Loss %
    // =====================================

    const dailyLossPercent =
        (
            Math.abs(
                lossAmount
            ) /
            accountBalance
        ) *
        100;


    // =====================================
    // Stop Trading
    // =====================================

    if (
        dailyLossPercent >=
        maximumDailyLossPercent
    ) {

        return {

            allowed:
                false,

            reason:
                "Daily loss limit reached",

            dailyLossPercent:
                Number(
                    dailyLossPercent.toFixed(4)
                )

        };

    }


    // =====================================
    // Approved
    // =====================================

    return {

        allowed:
            true,

        reason:
            "Trade approved",

        dailyLossPercent:
            Number(
                dailyLossPercent.toFixed(4)
            )

    };

}


// =====================================
// Calculate Stop Loss / Take Profit
// =====================================

export function calculateTargets({

    entryPrice,

    riskReward = 2,

    stopLossPrice,

    side

}) {

    const numericEntryPrice =
        Number(entryPrice);


    const numericRiskReward =
        Number(riskReward);


    const numericStopLossPrice =
        Number(stopLossPrice);


    // =====================================
    // Validate Numbers
    // =====================================

    if (
        !Number.isFinite(
            numericEntryPrice
        ) ||

        !Number.isFinite(
            numericRiskReward
        ) ||

        !Number.isFinite(
            numericStopLossPrice
        )
    ) {

        throw new Error(
            "Target parameters must be valid numbers"
        );

    }


    // =====================================
    // Validate Entry
    // =====================================

    if (
        numericEntryPrice <= 0
    ) {

        throw new Error(
            "Entry price must be greater than zero"
        );

    }


    // =====================================
    // Validate Stop Loss
    // =====================================

    if (
        numericStopLossPrice <= 0
    ) {

        throw new Error(
            "Stop-loss price must be greater than zero"
        );

    }


    // =====================================
    // Validate Risk Reward
    // =====================================

    if (
        numericRiskReward <= 0
    ) {

        throw new Error(
            "Risk/reward ratio must be greater than zero"
        );

    }


    // =====================================
    // Validate Side
    // =====================================

    if (
        side !== "BUY" &&
        side !== "SELL"
    ) {

        throw new Error(
            "Trade side must be BUY or SELL"
        );

    }


    // =====================================
    // Calculate Risk Distance
    // =====================================

    const risk =
        Math.abs(

            numericEntryPrice -
            numericStopLossPrice

        );


    if (
        risk <= 0
    ) {

        throw new Error(
            "Stop-loss price must be different from entry price"
        );

    }


    let takeProfit;


    // =====================================
    // BUY
    // =====================================

    if (
        side === "BUY"
    ) {

        if (
            numericStopLossPrice >=
            numericEntryPrice
        ) {

            throw new Error(
                "For BUY, stop-loss must be below entry price"
            );

        }


        takeProfit =
            numericEntryPrice +
            (
                risk *
                numericRiskReward
            );

    }


    // =====================================
    // SELL
    // =====================================

    if (
        side === "SELL"
    ) {

        if (
            numericStopLossPrice <=
            numericEntryPrice
        ) {

            throw new Error(
                "For SELL, stop-loss must be above entry price"
            );

        }


        takeProfit =
            numericEntryPrice -
            (
                risk *
                numericRiskReward
            );

    }


    // =====================================
    // Return Targets
    // =====================================

    return {

        stopLoss:
            Number(
                numericStopLossPrice.toFixed(8)
            ),

        takeProfit:
            Number(
                takeProfit.toFixed(8)
            ),

        riskReward:
            numericRiskReward

    };

}


// =====================================
// Default Export
// =====================================

export default {

    calculatePositionSize,

    checkTradePermission,

    calculateTargets

};