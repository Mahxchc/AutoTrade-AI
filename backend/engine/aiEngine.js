// =====================================
// AutoTrade AI
// AI Engine
// =====================================
/
/ =====================================
// Market Analysis
// =====================================
e
xport function analyzeMarket({
    symbol,
    priceData = []
}) {
    if (!symbol) {
        throw new Error("Symbol is required");
    }
 
   if (!Array.isArray(priceData)) {
        throw new Error("priceData must be an array");
   } 
 
   if (priceData.length < 2) {
        return {
            symbol,
            action: "HOLD",
            confidence: 0,
            reason: "Not enough market data"
        };
   } 
 
   const currentPrice = Number(
        priceData[priceData.length - 1]
    );
 
   const previousPrice = Number(
        priceData[priceData.length - 2]
    );
 
   if (
        !Number.isFinite(currentPrice) ||
        !Number.isFinite(previousPrice) ||
        currentPrice <= 0 ||
        previousPrice <= 0
    ) {
        return {
            symbol,
            action: "HOLD",
            confidence: 0,
            reason: "Invalid market data"
        };
   } 
 
   const priceChange =
        ((currentPrice - previousPrice) / previousPrice) * 100;
 
   /*
     * This is currently a basic market signal layer.
     *
     * It is NOT presented as a guaranteed AI prediction.
     * A production strategy should later use:
     *
     * - reliable market data
     * - technical indicators
     * - risk rules
     * - strategy configuration
     * - optional external AI model
     */
 
   let action = "HOLD";
    let confidence = 0;
    let reason = "No clear signal";
 
   if (priceChange > 0) {
        action = "BUY";
 
       confidence = Math.min(
            90,
            50 + Math.abs(priceChange) * 5
        );
 
       reason = "Positive price movement";
   } 
 
   if (priceChange < 0) {
        action = "SELL";
 
       confidence = Math.min(
            90,
            50 + Math.abs(priceChange) * 5
        );
 
       reason = "Negative price movement";
   } 
 
   return {
        symbol,
        action,
        confidence: Number(
            confidence.toFixed(2)
        ),
        priceChange: Number(
            priceChange.toFixed(4)
        ),
        reason,
        timestamp: new Date()
   } ;
}

// =====================================
// Validate Signal
// =====================================
e
xport function validateSignal({
    confidence,
    minimumConfidence = 70
}) {
    const numericConfidence = Number(confidence);
 
   if (!Number.isFinite(numericConfidence)) {
        return false;
   } 
 
   return numericConfidence >= minimumConfidence;
}    
