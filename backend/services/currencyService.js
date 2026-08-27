// =====================================
// Currency Service:: M
// AutoTrade AI
// Currency Conversion Service
// File: backend/services/currencyService.js
// =====================================


// =====================================
// Configuration:: M
// =====================================

const DEFAULT_USD_TO_IRR =
    Number(
        process.env.USD_TO_IRR || 100000
    );


// =====================================
// Get USD to IRR Rate:: M
// =====================================

export function getUsdToIrrRate() {

    return Number.isFinite(
        DEFAULT_USD_TO_IRR
    )
        ? DEFAULT_USD_TO_IRR
        : 100000;

}


// =====================================
// Get USD to Toman Rate:: M
// =====================================

export function getUsdToTomanRate() {

    return (
        getUsdToIrrRate() / 10
    );

}


// =====================================
// USD → Toman:: M
// =====================================

export function usdToToman(
    usd
) {

    const value =
        Number(usd);


    if (
        !Number.isFinite(value)
    ) {

        return 0;

    }


    return Number(

        (
            value *
            getUsdToTomanRate()

        ).toFixed(0)

    );

}


// =====================================
// Toman → USD:: M
// =====================================

export function tomanToUsd(
    toman
) {

    const value =
        Number(toman);


    const rate =
        getUsdToTomanRate();


    if (
        !Number.isFinite(value) ||
        value < 0 ||
        !Number.isFinite(rate) ||
        rate <= 0
    ) {

        return 0;

    }


    return Number(

        (
            value / rate

        ).toFixed(8)

    );

}


// =====================================
// Compatibility Alias
// convertTomanToUsd:: M
// =====================================

export function convertTomanToUsd(
    toman
) {

    return tomanToUsd(
        toman
    );

}


// =====================================
// Compatibility Alias
// convertUsdToToman:: M
// =====================================

export function convertUsdToToman(
    usd
) {

    return usdToToman(
        usd
    );

}


// =====================================
// Format USD:: M
// =====================================

export function formatUSD(
    usd
) {

    const value =
        Number(usd);


    if (
        !Number.isFinite(value)
    ) {

        return "$0.00";

    }


    return new Intl.NumberFormat(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8
        }
    ).format(value);

}


// =====================================
// Format Toman:: M
// =====================================

export function formatToman(
    usd
) {

    const toman =
        usdToToman(
            usd
        );


    return new Intl.NumberFormat(
        "fa-IR"
    ).format(
        toman
    );

}


// =====================================
// Get Wallet Display Values:: M
// =====================================

export function getWalletDisplayValues({

    balance = 0,

    totalProfit = 0,

    withdrawable = 0

} = {}) {

    const numericBalance =
        Number(balance) || 0;


    const numericTotalProfit =
        Number(totalProfit) || 0;


    const numericWithdrawable =
        Number(withdrawable) || 0;


    return {

        balanceUSD:
            Number(
                numericBalance.toFixed(8)
            ),

        balanceUSDFormatted:
            formatUSD(
                numericBalance
            ),

        balanceToman:
            usdToToman(
                numericBalance
            ),

        balanceTomanFormatted:
            formatToman(
                numericBalance
            ),


        totalProfitUSD:
            Number(
                numericTotalProfit.toFixed(8)
            ),

        totalProfitUSDFormatted:
            formatUSD(
                numericTotalProfit
            ),

        totalProfitToman:
            usdToToman(
                numericTotalProfit
            ),

        totalProfitTomanFormatted:
            formatToman(
                numericTotalProfit
            ),


        withdrawableUSD:
            Number(
                numericWithdrawable.toFixed(8)
            ),

        withdrawableUSDFormatted:
            formatUSD(
                numericWithdrawable
            ),

        withdrawableToman:
            usdToToman(
                numericWithdrawable
            ),

        withdrawableTomanFormatted:
            formatToman(
                numericWithdrawable
            ),


        usdToTomanRate:
            getUsdToTomanRate(),

        usdToIrrRate:
            getUsdToIrrRate()

    };

}


// =====================================
// Default Export:: M
// =====================================

export default {

    getUsdToIrrRate,

    getUsdToTomanRate,

    usdToToman,

    tomanToUsd,

    convertTomanToUsd,

    convertUsdToToman,

    formatUSD,

    formatToman,

    getWalletDisplayValues

};