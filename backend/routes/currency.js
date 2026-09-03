// =====================================
// ..M
// AutoTrade AI
// Currency Routes
// File: backend/routes/currency.js
// =====================================

import express from "express";

import {
    getUsdToTomanRate,
    getUsdToIrrRate,
    usdToToman,
    tomanToUsd,
    formatToman,
    formatUSD
} from "../services/currencyService.js";

const router = express.Router();


// =====================================
// ..M
// GET /api/currency/rate
// دریافت نرخ دلار به تومان
// =====================================

router.get("/rate", async (req, res) => {

    try {

        const usdToToman =
            await getUsdToTomanRate();

        const usdToIrr =
            await getUsdToIrrRate();

        return res.json({
            success: true,

            currency: {
                USD: {
                    Toman: usdToToman,
                    IRR: usdToIrr
                }
            },

            exchangeRate: usdToToman
        });

    } catch (error) {

        console.error(
            "GET /api/currency/rate error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to get currency rate"
        });
    }
});


// =====================================
// ..M
// GET /api/currency/exchange-rate
// سازگاری با Frontend قدیمی
// =====================================

router.get(
    "/exchange-rate",
    async (req, res) => {

        try {

            const rate =
                await getUsdToTomanRate();

            return res.json({
                success: true,

                exchangeRate: rate,

                usdToToman: rate,

                currency: "TOMAN"
            });

        } catch (error) {

            console.error(
                "GET /api/currency/exchange-rate error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Failed to get exchange rate"
            });
        }
    }
);


// =====================================
// ..M
// GET /api/currency/usd-to-toman
// تبدیل USD به Toman
// =====================================

router.get(
    "/usd-to-toman",
    async (req, res) => {

        try {

            const usd =
                Number(req.query.usd);

            if (
                !Number.isFinite(usd) ||
                usd < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid USD amount"
                });
            }

            const toman =
                await usdToToman(usd);

            return res.json({
                success: true,

                usd,

                toman,

                usdText:
                    formatUSD(usd),

                tomanText:
                    formatToman(toman)
            });

        } catch (error) {

            console.error(
                "GET /api/currency/usd-to-toman error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Currency conversion failed"
            });
        }
    }
);


// =====================================
// ..M
// GET /api/currency/toman-to-usd
// تبدیل Toman به USD
// =====================================

router.get(
    "/toman-to-usd",
    async (req, res) => {

        try {

            const toman =
                Number(req.query.toman);

            if (
                !Number.isFinite(toman) ||
                toman < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid Toman amount"
                });
            }

            const usd =
                await tomanToUsd(toman);

            return res.json({
                success: true,

                toman,

                usd,

                tomanText:
                    formatToman(toman),

                usdText:
                    formatUSD(usd)
            });

        } catch (error) {

            console.error(
                "GET /api/currency/toman-to-usd error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Currency conversion failed"
            });
        }
    }
);


// =====================================
// ..M
// GET /api/currency/convert
// تبدیل عمومی
// =====================================

router.get(
    "/convert",
    async (req, res) => {

        try {

            const {
                amount,
                from,
                to
            } = req.query;

            const value =
                Number(amount);

            const source =
                String(from || "")
                    .trim()
                    .toUpperCase();

            const target =
                String(to || "")
                    .trim()
                    .toUpperCase();


            if (
                !Number.isFinite(value) ||
                value < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid amount"
                });
            }


            // ---------------------------------
            // ..M
            // USD → TOMAN
            // ---------------------------------

            if (
                source === "USD" &&
                (
                    target === "TOMAN" ||
                    target === "IRT"
                )
            ) {

                const result =
                    await usdToToman(value);

                return res.json({
                    success: true,

                    from: "USD",
                    to: "TOMAN",

                    amount: value,
                    result,

                    amountText:
                        formatUSD(value),

                    resultText:
                        formatToman(result)
                });
            }


            // ---------------------------------
            // ..M
            // TOMAN → USD
            // ---------------------------------

            if (
                (
                    source === "TOMAN" ||
                    source === "IRT"
                ) &&
                target === "USD"
            ) {

                const result =
                    await tomanToUsd(value);

                return res.json({
                    success: true,

                    from: "TOMAN",
                    to: "USD",

                    amount: value,
                    result,

                    amountText:
                        formatToman(value),

                    resultText:
                        formatUSD(result)
                });
            }


            return res.status(400).json({
                success: false,
                message:
                    "Unsupported currency conversion"
            });

        } catch (error) {

            console.error(
                "GET /api/currency/convert error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Currency conversion failed"
            });
        }
    }
);


// =====================================
// ..M
// Export
// =====================================

export default router;