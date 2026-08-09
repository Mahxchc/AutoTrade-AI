// =====================================
// AutoTrade AI
// Currency Service:: M
// سرویس نرخ ارز
// File: backend/services/currencyService.js
// =====================================

import https from "https";


// =====================================
// تنظیمات:: M
// =====================================

const DEFAULT_TIMEOUT = 10000;


// =====================================
// درخواست HTTP:: M
// =====================================

function requestJSON(url) {

    return new Promise(
        (resolve, reject) => {

            const request =
                https.get(
                    url,
                    {
                        headers: {
                            "User-Agent":
                                "AutoTrade-AI/1.0"
                        }
                    },
                    (response) => {

                        let data = "";

                        response.on(
                            "data",
                            (chunk) => {

                                data += chunk;

                            }
                        );


                        response.on(
                            "end",
                            () => {

                                try {

                                    if (
                                        response.statusCode < 200 ||
                                        response.statusCode >= 300
                                    ) {

                                        return reject(
                                            new Error(
                                                `Currency API returned status ${response.statusCode}`
                                            )
                                        );

                                    }


                                    const json =
                                        JSON.parse(data);


                                    resolve(json);

                                }

                                catch (error) {

                                    reject(
                                        new Error(
                                            "Invalid currency API response"
                                        )
                                    );

                                }

                            }
                        );

                    }
                );


            request.setTimeout(
                DEFAULT_TIMEOUT,
                () => {

                    request.destroy();

                    reject(
                        new Error(
                            "Currency API request timed out"
                        )
                    );

                }
            );


            request.on(
                "error",
                (error) => {

                    reject(error);

                }
            );

        }
    );

}


// =====================================
// دریافت نرخ دلار/تومان:: M
// =====================================
//
// نکته:
// آدرس API از ENV خوانده می‌شود.
// بنابراین نرخ را می‌توان بدون تغییر
// کد از طریق Render تنظیم کرد.
// =====================================

export async function getUsdToTomanRate() {

    const apiUrl =
        process.env.CURRENCY_API_URL;


    if (!apiUrl) {

        throw new Error(
            "CURRENCY_API_URL is not configured"
        );

    }


    const data =
        await requestJSON(
            apiUrl
        );


    // =====================================
    // استخراج نرخ:: M
    // =====================================

    let rate = null;


    if (
        data?.rate !== undefined
    ) {

        rate =
            Number(
                data.rate
            );

    }

    else if (
        data?.usdToToman !== undefined
    ) {

        rate =
            Number(
                data.usdToToman
            );

    }

    else if (
        data?.data?.rate !== undefined
    ) {

        rate =
            Number(
                data.data.rate
            );

    }


    // =====================================
    // بررسی نرخ:: M
    // =====================================

    if (
        !Number.isFinite(rate) ||
        rate <= 0
    ) {

        throw new Error(
            "Invalid USD to Toman rate received"
        );

    }


    return {

        currency:
            "USD",

        targetCurrency:
            "IRR",

        rate:

            Number(
                rate.toFixed(0)
            ),

        updatedAt:
            new Date()

    };

}


// =====================================
// تبدیل دلار به تومان:: M
// =====================================

export async function convertUsdToToman({

    amountUSD,

    rate = null

}) {

    const numericAmount =
        Number(
            amountUSD
        );


    if (
        !Number.isFinite(
            numericAmount
        ) ||
        numericAmount < 0
    ) {

        throw new Error(
            "Invalid USD amount"
        );

    }


    let numericRate =
        Number(
            rate
        );


    // =====================================
    // اگر نرخ داده نشده باشد
    // نرخ واقعی دریافت می‌شود
    // =====================================

    if (
        !Number.isFinite(
            numericRate
        ) ||
        numericRate <= 0
    ) {

        const currency =
            await getUsdToTomanRate();


        numericRate =
            currency.rate;

    }


    const amountToman =
        Math.round(
            numericAmount *
            numericRate
        );


    return {

        amountUSD:
            Number(
                numericAmount.toFixed(2)
            ),

        usdToTomanRate:
            numericRate,

        amountToman,

        formattedToman:
            `${amountToman.toLocaleString("fa-IR")} تومان`

    };

}


// =====================================
// تبدیل تومان به دلار:: M
// =====================================

export async function convertTomanToUsd({

    amountToman,

    rate = null

}) {

    const numericToman =
        Number(
            amountToman
        );


    if (
        !Number.isFinite(
            numericToman
        ) ||
        numericToman < 0
    ) {

        throw new Error(
            "Invalid Toman amount"
        );

    }


    let numericRate =
        Number(
            rate
        );


    if (
        !Number.isFinite(
            numericRate
        ) ||
        numericRate <= 0
    ) {

        const currency =
            await getUsdToTomanRate();


        numericRate =
            currency.rate;

    }


    const amountUSD =
        numericToman /
        numericRate;


    return {

        amountToman:
            Math.round(
                numericToman
            ),

        usdToTomanRate:
            numericRate,

        amountUSD:
            Number(
                amountUSD.toFixed(2)
            )

    };

}


// =====================================
// فرمت نمایش دلار:: M
// =====================================

export function formatUSD(
    amount
) {

    const numericAmount =
        Number(
            amount
        );


    if (
        !Number.isFinite(
            numericAmount
        )
    ) {

        return "$0.00";

    }


    return (
        "$" +
        numericAmount.toFixed(2)
    );

}


// =====================================
// فرمت نمایش تومان:: M
// =====================================

export function formatToman(
    amount
) {

    const numericAmount =
        Number(
            amount
        );


    if (
        !Number.isFinite(
            numericAmount
        )
    ) {

        return "۰ تومان";

    }


    return (
        Math.round(
            numericAmount
        ).toLocaleString(
            "fa-IR"
        ) +
        " تومان"
    );

}
