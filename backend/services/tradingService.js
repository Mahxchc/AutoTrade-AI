// =====================================
// Trading Service:: M
// AutoTrade AI
// Execution Layer
// File: backend/services/tradingService.js
// =====================================


import {
    placeOrder,
    checkOrderStatus
} from "./exchangeService.js";


// =====================================
// Execute Trade
// =====================================

export async function executeTrade({
    signal,
    symbol,
    quantity,
    market = "crypto",
    orderType = "MARKET",
    stopLossPrice = null,
    takeProfitPrice = null
}) {

    // =====================================
    // Validate Trade Data
    // =====================================

    if (!symbol) {
        throw new Error(
            "Symbol is required"
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
            "Trade quantity must be greater than zero"
        );
    }


    // =====================================
    // AI WAIT Signal
    // =====================================

    if (signal === "WAIT") {

        return {
            executed: false,

            status: "WAITING",

            reason:
                "AI decided to wait",

            order: null
        };
    }


    // =====================================
    // Validate Signal
    // =====================================

    if (
        signal !== "BUY" &&
        signal !== "SELL"
    ) {
        throw new Error(
            "Invalid trading signal"
        );
    }


    // =====================================
    // Send Order To Exchange
    // =====================================

    const order =
        await placeOrder({

            symbol,

            side: signal,

            quantity:
                numericQuantity,

            market,

            orderType,

            stopLossPrice,

            takeProfitPrice

        });


    // =====================================
    // IMPORTANT
    // =====================================
    //
    // The exchange must confirm the order.
    //
    // We do NOT automatically claim that
    // the trade was executed.
    // =====================================

    if (
        !order ||
        !order.orderId
    ) {

        return {

            executed: false,

            status: "NOT_CONFIRMED",

            reason:
                "Exchange did not provide a confirmed order ID",

            order:
                order || null

        };
    }


    // =====================================
    // Check External Order Status
    // =====================================

    const orderStatus =
        await checkOrderStatus({

            orderId:
                order.orderId

        });


    // =====================================
    // Determine Execution Result
    // =====================================

    const confirmedStatuses = [
        "FILLED",
        "COMPLETED",
        "EXECUTED"
    ];


    const executed =
        confirmedStatuses.includes(
            String(
                orderStatus.status
            ).toUpperCase()
        );


    // =====================================
    // Return Result
    // =====================================

    return {

        executed,

        status:
            orderStatus.status,

        order,

        orderStatus

    };
}
