// =====================================
// Exchange Service:: M
// AutoTrade AI
// Market Connection Layer
// File: backend/services/exchangeService.js
// =====================================


// =====================================
// Configuration
// =====================================

const EXCHANGE_API_URL =
    process.env.EXCHANGE_API_URL || "";

const EXCHANGE_API_KEY =
    process.env.EXCHANGE_API_KEY || "";

const EXCHANGE_API_SECRET =
    process.env.EXCHANGE_API_SECRET || "";


// =====================================
// Validate Exchange Configuration
// =====================================

function requireExchangeConfiguration() {

    if (!EXCHANGE_API_URL) {
        throw new Error(
            "EXCHANGE_API_URL is not configured"
        );
    }

    if (!EXCHANGE_API_KEY) {
        throw new Error(
            "EXCHANGE_API_KEY is not configured"
        );
    }

    if (!EXCHANGE_API_SECRET) {
        throw new Error(
            "EXCHANGE_API_SECRET is not configured"
        );
    }
}


// =====================================
// Get Market Price
// =====================================

export async function getMarketPrice({
    symbol,
    market = "crypto"
}) {

    if (!symbol) {
        throw new Error(
            "Symbol is required"
        );
    }

    if (!market) {
        throw new Error(
            "Market is required"
        );
    }

    requireExchangeConfiguration();

    /*
     * The exact API request depends on
     * the selected exchange.
     *
     * No fake market price is returned.
     */

    throw new Error(
        "Exchange market-data adapter is not configured"
    );
}


// =====================================
// Place Order
// =====================================

export async function placeOrder({
    symbol,
    side,
    quantity,
    market = "crypto",
    orderType = "MARKET",
    stopLossPrice = null,
    takeProfitPrice = null
}) {

    if (!symbol) {
        throw new Error(
            "Symbol is required"
        );
    }

    if (
        side !== "BUY" &&
        side !== "SELL"
    ) {
        throw new Error(
            "Order side must be BUY or SELL"
        );
    }

    const numericQuantity =
        Number(quantity);

    if (
        !Number.isFinite(
            numericQuantity
        ) ||
        numericQuantity <= 0
    ) {
        throw new Error(
            "Order quantity must be greater than zero"
        );
    }

    if (!market) {
        throw new Error(
            "Market is required"
        );
    }

    if (!orderType) {
        throw new Error(
            "Order type is required"
        );
    }

    requireExchangeConfiguration();

    /*
     * IMPORTANT:
     *
     * Do not return success:true here.
     *
     * A real order is only successful after
     * the selected exchange confirms it.
     *
     * The exact authentication, signature,
     * endpoint and request format depend on
     * the exchange we select.
     */

    throw new Error(
        "Exchange order adapter is not configured"
    );
}


// =====================================
// Check Order Status
// =====================================

export async function checkOrderStatus({
    orderId
}) {

    if (!orderId) {
        throw new Error(
            "Order ID is required"
        );
    }

    requireExchangeConfiguration();

    /*
     * The real exchange API will be queried
     * here after the exchange adapter is
     * configured.
     */

    throw new Error(
        "Exchange order-status adapter is not configured"
    );
}
