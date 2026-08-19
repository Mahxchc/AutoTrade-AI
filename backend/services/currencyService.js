// ..M currencyService.js

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

export const usdToIrr = (usd, rate = getUsdToIrrRate()) => {
  const value = Number(usd) || 0;
  const exchangeRate = Number(rate) || DEFAULT_USD_TO_IRR;

  return value * exchangeRate;
};

// =========================================================
// ..M IRR TO USD
// =========================================================

export const irrToUsd = (irr, rate = getUsdToIrrRate()) => {
  const value = Number(irr) || 0;
  const exchangeRate = Number(rate) || DEFAULT_USD_TO_IRR;

  if (exchangeRate <= 0) {
    return 0;
  }

  return value / exchangeRate;
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
    maximumFractionDigits: 2,
  }).format(amount);
};

// =========================================================
// ..M FORMAT TOMAN
// =========================================================

export const formatToman = (irr) => {
  const amount = Number(irr) || 0;

  const toman = Math.round(amount / 10);

  return `${new Intl.NumberFormat("fa-IR").format(toman)} تومان`;
};

// =========================================================
// ..M WALLET DISPLAY VALUES
// =========================================================

export const getWalletDisplayValues = ({
  usd = 0,
  rate = getUsdToIrrRate(),
} = {}) => {
  const usdValue = Number(usd) || 0;
  const exchangeRate = Number(rate) || DEFAULT_USD_TO_IRR;

  const irrValue = usdToIrr(
    usdValue,
    exchangeRate
  );

  const tomanValue = Math.round(
    irrValue / 10
  );

  return {
    usd: usdValue,

    usdFormatted: formatUsd(
      usdValue
    ),

    irr: irrValue,

    toman: tomanValue,

    tomanFormatted:
      formatToman(irrValue),

    exchangeRate,
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
  };
};
