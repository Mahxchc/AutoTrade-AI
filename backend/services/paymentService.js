// =====================================
// Payment Service:: M
// AutoTrade AI
// Withdrawal Management Layer
// File: backend/services/paymentService.js
// =====================================

import Withdrawal from "../models/Withdrawal.js";
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";


// =====================================
// Create Withdrawal Request
// =====================================

export async function createWithdrawRequest({

    userId,

    amount,

    method = "RIAL",

    destination = ""

}) {

    // =====================================
    // Validate User
    // =====================================

    if (!userId) {

        throw new Error(
            "User ID is required"
        );

    }


    // =====================================
    // Validate Amount
    // =====================================

    const numericAmount =
        Number(amount);


    if (
        !Number.isFinite(
            numericAmount
        ) ||
        numericAmount <= 0
    ) {

        throw new Error(
            "Withdrawal amount must be greater than zero"
        );

    }


    // =====================================
    // Find User
    // =====================================

    const user =
        await User.findById(
            userId
        );


    if (!user) {

        throw new Error(
            "User not found"
        );

    }


    // =====================================
    // User Approval Check
    // =====================================

    if (
        user.approvalStatus !==
        "APPROVED"
    ) {

        throw new Error(
            "User has not been approved"
        );

    }


    // =====================================
    // Get Wallet
    // =====================================

    const wallet =
        await Wallet.findOne({

            userId

        });


    if (!wallet) {

        throw new Error(
            "Wallet not found"
        );

    }


    if (
        wallet.status !==
        "ACTIVE"
    ) {

        throw new Error(
            "Wallet is not active"
        );

    }


    // =====================================
    // Check Withdrawable Balance
    // =====================================

    if (
        numericAmount >
        wallet.withdrawable
    ) {

        throw new Error(
            "Insufficient withdrawable balance"
        );

    }


    // =====================================
    // Create Withdrawal Request
    // =====================================

    const withdrawal =
        await Withdrawal.create({

            userId,

            walletId:
                wallet._id,

            amount:
                numericAmount,

            currency:
                wallet.currency,

            method:
                String(method)
                    .toUpperCase(),

            destination:

                destination
                ? String(destination).trim()
                : "",

            status:
                "PENDING"

        });


    // =====================================
    // IMPORTANT
    // =====================================
    //
    // Wallet balance is NOT reduced here.
    //
    // The amount remains available until
    // the withdrawal is approved/processed.
    //
    // This prevents an unapproved request
    // from destroying the user's balance.
    // =====================================


    return {

        success: true,

        requestId:
            withdrawal._id,

        withdrawal

    };
}


// =====================================
// Get Withdrawal Status
// =====================================

export async function checkWithdrawStatus({

    requestId

}) {

    if (!requestId) {

        throw new Error(
            "Withdrawal request ID is required"
        );

    }


    const withdrawal =
        await Withdrawal.findById(
            requestId
        );


    if (!withdrawal) {

        throw new Error(
            "Withdrawal request not found"
        );

    }


    return {

        success: true,

        requestId:

            withdrawal._id,

        status:

            withdrawal.status,

        withdrawal

    };
}


// =====================================
// Get User Withdrawals
// =====================================

export async function getUserWithdrawals(
    userId
) {

    if (!userId) {

        throw new Error(
            "User ID is required"
        );

    }


    const withdrawals =
        await Withdrawal.find({

            userId

        })
        .sort({

            createdAt: -1

        });


    return withdrawals;
}


// =====================================
// Approve Withdrawal
// =====================================
//
// Admin/Owner operation.
//
// The actual wallet deduction should happen
// only when the payment is processed.
// =====================================

export async function approveWithdrawal({

    requestId,

    adminUserId

}) {

    if (!requestId) {

        throw new Error(
            "Withdrawal request ID is required"
        );

    }


    if (!adminUserId) {

        throw new Error(
            "Admin user ID is required"
        );

    }


    const admin =
        await User.findById(
            adminUserId
        );


    if (
        !admin ||
        admin.isAdmin !== true
    ) {

        throw new Error(
            "Admin permission required"
        );

    }


    const withdrawal =
        await Withdrawal.findById(
            requestId
        );


    if (!withdrawal) {

        throw new Error(
            "Withdrawal request not found"
        );

    }


    if (
        withdrawal.status !==
        "PENDING"
    ) {

        throw new Error(
            "Withdrawal cannot be approved in its current state"
        );

    }


    withdrawal.status =
        "APPROVED";

    withdrawal.reviewedBy =
        admin._id;

    withdrawal.reviewedAt =
        new Date();


    await withdrawal.save();


    return {

        success: true,

        withdrawal

    };
}


// =====================================
// Reject Withdrawal
// =====================================

export async function rejectWithdrawal({

    requestId,

    adminUserId,

    reason = ""

}) {

    if (!requestId) {

        throw new Error(
            "Withdrawal request ID is required"
        );

    }


    if (!adminUserId) {

        throw new Error(
            "Admin user ID is required"
        );

    }


    const admin =
        await User.findById(
            adminUserId
        );


    if (
        !admin ||
        admin.isAdmin !== true
    ) {

        throw new Error(
            "Admin permission required"
        );

    }


    const withdrawal =
        await Withdrawal.findById(
            requestId
        );


    if (!withdrawal) {

        throw new Error(
            "Withdrawal request not found"
        );

    }


    if (
        withdrawal.status !==
        "PENDING"
    ) {

        throw new Error(
            "Withdrawal cannot be rejected in its current state"
        );

    }


    withdrawal.status =
        "REJECTED";

    withdrawal.reviewedBy =
        admin._id;

    withdrawal.reviewedAt =
        new Date();

    withdrawal.rejectionReason =
        String(reason).trim();


    await withdrawal.save();


    return {

        success: true,

        withdrawal

    };
        }
