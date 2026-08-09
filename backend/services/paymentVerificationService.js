// =====================================
// AutoTrade AI
// Payment Verification Service:: M
// سرویس تأیید پرداخت
// File: backend/services/paymentVerificationService.js
// =====================================

import mongoose from "mongoose";

import Deposit from "../models/Deposit.js";

import {
    confirmDeposit
} from "./depositService.js";


// =====================================
// Verify Payment:: M
// تأیید پرداخت
// =====================================
//
// مهم:
//
// این سرویس نباید بر اساس اطلاعاتی که
// کاربر از Mini App ارسال می‌کند، پرداخت
// را معتبر اعلام کند.
//
// درگاه پرداخت باید ابتدا تراکنش را
// تأیید کند و اطلاعات تأییدشده به این
// سرویس داده شود.
// =====================================

export async function verifyPayment({
    depositId,
    paymentId = null,
    transactionId = null,
    gateway = null,
    verified = false
}) {

    // =====================================
    // Validate Deposit ID:: M
    // بررسی شناسه واریز
    // =====================================

    if (
        !mongoose.Types.ObjectId.isValid(
            depositId
        )
    ) {

        throw new Error(
            "شناسه واریز نامعتبر است"
        );

    }


    // =====================================
    // Find Deposit:: M
    // پیدا کردن واریز
    // =====================================

    const deposit =
        await Deposit.findById(
            depositId
        );


    if (!deposit) {

        throw new Error(
            "درخواست واریز پیدا نشد"
        );

    }


    // =====================================
    // Already Completed:: M
    // قبلاً تأیید شده
    // =====================================

    if (
        deposit.walletCredited === true ||
        deposit.status === "COMPLETED"
    ) {

        return {

            success:
                true,

            alreadyVerified:
                true,

            deposit

        };

    }


    // =====================================
    // Payment Verification:: M
    // بررسی تأیید واقعی پرداخت
    // =====================================

    if (
        verified !== true
    ) {

        throw new Error(
            "پرداخت توسط درگاه تأیید نشده است"
        );

    }


    // =====================================
    // Payment Reference:: M
    // بررسی شناسه پرداخت
    // =====================================

    if (
        !paymentId &&
        !transactionId
    ) {

        throw new Error(
            "شناسه پرداخت یا شناسه تراکنش الزامی است"
        );

    }


    // =====================================
    // Confirm Deposit:: M
    // تأیید و شارژ کیف پول
    // =====================================

    const result =
        await confirmDeposit({

            depositId,

            paymentId,

            transactionId,

            gateway

        });


    // =====================================
    // Return Result:: M
    // نتیجه
    // =====================================

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
// Get Payment Status:: M
// دریافت وضعیت پرداخت
// =====================================

export async function getPaymentStatus(
    depositId
) {

    if (
        !mongoose.Types.ObjectId.isValid(
            depositId
        )
    ) {

        throw new Error(
            "شناسه واریز نامعتبر است"
        );

    }


    const deposit =
        await Deposit.findById(
            depositId
        );


    if (!deposit) {

        throw new Error(
            "درخواست واریز پیدا نشد"
        );

    }


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

        confirmedAt:
            deposit.confirmedAt

    };

}
