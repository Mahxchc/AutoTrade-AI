// =====================================
// AutoTrade AI :: Currency Service
// File: backend/services/currencyService.js
// =====================================

const DEFAULT_USDT_USD_RATE = 1;

const DEFAULT_USD_IRR_RATE = 0;

const CACHE_TIME =
    60 * 1000;

let cachedRate = null;

let cachedAt = 0;


// =====================================
// Fetch JSON helper
// =====================================

async function fetchJson(url) {

    const response =
        await fetch(url);

    if (!response.ok) {

        throw new Error(
            `Currency API request failed: ${response.status}`
        );

    }

    return await response.json();

}


// =====================================
// Get USD / IRR rate
// =====================================

export async function getUsdIrrRate() {

    const now =
        Date.now();


    // ---------------------------------
    // Return cache
    // ---------------------------------

    if (
        cachedRate !== null &&
        now - cachedAt < CACHE_TIME
    ) {

        return cachedRate;

    }


    // ---------------------------------
    // API #1
    // ---------------------------------

    try {

        const data =
            await fetchJson(
                "https://open.er-api.com/v6/latest/USD"
            );


        const rate =
            Number(
                data?.rates?.IRR
            );


        if (
            Number.isFinite(rate) &&
            rate > 0
        ) {

            cachedRate =
                rate;

            cachedAt =
                now;

            return rate;

        }

    }

    catch (error) {

        console.error(
            "[CURRENCY] USD/IRR API error:",
            error.message
        );

    }


    // ---------------------------------
    // Existing cache
    // ---------------------------------

    if (
        cachedRate !== null &&
        Number.isFinite(cachedRate)
    ) {

        return cachedRate;

    }


    // ---------------------------------
    // No valid rate
    // ---------------------------------

    if (
        DEFAULT_USD_IRR_RATE <= 0
    ) {

        throw new Error(
            "USD/IRR exchange rate is unavailable"
        );

    }


    return DEFAULT_USD_IRR_RATE;

}


// =====================================
// USD -> IRR
// =====================================

export async function usdToIrr(
    usd
) {

    const amount =
        Number(usd);


    if (
        !Number.isFinite(amount)
    ) {

        throw new Error(
            "Invalid USD amount"
        );

    }


    const rate =
        await getUsdIrrRate();


    return amount * rate;

}


// =====================================
// IRR -> USD
// =====================================

export async function irrToUsd(
    irr
) {

    const amount =
        Number(irr);


    if (
        !Number.isFinite(amount)
    ) {

        throw new Error(
            "Invalid IRR amount"
        );

    }


    const rate =
        await getUsdIrrRate();


    if (
        !rate ||
        rate <= 0
    ) {

        throw new Error(
            "Invalid USD/IRR exchange rate"
        );

    }


    return amount / rate;

}


// =====================================
// USDT -> USD
// =====================================

export function usdtToUsd(
    usdt
) {

    const amount =
        Number(usdt);


    if (
        !Number.isFinite(amount)
    ) {

        throw new Error(
            "Invalid USDT amount"
        );

    }


    return (
        amount *
        DEFAULT_USDT_USD_RATE
    );

}


// =====================================
// USD -> USDT
// =====================================

export function usdToUsdt(
    usd
) {

    const amount =
        Number(usd);


    if (
        !Number.isFinite(amount)
    ) {

        throw new Error(
            "Invalid USD amount"
        );

    }


    return (
        amount /
        DEFAULT_USDT_USD_RATE
    );

}


// =====================================
// IRR -> USDT
// =====================================

export async function irrToUsdt(
    irr
) {

    const usd =
        await irrToUsd(
            irr
        );


    return usdToUsdt(
        usd
    );

}


// =====================================
// USDT -> IRR
// =====================================

export async function usdtToIrr(
    usdt
) {

    const usd =
        usdtToUsd(
            usdt
        );


    return usdToIrr(
        usd
    );

}


// =====================================
// Convert amount
// =====================================

export async function convertCurrency(
    amount,
    from,
    to
) {

    const value =
        Number(amount);


    if (
        !Number.isFinite(value)
    ) {

        throw new Error(
            "Invalid amount"
        );

    }


    const source =
        String(from)
            .toUpperCase()
            .trim();


    const target =
        String(to)
            .toUpperCase()
            .trim();


    // ---------------------------------
    // Same currency
    // ---------------------------------

    if (
        source === target
    ) {

        return value;

    }


    // ---------------------------------
    // USD -> IRR
    // ---------------------------------

    if (
        source === "USD" &&
        target === "IRR"
    ) {

        return await usdToIrr(
            value
        );

    }


    // ---------------------------------
    // IRR -> USD
    // ---------------------------------

    if (
        source === "IRR" &&
        target === "USD"
    ) {

        return await irrToUsd(
            value
        );

    }


    // ---------------------------------
    // USDT -> USD
    // ---------------------------------

    if (
        source === "USDT" &&
        target === "USD"
    ) {

        return usdtToUsd(
            value
        );

    }


    // ---------------------------------
    // USD -> USDT
    // ---------------------------------

    if (
        source === "USD" &&
        target === "USDT"
    ) {

        return usdToUsdt(
            value
        );

    }


    // ---------------------------------
    // IRR -> USDT
    // ---------------------------------

    if (
        source === "IRR" &&
        target === "USDT"
    ) {

        return await irrToUsdt(
            value
        );

    }


    // ---------------------------------
    // USDT -> IRR
    // ---------------------------------

    if (
        source === "USDT" &&
        target === "IRR"
    ) {

        return await usdtToIrr(
            value
        );

    }


    throw new Error(
        `Unsupported currency conversion: ${source} -> ${target}`
    );

}


// =====================================
// Currency information
// =====================================

export async function getCurrencyInfo() {

    const usdIrr =
        await getUsdIrrRate();


    return {

        baseCurrency:
            "USD",

        tradingCurrency:
            "USDT",

        localCurrency:
            "IRR",

        usdtUsdRate:
            DEFAULT_USDT_USD_RATE,

        usdIrrRate:
            usdIrr,

        timestamp:
            new Date().toISOString()

    };

}


// =====================================
// Clear cache
// =====================================

export function clearCurrencyCache() {

    cachedRate =
        null;

    cachedAt =
        0;

}


// =====================================
// Default export
// =====================================

export default {

    getUsdIrrRate,

    usdToIrr,

    irrToUsd,

    usdtToUsd,

    usdToUsdt,

    irrToUsdt,

    usdtToIrr,

    convertCurrency,

    getCurrencyInfo,

    clearCurrencyCache

};