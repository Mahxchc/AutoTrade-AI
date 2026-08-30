// =====================================
// ..M AutoTrade AI
// Payment Verification Service
// سرویس تأیید پرداخت
// File: backend/services/paymentVerificationService.js
// =====================================

import mongoose from "mongoose";

import Deposit from "../models/Deposit.js";

import {
    confirmDeposit
} from "./depositService.js";


// =====================================
// ..M Verify Payment
// تأیید پرداخت
// =====================================
//
// نکته امنیتی:
//
// این سرویس نباید فقط بر اساس
// اطلاعات Client پرداخت را تأیید کند.
//
// تأیید واقعی باید از سمت Gateway
// یا سیستم پرداخت معتبر انجام شود.
//
// تا زمانی که اتصال واقعی Gateway
// پیاده‌سازی نشده باشد، این سرویس
// نباید پرداخت را خودکار معتبر کند.
// =====================================

export async function verifyPayment({

    depositId,

    paymentId = null,

    transactionId = null,

    gateway = null

}) {

    // =================================
    // ..M Validate Deposit ID
    // =================================

    if (
        !mongoose.Types.ObjectId.isValid(
            depositId
        )
    ) {

        throw new Error(
            "شناسه واریز نامعتبر است"
        );

    }


    // =================================
    // ..M Find Deposit
    // =================================

    const deposit =
        await Deposit.findById(
            depositId
        );


    if (!deposit) {

        throw new Error(
            "درخواست واریز پیدا نشد"
        );

    }


    // =================================
    // ..M Already Credited
    // جلوگیری از شارژ دوباره
    // =================================

    if (
        deposit.walletCredited === true ||
        deposit.status === "COMPLETED"
    ) {

        return {

            success:
                true,

            alreadyVerified:
                true,

            deposit,

            wallet:
                null

        };

    }


    // =================================
    // ..M Payment Reference
    // شناسه پرداخت
    // =================================

    const normalizedPaymentId =
        paymentId
            ? String(
                paymentId
            ).trim()
            : null;


    const normalizedTransactionId =
        transactionId
            ? String(
                transactionId
            ).trim()
            : null;


    if (
        !normalizedPaymentId &&
        !normalizedTransactionId
    ) {

        throw new Error(
            "شناسه پرداخت یا شناسه تراکنش الزامی است"
        );

    }


    // =================================
    // ..M Gateway
    // =================================

    const normalizedGateway =
        gateway
            ? String(
                gateway
            ).trim().toUpperCase()
            : null;


    // =================================
    // ..M Real Verification
    // =================================
    //
    // بسیار مهم:
    //
    // فعلاً هیچ Client flag مثل
    // verified:true پذیرفته نمی‌شود.
    //
    // این قسمت باید بعداً مستقیماً
    // به API درگاه متصل شود.
    // =================================

    const gatewayVerified =
        await verifyWithGateway({

            deposit,

            paymentId:
                normalizedPaymentId,

            transactionId:
                normalizedTransactionId,

            gateway:
                normalizedGateway

        });


    if (
        gatewayVerified !== true
    ) {

        throw new Error(
            "پرداخت توسط درگاه تأیید نشد"
        );

    }


    // =================================
    // ..M Confirm Deposit
    // تأیید و شارژ کیف پول
    // =================================

    const result =
        await confirmDeposit({

            depositId,

            paymentId:
                normalizedPaymentId,

            transactionId:
                normalizedTransactionId,

            gateway:
                normalizedGateway

        });


    // =================================
    // ..M Return Result
    // =================================

    return {

        success:
            true,

        alreadyVerified:
            false,

        deposit:
            result.deposit,

        wallet:
            result.wallet

    };

}


// =====================================
// ..M Gateway Verification
// بررسی واقعی درگاه
// =====================================
//
// این تابع عمداً تا زمانی که Gateway
// واقعی پروژه متصل نشده، پرداخت را
// تأیید نمی‌کند.
//
// بنابراین هیچ‌کس نمی‌تواند فقط با
// ارسال verified:true کیف پول را شارژ کند.
// =====================================

async function verifyWithGateway({

    deposit,

    paymentId,

    transactionId,

    gateway

}) {

    // =================================
    // ..M Validate Gateway
    // =================================

    if (!gateway) {

        throw new Error(
            "درگاه پرداخت مشخص نشده است"
        );

    }


    // =================================
    // ..M Validate Reference
    // =================================

    if (
        !paymentId &&
        !transactionId
    ) {

        throw new Error(
            "شناسه تراکنش درگاه موجود نیست"
        );

    }


    // =================================
    // ..M Gateway Configuration
    // =================================
    //
    // درگاه واقعی باید در این قسمت
    // به API خودش متصل شود.
    //
    // فعلاً false برگردانده می‌شود
    // تا پرداخت جعلی تأیید نشود.
    // =================================

    console.warn(
        "Payment gateway verification is not connected yet.",
        {
            depositId:
                deposit._id?.toString(),

            gateway,

            paymentId,

            transactionId
        }
    );


    return false;

}


// =====================================
// ..M Get Payment Status
// دریافت وضعیت پرداخت
// =====================================
//
// نکته:
// این تابع وضعیت یک Deposit را فقط
// بر اساس ID برمی‌گرداند.
//
// بررسی مالکیت در Route انجام می‌شود
// و نباید Client بتواند Deposit شخص
// دیگری را مشاهده کند.
// =====================================

export async function getPaymentStatus(

    depositId,

    userId = null

) {

    // =================================
    // ..M Validate Deposit ID
    // =================================

    if (
        !mongoose.Types.ObjectId.isValid(
            depositId
        )
    ) {

        throw new Error(
            "شناسه واریز نامعتبر است"
        );

    }


    // =================================
    // ..M Validate User ID
    // =================================

    if (
        userId &&
        !mongoose.Types.ObjectId.isValid(
            userId
        )
    ) {

        throw new Error(
            "شناسه کاربر نامعتبر است"
        );

    }


    // =================================
    // ..M Query
    // =================================

    const query = {

        _id:
            depositId

    };


    // =================================
    // ..M Ownership Protection
    // =================================

    if (userId) {

        query.userId =
            userId;

    }


    // =================================
    // ..M Find Deposit
    // =================================

    const deposit =
        await Deposit.findOne(
            query
        );


    if (!deposit) {

        throw new Error(
            "درخواست واریز پیدا نشد"
        );

    }


    // =================================
    // ..M Return Status
    // =================================

    return {

        depositId:
            deposit._id,

        status:
            deposit.status,

        walletCredited:
            deposit.walletCredited,

        paymentId:
            deposit.paymentId,

        transactionId:
            deposit.transactionId,

        gateway:
            deposit.gateway,

        amountUSD:
            deposit.amountUSD,

        amountToman:
            deposit.amountToman,

        exchangeRate:
            deposit.exchangeRate,

        confirmedAt:
            deposit.confirmedAt,

        createdAt:
            deposit.createdAt,

        updatedAt:
            deposit.updatedAt

    };

}