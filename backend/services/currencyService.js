// =====================================
// Currency Service:: M
// AutoTrade AI
// Currency Conversion & Wallet Display
// File: backend/services/currencyService.js
// =====================================


// =====================================
// Configuration:: M
// =====================================

const DEFAULT_USD_TO_IRR =
    Number(process.env.USD_TO_IRR || 100000);


// =====================================
// Get USD → IRR Rate:: M
// =====================================

export function getUsdIrrRate() {

    return DEFAULT_USD_TO_IRR;

}


// =====================================
// Get USD → Toman Rate:: M
// =====================================

export function getUsdToTomanRate() {

    return DEFAULT_USD_TO_IRR / 10;

}


// =====================================
// Convert USD → Toman:: M
// =====================================

export function convertUsdToToman(
    usd
) {

    const numericUsd =
        Number(usd);

    if (
        !Number.isFinite(numericUsd)
    ) {
        return 0;
    }

    return (
        numericUsd *
        getUsdToTomanRate()
    );

}


// =====================================
// Convert Toman → USD:: M
// =====================================

export function convertTomanToUsd(
    toman
) {

    const numericToman =
        Number(toman);

    if (
        !Number.isFinite(numericToman)
    ) {
        return 0;
    }

    const rate =
        getUsdToTomanRate();

    if (
        !Number.isFinite(rate) ||
        rate <= 0
    ) {
        return 0;
    }

    return (
        numericToman / rate
    );

}


// =====================================
// Convert IRR → USD:: M
// =====================================

export function convertIrrToUsd(
    irr
) {

    const numericIrr =
        Number(irr);

    if (
        !Number.isFinite(numericIrr)
    ) {
        return 0;
    }

    if (
        DEFAULT_USD_TO_IRR <= 0
    ) {
        return 0;
    }

    return (
        numericIrr /
        DEFAULT_USD_TO_IRR
    );

}


// =====================================
// Convert USD → IRR:: M
// =====================================

export function convertUsdToIrr(
    usd
) {

    const numericUsd =
        Number(usd);

    if (
        !Number.isFinite(numericUsd)
    ) {
        return 0;
    }

    return (
        numericUsd *
        DEFAULT_USD_TO_IRR
    );

}


// =====================================
// Format USD:: M
// =====================================

export function formatUSD(
    usd
) {

    const numericUsd =
        Number(usd);

    if (
        !Number.isFinite(numericUsd)
    ) {
        return "$0.00";
    }

    return new Intl.NumberFormat(
        "en-US",
        {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(
        numericUsd
    );

}


// =====================================
// Format Toman:: M
// =====================================

export function formatToman(
    toman
) {

    const numericToman =
        Number(toman);

    if (
        !Number.isFinite(numericToman)
    ) {
        return "۰ تومان";
    }

    return (
        new Intl.NumberFormat(
            "fa-IR"
        ).format(
            Math.round(numericToman)
        ) +
        " تومان"
    );

}


// =====================================
// Get Wallet Display Values:: M
// =====================================

export function getWalletDisplayValues(
    usd
) {

    const numericUsd =
        Number(usd);

    const safeUsd =
        Number.isFinite(numericUsd)
            ? numericUsd
            : 0;

    const toman =
        convertUsdToToman(
            safeUsd
        );

    return {

        usd:
            safeUsd,

        toman,

        usdFormatted:
            formatUSD(
                safeUsd
            ),

        tomanFormatted:
            formatToman(
                toman
            ),

        exchangeRate:
            getUsdToTomanRate()

    };

}


// =====================================
// Default Export:: M
// =====================================

export default {

    getUsdIrrRate,

    getUsdToTomanRate,

    convertUsdToToman,

    convertTomanToUsd,

    convertIrrToUsd,

    convertUsdToIrr,

    formatUSD,

    formatToman,

    getWalletDisplayValues

};