// =====================================
// Currency Service:: M
// AutoTrade AI
// سرویس تبدیل دلار و تومان
// File: backend/services/currencyService.js
// =====================================


// =====================================
// نرخ پیش‌فرض دلار به تومان:: M
// =====================================
//
// این مقدار موقت است.
// بعداً به API واقعی نرخ ارز متصل می‌شود.
// =====================================

const DEFAULT_USD_TO_TOMAN_RATE =
    170000;


// =====================================
// دریافت نرخ دلار به تومان:: M
// =====================================

export async function getUsdToTomanRate() {

    const rate =
        Number(
            process.env.USD_TO_TOMAN_RATE ||
            DEFAULT_USD_TO_TOMAN_RATE
        );


    if (
        !Number.isFinite(rate) ||
        rate <= 0
    ) {

        throw new Error(
            "Invalid USD to Toman exchange rate"
        );

    }


    return {

        usd:
            "USD",

        toman:
            "IRR",

        rate,

        source:
            process.env.USD_TO_TOMAN_RATE
                ? "ENV"
                : "DEFAULT",

        updatedAt:
            new Date()

    };

}


// =====================================
// تبدیل دلار به تومان:: M
// =====================================

export async function usdToToman(
    amountUsd
) {

    const usd =
        Number(amountUsd);


    if (
        !Number.isFinite(usd) ||
        usd < 0
    ) {

        throw new Error(
            "Invalid USD amount"
        );

    }


    const exchange =
        await getUsdToTomanRate();


    const toman =
        usd *
        exchange.rate;


    return {

        usd:
            Number(
                usd.toFixed(8)
            ),

        toman:
            Math.round(toman),

        rate:
            exchange.rate,

        updatedAt:
            exchange.updatedAt

    };

}


// =====================================
// تبدیل تومان به دلار:: M
// =====================================

export async function tomanToUsd(
    amountToman
) {

    const toman =
        Number(amountToman);


    if (
        !Number.isFinite(toman) ||
        toman < 0
    ) {

        throw new Error(
            "Invalid Toman amount"
        );

    }


    const exchange =
        await getUsdToTomanRate();


    const usd =
        toman /
        exchange.rate;


    return {

        toman:
            Math.round(toman),

        usd:
            Number(
                usd.toFixed(8)
            ),

        rate:
            exchange.rate,

        updatedAt:
            exchange.updatedAt

    };

}


// =====================================
// اطلاعات نمایشی کیف پول:: M
// =====================================

export async function getWalletDisplayValues(
    usdBalance
) {

    const result =
        await usdToToman(
            usdBalance
        );


    return {

        balanceUSD:
            result.usd,

        balanceToman:
            result.toman,

        exchangeRate:
            result.rate,

        balanceUSDText:
            `$${result.usd.toFixed(2)}`,

        balanceTomanText:
            `${result.toman.toLocaleString("fa-IR")} تومان`,

        exchangeRateText:
            `${result.rate.toLocaleString("fa-IR")} تومان`,

        updatedAt:
            result.updatedAt

    };

      }
