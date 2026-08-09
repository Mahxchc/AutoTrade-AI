// =====================================
// AutoTrade AI
// AI Service
// Decision Layer
// =====================================

import {
    analyzeMarket as analyzeMarketEngine,
    validateSignal
} from "../engine/aiEngine.js";


// =====================================
// Analyze Market
// =====================================

export async function analyzeMarket({
    symbol,
    marketData = {}
}) {
    if (!symbol) {
        throw new Error(
            "Symbol is required"
        );
    }

    // =====================================
    // Extract Price Data
    // =====================================

    const priceData =
        Array.isArray(
            marketData.priceData
        )
            ? marketData.priceData
            : [];

    // =====================================
    // Run AI / Strategy Engine
    // =====================================

    const analysis =
        analyzeMarketEngine({
            symbol,
            priceData
        });

    return {
        symbol: analysis.symbol,

        decision:
            analysis.action,

        confidence:
            analysis.confidence,

        analysis: {
            reason:
                analysis.reason,

            priceChange:
                analysis.priceChange ?? 0
        },

        timestamp:
            analysis.timestamp ||
            new Date()
    };
}


// =====================================
// Generate Signal
// =====================================

export async function generateSignal({
    symbol,
    marketData = {},
    minimumConfidence = 70
}) {
    const result =
        await analyzeMarket({
            symbol,
            marketData
        });

    const valid =
        validateSignal({
            confidence:
                result.confidence,

            minimumConfidence
        });

    return {
        symbol,

        signal:
            valid
                ? result.decision
                : "WAIT",

        confidence:
            result.confidence,

        valid,

        analysis:
            result.analysis,

        createdAt:
            new Date()
    };
}
