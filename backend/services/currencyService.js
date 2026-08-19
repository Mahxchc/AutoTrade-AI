// ..M currencyService.js

// =========================================================
// ..M DEFAULT CONFIG
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
// ..M TOMAN TO USD
// =========================================================

export const convertTomanToUsd = (
  toman,
  rate = getUsdToIrrRate()
) => {
  const tomanValue = Number(toman) || 0;

  const exchangeRate =
    Number(rate) || DEFAULT_USD_TO_IRR;

  if (exchangeRate <= 0) {
    return 0;
  }

  // 1 Toman = 10 IRR
  const irrValue = tomanValue * 10;

  return irrValue / exchangeRate;
};

// =========================================================
// ..M USD TO TOMAN
// =========================================================

export const convertUsdToToman = (
  usd,
  rate = getUsdToIrrRate()
) => {
  const usdValue = Number(usd) || 0;

  const irrValue = usdToIrr(
    usdValue,
    rate
  );

  // 1 Toman = 10 IRR
  return Math.round(irrValue / 10);
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
  rate = getUsdToIrrRate()
} = {}) => {
  const usdValue = Number(usd) || 0;

  const exchangeRate =
    Number(rate) || DEFAULT_USD_TO_IRR;

  const irrValue = usdToIrr(
    usdValue,
    exchangeRate
  );

  const tomanValue =
    Math.round(irrValue / 10);

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

    exchangeRate,

    tomanPerUsd:
      exchangeRate / 10
  };
};

// =========================================================
// ..M CURRENCY INFO
// =========================================================

export const getCurrencyInfo = () => {
  const rate = getUsdToIrrRate();

  return {
    baseCurrency: "USD",

    displayCurrency: "IRR",

    tomanEnabled: true,

    usdToIrrRate: rate,

    tomanPerUsd: rate / 10,

    description:
      "USD to IRR and Toman conversion"
  };
};

// =========================================================
// ..M DEFAULT EXPORT
// =========================================================

export default {
  getUsdToIrrRate,
  usdToIrr,
  irrToUsd,
  convertTomanToUsd,
  convertUsdToToman,
  formatUsd,
  formatUSD,
  formatIrr,
  formatIRR,
  formatToman,
  getWalletDisplayValues,
  getCurrencyInfo
};