// =====================================
// AutoTrade AI :: Currency Service :: M
// File: backend/services/currencyService.js
// سرویس یکپارچه ارز و تبدیل تومان / دلار / USDT
// =====================================


// =====================================
// DEFAULT RATES
// =====================================

// USDT فعلاً معادل تقریبی 1 دلار در نظر گرفته می‌شود.
// بعداً می‌توانیم قیمت لحظه‌ای USDT را اضافه کنیم.
const DEFAULT_USDT_USD_RATE =
    Number(
        process.env.USDT_USD_RATE || 1
    );


// نرخ پیش‌فرض دلار به ریال.
// مقدار را می‌توان از Render Environment تنظیم کرد.
//
// مثال:
// USD_TO_IRR=1000000
//
// یعنی:
// 1 USD = 1,000,000 IRR
//
const DEFAULT_USD_IRR_RATE =
    Number(
        process.env.USD_TO_IRR || 1000000
    );


// هر تومان = 10 ریال
const IRR_PER_TOMAN =
    10;


// مدت اعتبار Cache
const CACHE_TIME =
    60 * 1000;


let cachedRate =
    null;


let cachedAt =
    0;


// =====================================
// Validation Helper
// =====================================

function validateAmount(
    amount,
    name = "amount"
) {

    const value =
        Number(amount);


    if (
        !Number.isFinite(value)
    ) {

        throw new Error(
            `Invalid ${name}`
        );

    }


    if (
        value < 0
    ) {

        throw new Error(
            `${name} cannot be negative`
        );

    }


    return value;

}


// =====================================
// Fetch JSON helper
// =====================================

async function fetchJson(
    url
) {

    const response =
        await fetch(
            url
        );


    if (
        !response.ok
    ) {

        throw new Error(
            `Currency API request failed: ${response.status}`
        );

    }


    return await response.json();

}


// =====================================
// Get USD / IRR Rate
// =====================================

export async function getUsdIrrRate() {

    const now =
        Date.now();


    // ---------------------------------
    // Return cached rate
    // ---------------------------------

    if (
        cachedRate !== null &&
        now - cachedAt < CACHE_TIME
    ) {

        return cachedRate;

    }


    // ---------------------------------
    // Try external exchange API
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
    // Existing cache fallback
    // ---------------------------------

    if (
        cachedRate !== null &&
        Number.isFinite(
            cachedRate
        ) &&
        cachedRate > 0
    ) {

        return cachedRate;

    }


    // ---------------------------------
    // Environment fallback
    // ---------------------------------

    if (
        Number.isFinite(
            DEFAULT_USD_IRR_RATE
        ) &&
        DEFAULT_USD_IRR_RATE > 0
    ) {

        return DEFAULT_USD_IRR_RATE;

    }


    throw new Error(
        "USD/IRR exchange rate is unavailable"
    );

}


// =====================================
// Get USD / TOMAN Rate
// =====================================

export async function getUsdToTomanRate() {

    const usdIrr =
        await getUsdIrrRate();


    return (
        usdIrr /
        IRR_PER_TOMAN
    );

}


// =====================================
// USD -> IRR
// =====================================

export async function usdToIrr(
    usd
) {

    const amount =
        validateAmount(
            usd,
            "USD amount"
        );


    const rate =
        await getUsdIrrRate();


    return (
        amount *
        rate
    );

}


// =====================================
// IRR -> USD
// =====================================

export async function irrToUsd(
    irr
) {

    const amount =
        validateAmount(
            irr,
            "IRR amount"
        );


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


    return (
        amount /
        rate
    );

}


// =====================================
// USD -> TOMAN
// =====================================

export async function usdToToman(
    usd
) {

    const amount =
        validateAmount(
            usd,
            "USD amount"
        );


    const rate =
        await getUsdToTomanRate();


    return (
        amount *
        rate
    );

}


// =====================================
// TOMAN -> USD
// =====================================

export async function tomanToUsd(
    toman
) {

    const amount =
        validateAmount(
            toman,
            "Toman amount"
        );


    const rate =
        await getUsdToTomanRate();


    if (
        !rate ||
        rate <= 0
    ) {

        throw new Error(
            "Invalid USD/Toman exchange rate"
        );

    }


    return (
        amount /
        rate
    );

}


// =====================================
// TOMAN -> IRR
// =====================================

export function tomanToIrr(
    toman
) {

    const amount =
        validateAmount(
            toman,
            "Toman amount"
        );


    return (
        amount *
        IRR_PER_TOMAN
    );

}


// =====================================
// IRR -> TOMAN
// =====================================

export function irrToToman(
    irr
) {

    const amount =
        validateAmount(
            irr,
            "IRR amount"
        );


    return (
        amount /
        IRR_PER_TOMAN
    );

}


// =====================================
// USDT -> USD
// =====================================

export function usdtToUsd(
    usdt
) {

    const amount =
        validateAmount(
            usdt,
            "USDT amount"
        );


    if (
        !Number.isFinite(
            DEFAULT_USDT_USD_RATE
        ) ||
        DEFAULT_USDT_USD_RATE <= 0
    ) {

        throw new Error(
            "Invalid USDT/USD exchange rate"
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
        validateAmount(
            usd,
            "USD amount"
        );


    if (
        !Number.isFinite(
            DEFAULT_USDT_USD_RATE
        ) ||
        DEFAULT_USDT_USD_RATE <= 0
    ) {

        throw new Error(
            "Invalid USDT/USD exchange rate"
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
// TOMAN -> USDT
// =====================================

export async function tomanToUsdt(
    toman
) {

    const usd =
        await tomanToUsd(
            toman
        );


    return usdToUsdt(
        usd
    );

}


// =====================================
// USDT -> TOMAN
// =====================================

export async function usdtToToman(
    usdt
) {

    const usd =
        usdtToUsd(
            usdt
        );


    return usdToToman(
        usd
    );

}


// =====================================
// Convert Currency
// =====================================

export async function convertCurrency(
    amount,
    from,
    to
) {

    const value =
        validateAmount(
            amount
        );


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
    // USD -> TOMAN
    // ---------------------------------

    if (
        source === "USD" &&
        (
            target === "TOMAN" ||
            target === "IRT"
        )
    ) {

        return await usdToToman(
            value
        );

    }


    // ---------------------------------
    // TOMAN -> USD
    // ---------------------------------

    if (
        (
            source === "TOMAN" ||
            source === "IRT"
        ) &&
        target === "USD"
    ) {

        return await tomanToUsd(
            value
        );

    }


    // ---------------------------------
    // TOMAN -> IRR
    // ---------------------------------

    if (
        (
            source === "TOMAN" ||
            source === "IRT"
        ) &&
        target === "IRR"
    ) {

        return tomanToIrr(
            value
        );

    }


    // ---------------------------------
    // IRR -> TOMAN
    // ---------------------------------

    if (
        source === "IRR" &&
        (
            target === "TOMAN" ||
            target === "IRT"
        )
    ) {

        return irrToToman(
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


    // ---------------------------------
    // TOMAN -> USDT
    // ---------------------------------

    if (
        (
            source === "TOMAN" ||
            source === "IRT"
        ) &&
        target === "USDT"
    ) {

        return await tomanToUsdt(
            value
        );

    }


    // ---------------------------------
    // USDT -> TOMAN
    // ---------------------------------

    if (
        source === "USDT" &&
        (
            target === "TOMAN" ||
            target === "IRT"
        )
    ) {

        return await usdtToToman(
            value
        );

    }


    throw new Error(
        `Unsupported currency conversion: ${source} -> ${target}`
    );

}


// =====================================
// Currency Information
// =====================================

export async function getCurrencyInfo() {

    const usdIrr =
        await getUsdIrrRate();


    const usdToman =
        usdIrr /
        IRR_PER_TOMAN;


    return {

        baseCurrency:
            "USD",

        tradingCurrency:
            "USDT",

        localCurrency:
            "TOMAN",

        irrPerToman:
            IRR_PER_TOMAN,

        usdtUsdRate:
            DEFAULT_USDT_USD_RATE,

        usdIrrRate:
            usdIrr,

        usdTomanRate:
            usdToman,

        timestamp:
            new Date().toISOString()

    };

}


// =====================================
// Clear Currency Cache
// =====================================

export function clearCurrencyCache() {

    cachedRate =
        null;

    cachedAt =
        0;

}


// =====================================
// Default Export
// =====================================

export default {

    getUsdIrrRate,

    getUsdToTomanRate,

    usdToIrr,

    irrToUsd,

    usdToToman,

    tomanToUsd,

    tomanToIrr,

    irrToToman,

    usdtToUsd,

    usdToUsdt,

    irrToUsdt,

    usdtToIrr,

    tomanToUsdt,

    usdtToToman,

    convertCurrency,

    getCurrencyInfo,

    clearCurrencyCache

};