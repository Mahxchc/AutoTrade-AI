// =====================================
// AutoTrade AI
// Risk Manager Engine
// =====================================

// =====================================
// Calculate Position Size
// =====================================

export function calculatePositionSize({
    balance,
    riskPercent = 1,
    entryPrice,
    stopLossPrice
}) {
    const numericBalance = Number(balance);
    const numericRiskPercent = Number(riskPercent);
    const numericEntryPrice = Number(entryPrice);
    const numericStopLossPrice = Number(stopLossPrice);

    if (
        !Number.isFinite(numericBalance) ||
        !Number.isFinite(numericRiskPercent) ||
        !Number.isFinite(numericEntryPrice) ||
        !Number.isFinite(numericStopLossPrice)
    ) {
        throw new Error(
            "Trading parameters must be valid numbers"
        );
    }

    if (numericBalance <= 0) {
        throw new Error(
            "Balance must be greater than zero"
        );
    }

    if (
        numericRiskPercent <= 0 ||
        numericRiskPercent > 100
    ) {
        throw new Error(
            "Risk percentage must be between 0 and 100"
        );
    }

    if (
        numericEntryPrice <= 0 ||
        numericStopLossPrice <= 0
    ) {
        throw new Error(
            "Entry price and stop-loss price must be greater than zero"
        );
    }

    const priceRisk = Math.abs(
        numericEntryPrice -
        numericStopLossPrice
    );

    if (priceRisk <= 0) {
        throw new Error(
            "Stop-loss price must be different from entry price"
        );
    }

    const riskAmount =
        numericBalance *
        (numericRiskPercent / 100);

    const positionSize =
        riskAmount / priceRisk;

    return {
        riskAmount: Number(
            riskAmount.toFixed(8)
        ),

        positionSize: Number(
            positionSize.toFixed(8)
        ),

        riskPercent: numericRiskPercent
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
    const openTrades = Number(activeTrades);
    const maximumOpenTrades = Number(maxOpenTrades);

    const lossAmount = Number(dailyLossAmount);
    const accountBalance = Number(balance);
    const maximumDailyLossPercent =
        Number(maxDailyLossPercent);

    if (
        !Number.isFinite(openTrades) ||
        !Number.isFinite(maximumOpenTrades) ||
        !Number.isFinite(lossAmount) ||
        !Number.isFinite(accountBalance) ||
        !Number.isFinite(maximumDailyLossPercent)
    ) {
        return {
            allowed: false,
            reason: "Invalid risk parameters"
        };
    }

    if (
        openTrades < 0 ||
        maximumOpenTrades <= 0
    ) {
        return {
            allowed: false,
            reason: "Invalid open trade limits"
        };
    }

    if (openTrades >= maximumOpenTrades) {
        return {
            allowed: false,
            reason: "Maximum open trades reached"
        };
    }

    if (accountBalance <= 0) {
        return {
            allowed: false,
            reason: "Account balance is unavailable"
        };
    }

    if (maximumDailyLossPercent <= 0) {
        return {
            allowed: false,
            reason: "Invalid daily loss limit"
        };
    }

    const dailyLossPercent =
        (Math.abs(lossAmount) / accountBalance) * 100;

    if (
        dailyLossPercent >=
        maximumDailyLossPercent
    ) {
        return {
            allowed: false,
            reason: "Daily loss limit reached",
            dailyLossPercent: Number(
                dailyLossPercent.toFixed(4)
            )
        };
    }

    return {
        allowed: true,
        reason: "Trade approved",
        dailyLossPercent: Number(
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
    const numericEntryPrice = Number(entryPrice);
    const numericRiskReward = Number(riskReward);
    const numericStopLossPrice =
        Number(stopLossPrice);

    if (
        !Number.isFinite(numericEntryPrice) ||
        !Number.isFinite(numericRiskReward) ||
        !Number.isFinite(numericStopLossPrice)
    ) {
        throw new Error(
            "Target parameters must be valid numbers"
        );
    }

    if (numericEntryPrice <= 0) {
        throw new Error(
            "Entry price must be greater than zero"
        );
    }

    if (numericStopLossPrice <= 0) {
        throw new Error(
            "Stop-loss price must be greater than zero"
        );
    }

    if (numericRiskReward <= 0) {
        throw new Error(
            "Risk/reward ratio must be greater than zero"
        );
    }

    if (
        side !== "BUY" &&
        side !== "SELL"
    ) {
        throw new Error(
            "Trade side must be BUY or SELL"
        );
    }

    const risk = Math.abs(
        numericEntryPrice -
        numericStopLossPrice
    );

    if (risk <= 0) {
        throw new Error(
            "Stop-loss price must be different from entry price"
        );
    }

    let takeProfit;

    if (side === "BUY") {
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
            risk * numericRiskReward;
    }

    if (side === "SELL") {
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
            risk * numericRiskReward;
    }

    return {
        stopLoss: Number(
            numericStopLossPrice.toFixed(8)
        ),

        takeProfit: Number(
            takeProfit.toFixed(8)
        ),

        riskReward: numericRiskReward
    };
}
