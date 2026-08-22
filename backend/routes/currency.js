// =====================================
// AutoTrade AI
// Currency Routes:: M
// مسیرهای نرخ ارز
// File: backend/routes/Currency.js
// =====================================

import express from "express";

import {
    getUsdToTomanRate,
    convertUsdToToman,
    convertTomanToUsd,
    formatUSD,
    formatToman
} from "../services/currencyService.js";


const router =
    express.Router();


// =====================================
// GET USD TO TOMAN RATE:: M
// دریافت نرخ دلار به تومان
// GET /api/currency/usd-toman
// =====================================

router.get(
    "/usd-toman",
    async (req, res) => {

        try {

            const currency =
                await getUsdToTomanRate();


            return res.status(200).json({

                success:
                    true,

                currency: {

                    usdToTomanRate:
                        currency.rate,

                    currency:
                        currency.currency,

                    targetCurrency:
                        currency.targetCurrency,

                    updatedAt:
                        currency.updatedAt

                }

            });

        }

        catch (error) {

            console.error(
                "Get Currency Rate Error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Failed to get USD to Toman rate"

            });

        }

    }
);


// =====================================
// CONVERT USD TO TOMAN:: M
// تبدیل دلار به تومان
// GET /api/currency/convert/usd-to-toman
// =====================================

router.get(
    "/convert/usd-to-toman",
    async (req, res) => {

        try {

            const {
                amount
            } = req.query;


            if (
                amount == null
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "USD amount is required"

                });

            }


            const result =
                await convertUsdToToman({

                    amountUSD:
                        amount

                });


            return res.status(200).json({

                success:
                    true,

                conversion: {

                    amountUSD:
                        result.amountUSD,

                    usdToTomanRate:
                        result.usdToTomanRate,

                    amountToman:
                        result.amountToman,

                    usd:
                        formatUSD(
                            result.amountUSD
                        ),

                    toman:
                        formatToman(
                            result.amountToman
                        )

                }

            });

        }

        catch (error) {

            console.error(
                "USD To Toman Error:",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "Failed to convert USD to Toman"

            });

        }

    }
);


// =====================================
// CONVERT TOMAN TO USD:: M
// تبدیل تومان به دلار
// GET /api/currency/convert/toman-to-usd
// =====================================

router.get(
    "/convert/toman-to-usd",
    async (req, res) => {

        try {

            const {
                amount
            } = req.query;


            if (
                amount == null
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Toman amount is required"

                });

            }


            const result =
                await convertTomanToUsd({

                    amountToman:
                        amount

                });


            return res.status(200).json({

                success:
                    true,

                conversion: {

                    amountToman:
                        result.amountToman,

                    usdToTomanRate:
                        result.usdToTomanRate,

                    amountUSD:
                        result.amountUSD,

                    toman:
                        formatToman(
                            result.amountToman
                        ),

                    usd:
                        formatUSD(
                            result.amountUSD
                        )

                }

            });

        }

        catch (error) {

            console.error(
                "Toman To USD Error:",
                error
            );


            return res.status(400).json({

                success:
                    false,

                message:
                    error.message ||
                    "Failed to convert Toman to USD"

            });

        }

    }
);


// =====================================
// EXPORT ROUTER:: M
// خروجی مسیرهای ارز
// =====================================

export default router;
