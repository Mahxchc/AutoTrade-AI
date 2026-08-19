// ..M currencyService.js

// =========================================================
// ..M CONFIG
// =========================================================

const DEFAULT_USD_TO_IRR = Number(
  process.env.USD_TO_IRR || 100000
);

// =========================================================
// ..M GET USD TO IRR RATE
// =========================================================

export const getUsdToIrrRate = () => {
  return DEFAULT_USD_TO_IRR;
};

// =========================================================
// ..M GET USD TO TOMAN RATE
// =========================================================

export const getUsdToTomanRate = () => {
  // 1 Toman = 10 IRR
  return getUsdToIrrRate() / 10;
};

// =========================================================
// ..M GET TOMAN TO USD RATE
// =========================================================

export const getTomanToUsdRate = () => {
  const rate = getUsdToTomanRate();

  if (rate <= 0) {
    return 0;
  }

  return 1 / rate;
};

// =========================================================
// ..M USD TO IRR
// =========================================================

export const usdToIrr = (
  usd,
  rate = getUsdToIrrRate()
) => {
  const value = Number(usd) || 0;

  const exchangeRate =
    Number(rate) || DEFAULT_USD_TO_IRR;

  return value * exchangeRate;
};

// =========================================================
// ..M IRR TO USD
// =========================================================

export const irrToUsd = (
  irr,
  rate = getUsdToIrrRate()
) => {
  const value = Number(irr) || 0;

  const exchangeRate =
    Number(rate) || DEFAULT_USD_TO_IRR;

  if (exchangeRate <= 0) {
    return 0;
  }

  return value / exchangeRate;
};

// =========================================================
// ..M USD TO TOMAN
// =========================================================

export const convertUsdToToman = (
  usd,
  rate = getUsdToTomanRate()
) => {
  const value = Number(usd) || 0;

  const tomanRate =
    Number(rate) || getUsdToTomanRate();

  return Math.round(
    value * tomanRate
  );
};

// =========================================================
// ..M TOMAN TO USD
// =========================================================

export const convertTomanToUsd = (
  toman,
  rate = getUsdToTomanRate()
) => {
  const value = Number(toman) || 0;

  const tomanRate =
    Number(rate) || getUsdToTomanRate();

  if (tomanRate <= 0) {
    return 0;
  }

  return value / tomanRate;
};

// =========================================================
// ..M FORMAT USD
// =========================================================

export const formatUsd = (value) => {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// =========================================================
// ..M FORMAT USD - COMPATIBILITY
// =========================================================

export const formatUSD = (value) => {
  return formatUsd(value);
};

// =========================================================
// ..M FORMAT IRR
// =========================================================

export const formatIrr = (value) => {
  const amount = Number(value) || 0;

  return `${new Intl.NumberFormat("fa-IR").format(
    Math.round(amount)
  )} ریال`;
};

// =========================================================
// ..M FORMAT IRR - COMPATIBILITY
// =========================================================

export const formatIRR = (value) => {
  return formatIrr(value);
};

// =========================================================
// ..M FORMAT TOMAN
// =========================================================

export const formatToman = (value) => {
  const amount = Number(value) || 0;

  return `${new Intl.NumberFormat("fa-IR").format(
    Math.round(amount)
  )} تومان`;
};

// =========================================================
// ..M WALLET DISPLAY VALUES
// =========================================================

export const getWalletDisplayValues = ({
  usd = 0,
  rate = getUsdToTomanRate()
} = {}) => {
  const usdValue = Number(usd) || 0;

  const tomanRate =
    Number(rate) || getUsdToTomanRate();

  const tomanValue =
    convertUsdToToman(
      usdValue,
      tomanRate
    );

  const irrValue =
    tomanValue * 10;

  return {
    usd: usdValue,

    usdFormatted:
      formatUSD(usdValue),

    irr: irrValue,

    irrFormatted:
      formatIrr(irrValue),

    toman: tomanValue,

    tomanFormatted:
      formatToman(tomanValue),

    exchangeRate:
      getUsdToIrrRate(),

    tomanPerUsd:
      tomanRate
  };
};

// =========================================================
// ..M CURRENCY INFO
// =========================================================

export const getCurrencyInfo = () => {
  const usdToIrrRate =
    getUsdToIrrRate();

  const usdToTomanRate =
    getUsdToTomanRate();

  return {
    baseCurrency: "USD",

    displayCurrency: "TOMAN",

    usdToIrrRate,

    usdToTomanRate,

    tomanPerUsd:
      usdToTomanRate,

    tomanEnabled: true
  };
};

// =========================================================
// ..M DEFAULT EXPORT
// =========================================================

export default {
  getUsdToIrrRate,
  getUsdToTomanRate,
  getTomanToUsdRate,

  usdToIrr,
  irrToUsd,

  convertUsdToToman,
  convertTomanToUsd,

  formatUsd,
  formatUSD,

  formatIrr,
  formatIRR,

  formatToman,

  getWalletDisplayValues,
  getCurrencyInfo
};