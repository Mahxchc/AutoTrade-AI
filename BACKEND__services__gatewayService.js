// =====================================
// AutoTrade AI
// Gateway Service:: M
// سرویس درگاه پرداخت
// File: backend/services/gatewayService.js
// =====================================

import crypto from "crypto";


// =====================================
// Environment:: M
// تنظیمات درگاه
// =====================================

const GATEWAY_BASE_URL =
    process.env.PAYMENT_GATEWAY_BASE_URL || "";

const GATEWAY_API_KEY =
    process.env.PAYMENT_GATEWAY_API_KEY || "";

const PAYMENT_CALLBACK_URL =
    process.env.PAYMENT_CALLBACK_URL || "";


// =====================================
// Gateway Configuration:: M
// بررسی تنظیمات درگاه
// =====================================

export function isGatewayConfigured() {

    return Boolean(
        GATEWAY_BASE_URL &&
        GATEWAY_API_KEY &&
        PAYMENT_CALLBACK_URL
    );

}


// =====================================
// Create Payment Request:: M
// ایجاد درخواست پرداخت
// =====================================
//
// این تابع اسکلت اتصال به درگاه است.
//
// تا زمانی که API واقعی درگاه مشخص نشده،
// هیچ درخواست جعلی به یک سرویس ناشناس ارسال
// نمی‌شود.
// =====================================

export async function createPaymentRequest({

    depositId,

    amountToman,

    description =
        "شارژ کیف پول AutoTrade AI"

}) {

    // =====================================
    // بررسی اطلاعات:: M
    // =====================================

    if (!depositId) {

        throw new Error(
            "شناسه واریز الزامی است"
        );

    }


    const amount =
        Number(amountToman);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        throw new Error(
            "مبلغ پرداخت نامعتبر است"
        );

    }


    // =====================================
    // بررسی اتصال درگاه:: M
    // =====================================

    if (!isGatewayConfigured()) {

        return {

            created:
                false,

            configured:
                false,

            message:
                "درگاه پرداخت هنوز تنظیم نشده است",

            paymentUrl:
                null

        };

    }


    // =====================================
    // Payment Payload:: M
    // اطلاعات ارسال به درگاه
    // =====================================

    const payload = {

        amount,

        description,

        callbackUrl:
            PAYMENT_CALLBACK_URL,

        metadata: {

            depositId

        }

    };


    // =====================================
    // Gateway Request:: M
    // =====================================
    //
    // توجه:
    //
    // endpoint واقعی و ساختار body باید بر اساس
    // مستندات درگاه انتخابی تنظیم شود.
    //
    // این بخش عمداً عمومی نگه داشته شده است.
    // =====================================

    const response =
        await fetch(
            `${GATEWAY_BASE_URL}/payment/create`,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${GATEWAY_API_KEY}`

                },

                body:
                    JSON.stringify(
                        payload
                    )

            }
        );


    if (!response.ok) {

        throw new Error(
            `Gateway request failed: ${response.status}`
        );

    }


    const result =
        await response.json();


    // =====================================
    // بررسی پاسخ درگاه:: M
    // =====================================

    if (
        !result ||
        !result.paymentId ||
        !result.paymentUrl
    ) {

        throw new Error(
            "پاسخ معتبر از درگاه دریافت نشد"
        );

    }


    return {

        created:
            true,

        configured:
            true,

        paymentId:
            result.paymentId,

        paymentUrl:
            result.paymentUrl,

        raw:
            result

    };

}


// =====================================
// Verify Payment:: M
// استعلام پرداخت
// =====================================

export async function verifyGatewayPayment({

    paymentId,

    amountToman

}) {

    if (!paymentId) {

        throw new Error(
            "شناسه پرداخت الزامی است"
        );

    }


    const amount =
        Number(amountToman);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        throw new Error(
            "مبلغ پرداخت نامعتبر است"
        );

    }


    // =====================================
    // بررسی تنظیمات:: M
    // =====================================

    if (!isGatewayConfigured()) {

        return {

            verified:
                false,

            configured:
                false,

            message:
                "درگاه پرداخت هنوز تنظیم نشده است"

        };

    }


    // =====================================
    // Gateway Verify Request:: M
    // استعلام از درگاه
    // =====================================

    const response =
        await fetch(
            `${GATEWAY_BASE_URL}/payment/verify`,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${GATEWAY_API_KEY}`

                },

                body:
                    JSON.stringify({

                        paymentId,

                        amount

                    })

            }
        );


    if (!response.ok) {

        throw new Error(
            `Gateway verification failed: ${response.status}`
        );

    }


    const result =
        await response.json();


    // =====================================
    // نتیجه تأیید:: M
    // =====================================

    return {

        verified:
            result?.verified === true,

        transactionId:
            result?.transactionId || null,

        raw:
            result

    };

}


// =====================================
// Generate Request ID:: M
// ساخت شناسه امن درخواست
// =====================================

export function generatePaymentRequestId() {

    return crypto
        .randomBytes(16)
        .toString("hex");

}


// =====================================
// Gateway Status:: M
// وضعیت درگاه
// =====================================

export function getGatewayStatus() {

    return {

        configured:
            isGatewayConfigured(),

        gatewayBaseUrl:
            GATEWAY_BASE_URL
                ? "CONFIGURED"
                : "NOT_CONFIGURED",

        callback:
            PAYMENT_CALLBACK_URL
                ? "CONFIGURED"
                : "NOT_CONFIGURED"

    };

    }
