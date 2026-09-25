// =====================================
// ..M
// AutoTrade AI
// Currency Service
// File: backend/services/currencyService.js
// =====================================


// =====================================
// ..M
// نرخ پیش‌فرض
// مقدار به تومان برای هر 1 دلار
// =====================================

const DEFAULT_USD_TO_TOMAN =
    Number(process.env.USD_TO_IRR || 100000) / 10;


// =====================================
// ..M
// تبدیل مقدار به عدد معتبر
// =====================================

function toValidNumber(value, fallback = 0) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return fallback;
    }

    return number;
}


// =====================================
// ..M
// دریافت نرخ USD → Toman
// =====================================

export async function getUsdToTomanRate() {

    const envRate =
        Number(process.env.USD_TO_TOMAN);

    if (
        Number.isFinite(envRate) &&
        envRate > 0
    ) {
        return envRate;
    }

    return DEFAULT_USD_TO_TOMAN;
}


// =====================================
// ..M
// دریافت نرخ USD → Rial
// =====================================

export async function getUsdToIrrRate() {

    const rateToman =
        await getUsdToTomanRate();

    return rateToman * 10;
}


// =====================================
// ..M
// تبدیل USD به Toman
// =====================================

export async function usdToToman(
    usd
) {

    const amount =
        toValidNumber(usd);

    const rate =
        await getUsdToTomanRate();

    return amount * rate;
}


// =====================================
// ..M
// تبدیل Toman به USD
// =====================================

export async function tomanToUsd(
    toman
) {

    const amount =
        toValidNumber(toman);

    const rate =
        await getUsdToTomanRate();

    if (rate <= 0) {
        return 0;
    }

    return amount / rate;
}


// =====================================
// ..M
// فرمت تومان
// =====================================

export function formatToman(
    amount
) {

    const value =
        toValidNumber(amount);

    return `${Math.round(value).toLocaleString("fa-IR")} تومان`;
}


// =====================================
// ..M
// فرمت دلار
// =====================================

export function formatUSD(
    amount
) {

    const value =
        toValidNumber(amount);

    return `$${value.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 8
        }
    )}`;
}


// =====================================
// ..M
// دریافت تمام مقادیر نمایشی Wallet
// =====================================

export async function getWalletDisplayValues(
    wallet
) {

    const balanceUSD =
        toValidNumber(wallet?.balance);

    const withdrawableUSD =
        toValidNumber(wallet?.withdrawable);

    const exchangeRate =
        await getUsdToTomanRate();

    const balanceToman =
        balanceUSD * exchangeRate;

    const withdrawableToman =
        withdrawableUSD * exchangeRate;


    return {

        // ---------------------------------
        // ..M
        // موجودی
        // ---------------------------------

        balanceUSD,

        balanceToman,

        balanceUSDText:
            formatUSD(balanceUSD),

        balanceTomanText:
            formatToman(balanceToman),


        // ---------------------------------
        // ..M
        // قابل برداشت
        // ---------------------------------

        withdrawableUSD,

        withdrawableToman,

        withdrawableUSDText:
            formatUSD(withdrawableUSD),

        withdrawableTomanText:
            formatToman(withdrawableToman),


        // ---------------------------------
        // ..M
        // نرخ تبدیل
        // ---------------------------------

        exchangeRate
    };
}


// =====================================
// ..M
// Export
// =====================================

export {
    DEFAULT_USD_TO_TOMAN
};