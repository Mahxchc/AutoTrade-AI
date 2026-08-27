// =====================================
// Currency Service:: M
// AutoTrade AI
// Currency Conversion Service
// File: backend/services/currencyService.js
// =====================================


// =====================================
// Default USD to IRR Rate:: M
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
// Convert USD to Toman:: M
// =====================================

export function usdToToman(
    usd
) {

    const numericUsd =
        Number(usd);


    if (
        !Number.isFinite(
            numericUsd
        )
    ) {

        return 0;

    }


    return Number(

        (
            numericUsd *
            getUsdToTomanRate()

        ).toFixed(0)

    );

}


// =====================================
// Convert Toman to USD:: M
// =====================================

export function tomanToUsd(
    toman
) {

    const numericToman =
        Number(toman);


    const rate =
        getUsdToTomanRate();


    if (
        !Number.isFinite(
            numericToman
        ) ||
        numericToman < 0 ||
        !Number.isFinite(rate) ||
        rate <= 0
    ) {

        return 0;

    }


    return Number(

        (
            numericToman /
            rate

        ).toFixed(8)

    );

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
//
// This function is required by:
//
// backend/routes/wallet.js
//
// It provides the wallet values in both
// USD and Toman for the Mini App.
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

    formatToman,

    getWalletDisplayValues

};