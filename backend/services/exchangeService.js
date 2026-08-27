// =====================================
// Exchange Service:: M
// AutoTrade AI
// Market Connection Layer
// File: backend/services/exchangeService.js
// =====================================

import crypto from "crypto";


// =====================================
// Configuration:: M
// =====================================

const EXCHANGE_API_URL =
    process.env.EXCHANGE_API_URL || "";

const EXCHANGE_API_KEY =
    process.env.EXCHANGE_API_KEY || "";

const EXCHANGE_API_SECRET =
    process.env.EXCHANGE_API_SECRET || "";


// =====================================
// Helpers:: M
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
// Normalize Symbol:: M
// =====================================

function normalizeSymbol(symbol) {

    if (
        typeof symbol !== "string" ||
        !symbol.trim()
    ) {

        throw new Error(
            "Symbol is required"
        );

    }

    return symbol
        .trim()
        .toUpperCase();

}


// =====================================
// HTTP Request Helper:: M
// =====================================

async function exchangeRequest({

    endpoint,

    method = "GET",

    body = null

}) {

    requireExchangeConfiguration();


    const url =
        new URL(
            endpoint,
            EXCHANGE_API_URL
        );


    const timestamp =
        Date.now().toString();


    const payload =
        body
            ? JSON.stringify(body)
            : "";


    // =====================================
    // Signature:: M
    // =====================================

    const signature =
        crypto
            .createHmac(
                "sha256",
                EXCHANGE_API_SECRET
            )
            .update(
                timestamp +
                method.toUpperCase() +
                url.pathname +
                payload
            )
            .digest("hex");


    const headers = {

        "Content-Type":
            "application/json",

        "X-API-KEY":
            EXCHANGE_API_KEY,

        "X-TIMESTAMP":
            timestamp,

        "X-SIGNATURE":
            signature

    };


    const response =
        await fetch(

            url,

            {

                method:
                    method.toUpperCase(),

                headers,

                body:
                    payload || undefined

            }

        );


    const responseText =
        await response.text();


    let data = null;


    try {

        data =
            responseText
                ? JSON.parse(
                    responseText
                )
                : null;

    }

    catch {

        data =
            responseText;

    }


    if (!response.ok) {

        throw new Error(

            data?.message ||

            data?.error ||

            `Exchange request failed with status ${response.status}`

        );

    }


    return data;

}


// =====================================
// Get Market Price:: M
// دریافت قیمت واقعی بازار
// =====================================

export async function getMarketPrice({

    symbol,

    market = "crypto"

}) {

    const normalizedSymbol =
        normalizeSymbol(
            symbol
        );


    if (!market) {

        throw new Error(
            "Market is required"
        );

    }


    /*
     * IMPORTANT
     *
     * Endpoint واقعی صرافی باید بر اساس
     * صرافی انتخاب‌شده تنظیم شود.
     *
     * تا زمانی که Adapter واقعی صرافی
     * مشخص نشده باشد، قیمت جعلی تولید نمی‌کنیم.
     */

    throw new Error(

        "Exchange market-data adapter is not configured for the selected exchange"

    );

}


// =====================================
// Place Order:: M
// اجرای سفارش واقعی
// =====================================
//
// ورودی اصلی:
// BUY / SELL
//
// quantity:
// مقدار واقعی دارایی
//
// =====================================

export async function placeOrder({

    symbol,

    side = null,

    quantity = null,

    // سازگاری با tradingService فعلی
    type = null,

    amount = null,

    market = "crypto",

    orderType = "MARKET",

    stopLossPrice = null,

    takeProfitPrice = null

}) {

    const normalizedSymbol =
        normalizeSymbol(
            symbol
        );


    // =====================================
    // Normalize Side:: M
    // =====================================

    const normalizedSide =
        String(
            side || type || ""
        )
        .toUpperCase();


    if (

        normalizedSide !== "BUY" &&

        normalizedSide !== "SELL"

    ) {

        throw new Error(
            "Order side must be BUY or SELL"
        );

    }


    // =====================================
    // Normalize Quantity:: M
    // =====================================

    const rawQuantity =
        quantity ??
        amount;


    const numericQuantity =
        Number(
            rawQuantity
        );


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


    // =====================================
    // Order Payload:: M
    // =====================================

    const orderPayload = {

        symbol:
            normalizedSymbol,

        side:
            normalizedSide,

        quantity:
            Number(
                numericQuantity.toFixed(8)
            ),

        market:
            String(
                market
            ).toLowerCase(),

        orderType:
            String(
                orderType
            ).toUpperCase()

    };


    // =====================================
    // Optional Stop Loss:: M
    // =====================================

    if (
        stopLossPrice !== null &&
        stopLossPrice !== undefined
    ) {

        const numericStopLoss =
            Number(
                stopLossPrice
            );


        if (

            !Number.isFinite(
                numericStopLoss
            ) ||

            numericStopLoss <= 0

        ) {

            throw new Error(
                "Invalid stop-loss price"
            );

        }


        orderPayload.stopLossPrice =
            numericStopLoss;

    }


    // =====================================
    // Optional Take Profit:: M
    // =====================================

    if (
        takeProfitPrice !== null &&
        takeProfitPrice !== undefined
    ) {

        const numericTakeProfit =
            Number(
                takeProfitPrice
            );


        if (

            !Number.isFinite(
                numericTakeProfit
            ) ||

            numericTakeProfit <= 0

        ) {

            throw new Error(
                "Invalid take-profit price"
            );

        }


        orderPayload.takeProfitPrice =
            numericTakeProfit;

    }


    /*
     * IMPORTANT:
     *
     * اینجا سفارش فقط زمانی موفق محسوب می‌شود
     * که API صرافی واقعاً Order ID برگرداند.
     *
     * Endpoint عمومی را حدس نمی‌زنیم.
     * چون هر صرافی API، Signature و Endpoint
     * متفاوت دارد.
     */

    throw new Error(

        "Exchange order adapter is not configured for the selected exchange"

    );

}


// =====================================
// Check Order Status:: M
// بررسی وضعیت سفارش
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
     * وضعیت سفارش باید مستقیماً از API
     * صرافی انتخاب‌شده خوانده شود.
     *
     * تا قبل از اتصال Adapter واقعی،
     * وضعیت جعلی برنمی‌گردانیم.
     */

    throw new Error(

        "Exchange order-status adapter is not configured for the selected exchange"

    );

}


// =====================================
// Default Export:: M
// =====================================

export default {

    getMarketPrice,

    placeOrder,

    checkOrderStatus

};