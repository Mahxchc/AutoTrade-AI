// =====================================
// AutoTrade AI
// AI Engine:: M
// موتور تحلیل بازار و تولید سیگنال
// File: backend/engine/aiEngine.js
// =====================================


// =====================================
// Helpers:: M
// =====================================

function toNumber(value, fallback = 0) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


// =====================================
// Market Analysis:: M
// تحلیل بازار
// =====================================

export function analyzeMarket({

    symbol,

    priceData = []

}) {

    // =====================================
    // Validate Symbol:: M
    // =====================================

    if (
        typeof symbol !== "string" ||
        !symbol.trim()
    ) {

        throw new Error(
            "Symbol is required"
        );

    }


    // =====================================
    // Validate Market Data:: M
    // =====================================

    if (
        !Array.isArray(priceData)
    ) {

        throw new Error(
            "priceData must be an array"
        );

    }


    // =====================================
    // Not Enough Data:: M
    // =====================================

    if (
        priceData.length < 2
    ) {

        return {

            symbol:
                symbol
                    .trim()
                    .toUpperCase(),

            action:
                "HOLD",

            confidence:
                0,

            priceChange:
                0,

            reason:
                "Not enough market data",

            timestamp:
                new Date()

        };

    }


    // =====================================
    // Current Price:: M
    // =====================================

    const currentPrice =
        toNumber(
            priceData[
                priceData.length - 1
            ]
        );


    // =====================================
    // Previous Price:: M
    // =====================================

    const previousPrice =
        toNumber(
            priceData[
                priceData.length - 2
            ]
        );


    // =====================================
    // Validate Prices:: M
    // =====================================

    if (

        currentPrice <= 0 ||

        previousPrice <= 0

    ) {

        return {

            symbol:
                symbol
                    .trim()
                    .toUpperCase(),

            action:
                "HOLD",

            confidence:
                0,

            priceChange:
                0,

            reason:
                "Invalid market data",

            timestamp:
                new Date()

        };

    }


    // =====================================
    // Calculate Price Change:: M
    // =====================================

    const priceChange =
        (
            (
                currentPrice -
                previousPrice
            ) /
            previousPrice
        ) *
        100;


    const roundedPriceChange =
        Number(
            priceChange.toFixed(4)
        );


    // =====================================
    // Default Signal:: M
    // =====================================

    let action =
        "HOLD";


    let confidence =
        0;


    let reason =
        "No clear signal";


    // =====================================
    // BUY Signal:: M
    // =====================================

    if (
        priceChange > 0
    ) {

        action =
            "BUY";


        confidence =
            Math.min(

                90,

                50 +
                Math.abs(
                    priceChange
                ) *
                5

            );


        reason =
            "Positive price movement";

    }


    // =====================================
    // SELL Signal:: M
    // =====================================

    else if (
        priceChange < 0
    ) {

        action =
            "SELL";


        confidence =
            Math.min(

                90,

                50 +
                Math.abs(
                    priceChange
                ) *
                5

            );


        reason =
            "Negative price movement";

    }


    // =====================================
    // Return Analysis:: M
    // =====================================

    return {

        symbol:
            symbol
                .trim()
                .toUpperCase(),

        action,

        confidence:
            Number(
                confidence.toFixed(2)
            ),

        priceChange:
            roundedPriceChange,

        currentPrice,

        previousPrice,

        reason,

        timestamp:
            new Date()

    };

}


// =====================================
// Validate Signal:: M
// اعتبارسنجی سیگنال
// =====================================

export function validateSignal({

    action,

    confidence,

    minimumConfidence = 70

}) {

    // =====================================
    // Validate Action:: M
    // =====================================

    if (

        action !== "BUY" &&

        action !== "SELL"

    ) {

        return false;

    }


    // =====================================
    // Validate Confidence:: M
    // =====================================

    const numericConfidence =
        Number(
            confidence
        );


    if (
        !Number.isFinite(
            numericConfidence
        )
    ) {

        return false;

    }


    // =====================================
    // Validate Minimum Confidence:: M
    // =====================================

    const minimum =
        Number(
            minimumConfidence
        );


    if (

        !Number.isFinite(
            minimum
        ) ||

        minimum < 0 ||

        minimum > 100

    ) {

        return false;

    }


    return (
        numericConfidence >=
        minimum
    );

}


// =====================================
// Convert AI Signal:: M
// تبدیل خروجی AI به سیگنال معاملاتی
// =====================================

export function getTradingSignal({

    analysis,

    minimumConfidence = 70

}) {

    if (
        !analysis ||
        typeof analysis !== "object"
    ) {

        return {

            signal:
                "WAIT",

            confidence:
                0,

            approved:
                false,

            reason:
                "Invalid AI analysis"

        };

    }


    const action =
        String(
            analysis.action || "HOLD"
        )
        .toUpperCase();


    const confidence =
        Number(
            analysis.confidence || 0
        );


    // =====================================
    // HOLD → WAIT:: M
    // =====================================

    if (
        action === "HOLD"
    ) {

        return {

            signal:
                "WAIT",

            confidence:
                Number(
                    confidence.toFixed(2)
                ),

            approved:
                false,

            reason:
                analysis.reason ||
                "AI decided to wait"

        };

    }


    // =====================================
    // Validate BUY / SELL:: M
    // =====================================

    const valid =
        validateSignal({

            action,

            confidence,

            minimumConfidence

        });


    if (!valid) {

        return {

            signal:
                "WAIT",

            confidence:
                Number(
                    confidence.toFixed(2)
                ),

            approved:
                false,

            reason:
                "AI confidence is below minimum threshold"

        };

    }


    // =====================================
    // Approved Signal:: M
    // =====================================

    return {

        signal:
            action,

        confidence:
            Number(
                confidence.toFixed(2)
            ),

        approved:
            true,

        reason:
            analysis.reason ||
            "AI signal approved"

    };

}


// =====================================
// Default Export:: M
// =====================================

export default {

    analyzeMarket,

    validateSignal,

    getTradingSignal

};