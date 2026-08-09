// =====================================
// User Service:: M
// AutoTrade AI
// User Management Layer
// File: backend/services/userService.js
// =====================================

import User from "../models/User.js";


// =====================================
// Get Or Create User
// =====================================

export async function getOrCreateUser({
    telegramId,
    username = "",
    firstName = "",
    lastName = "",
    phoneNumber = ""
}) {

    if (!telegramId) {
        throw new Error(
            "Telegram ID is required"
        );
    }


    let user = await User.findOne({
        telegramId
    });


    // =====================================
    // Create New User
    // =====================================

    if (!user) {

        user = await User.create({

            telegramId,

            username,

            firstName,

            lastName,

            phoneNumber,

            accessEnabled: false,

            isAdmin: false,

            botAccess: false,

            botActive: false,

            approvalStatus: "PENDING",

            status: "PENDING",

            lastLogin: new Date()

        });

    }

    else {

        // =====================================
        // Update Basic Telegram Information
        // =====================================

        user.username =
            username || user.username;

        user.firstName =
            firstName || user.firstName;

        user.lastName =
            lastName || user.lastName;

        user.lastLogin =
            new Date();

        await user.save();
    }


    return user;
}


// =====================================
// Get User Information
// =====================================

export async function getUserInfo(
    telegramId
) {

    if (!telegramId) {
        throw new Error(
            "Telegram ID is required"
        );
    }


    const user =
        await User.findOne({
            telegramId
        });


    return user;
}


// =====================================
// Update User Profile
// =====================================
//
// The user must provide the information
// required before requesting approval.
//
// =====================================

export async function updateUserProfile({
    telegramId,
    firstName,
    lastName,
    phoneNumber
}) {

    if (!telegramId) {
        throw new Error(
            "Telegram ID is required"
        );
    }


    if (!firstName) {
        throw new Error(
            "First name is required"
        );
    }


    if (!lastName) {
        throw new Error(
            "Last name is required"
        );
    }


    if (!phoneNumber) {
        throw new Error(
            "Phone number is required"
        );
    }


    const user =
        await User.findOne({
            telegramId
        });


    if (!user) {
        throw new Error(
            "User not found"
        );
    }


    user.firstName =
        firstName.trim();

    user.lastName =
        lastName.trim();

    user.phoneNumber =
        phoneNumber.trim();


    await user.save();


    return user;
}


// =====================================
// Request Trading Approval
// =====================================

export async function requestTradingApproval(
    telegramId
) {

    const user =
        await User.findOne({
            telegramId
        });


    if (!user) {
        throw new Error(
            "User not found"
        );
    }


    if (
        !user.firstName ||
        !user.lastName ||
        !user.phoneNumber
    ) {
        throw new Error(
            "Complete user profile is required before requesting approval"
        );
    }


    if (
        user.approvalStatus === "APPROVED"
    ) {
        return user;
    }


    user.approvalStatus =
        "PENDING";

    user.status =
        "PENDING";

    user.accessEnabled =
        false;

    user.botAccess =
        false;

    user.botActive =
        false;


    await user.save();


    return user;
}


// =====================================
// Approve User
// =====================================
//
// This function is intended for the owner/
// admin control layer.
//
// =====================================

export async function approveUser(
    telegramId
) {

    const user =
        await User.findOne({
            telegramId
        });


    if (!user) {
        throw new Error(
            "User not found"
        );
    }


    user.approvalStatus =
        "APPROVED";

    user.status =
        "ACTIVE";

    user.accessEnabled =
        true;

    user.botAccess =
        true;


    await user.save();


    return user;
}


// =====================================
// Reject User
// =====================================

export async function rejectUser(
    telegramId
) {

    const user =
        await User.findOne({
            telegramId
        });


    if (!user) {
        throw new Error(
            "User not found"
        );
    }


    user.approvalStatus =
        "REJECTED";

    user.status =
        "BLOCKED";

    user.accessEnabled =
        false;

    user.botAccess =
        false;

    user.botActive =
        false;


    await user.save();


    return user;
}


// =====================================
// Activate Bot
// =====================================

export async function activateBot(
    telegramId
) {

    const user =
        await User.findOne({
            telegramId
        });


    if (!user) {
        throw new Error(
            "User not found"
        );
    }


    if (
        user.approvalStatus !==
        "APPROVED"
    ) {
        throw new Error(
            "User has not been approved"
        );
    }


    if (
        user.accessEnabled !== true ||
        user.botAccess !== true
    ) {
        throw new Error(
            "User does not have trading access"
        );
    }


    user.botActive =
        true;


    await user.save();


    return user;
}


// =====================================
// Deactivate Bot
// =====================================

export async function deactivateBot(
    telegramId
) {

    const user =
        await User.findOne({
            telegramId
        });


    if (!user) {
        throw new Error(
            "User not found"
        );
    }


    user.botActive =
        false;


    await user.save();


    return user;
}
