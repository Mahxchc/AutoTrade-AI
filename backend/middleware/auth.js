// =====================================
// Auth Middleware :: M
// AutoTrade AI
// Secure Telegram WebApp Authentication
// File: backend/middleware/auth.js
// =====================================

import crypto from "crypto";
import User from "../models/User.js";


// =====================================
// Telegram InitData Validation :: M
// =====================================

function validateTelegramInitData(initData) {

    const botToken =
        process.env.TELEGRAM_BOT_TOKEN;


    if (!botToken) {

        throw new Error(
            "TELEGRAM_BOT_TOKEN is not configured"
        );

    }


    if (!initData) {

        return {
            valid: false,
            reason: "Telegram initData is missing"
        };

    }


    try {

        const params =
            new URLSearchParams(initData);


        const receivedHash =
            params.get("hash");


        if (!receivedHash) {

            return {
                valid: false,
                reason: "Telegram hash is missing"
            };

        }


        params.delete("hash");


        const dataCheckString =
            [...params.entries()]
                .sort(
                    ([a], [b]) =>
                        a.localeCompare(b)
                )
                .map(
                    ([key, value]) =>
                        `${key}=${value}`
                )
                .join("\n");


        // =====================================
        // Telegram Secret Key
        // =====================================

        const secretKey =
            crypto
                .createHmac(
                    "sha256",
                    "WebAppData"
                )
                .update(botToken)
                .digest();


        // =====================================
        // Telegram Data Hash
        // =====================================

        const calculatedHash =
            crypto
                .createHmac(
                    "sha256",
                    secretKey
                )
                .update(dataCheckString)
                .digest("hex");


        const receivedBuffer =
            Buffer.from(
                receivedHash,
                "hex"
            );


        const calculatedBuffer =
            Buffer.from(
                calculatedHash,
                "hex"
            );


        if (
            receivedBuffer.length !==
            calculatedBuffer.length
        ) {

            return {
                valid: false,
                reason: "Invalid Telegram hash"
            };

        }


        const isValid =
            crypto.timingSafeEqual(
                receivedBuffer,
                calculatedBuffer
            );


        if (!isValid) {

            return {
                valid: false,
                reason: "Invalid Telegram signature"
            };

        }


        // =====================================
        // Extract Telegram User
        // =====================================

        const userRaw =
            params.get("user");


        if (!userRaw) {

            return {
                valid: false,
                reason: "Telegram user data missing"
            };

        }


        let telegramUser;


        try {

            telegramUser =
                JSON.parse(userRaw);

        }

        catch {

            return {
                valid: false,
                reason: "Invalid Telegram user data"
            };

        }


        if (!telegramUser?.id) {

            return {
                valid: false,
                reason: "Telegram user ID missing"
            };

        }


        return {

            valid: true,

            telegramUser,

            authDate:
                Number(
                    params.get("auth_date") || 0
                )

        };

    }

    catch (error) {

        console.error(
            "[Telegram Auth Error]",
            error
        );


        return {

            valid: false,

            reason:
                "Telegram authentication failed"

        };

    }

}


// =====================================
// Telegram Authentication Middleware
// =====================================

export async function requireTelegramUser(
    req,
    res,
    next
) {

    try {

        const initData =
            req.headers[
                "x-telegram-init-data"
            ];


        if (!initData) {

            return res.status(401).json({

                success: false,

                message:
                    "Telegram authentication required"

            });

        }


        const validation =
            validateTelegramInitData(
                initData
            );


        if (!validation.valid) {

            return res.status(401).json({

                success: false,

                message:
                    validation.reason

            });

        }


        const telegramUser =
            validation.telegramUser;


        // =====================================
        // Find User
        // =====================================

        let user =
            await User.findOne({

                telegramId:
                    String(telegramUser.id)

            });


        // =====================================
        // Create User Automatically
        // =====================================

        if (!user) {

            user =
                await User.create({

                    telegramId:
                        String(telegramUser.id),

                    username:
                        telegramUser.username || "",

                    firstName:
                        telegramUser.first_name || "",

                    lastName:
                        telegramUser.last_name || "",

                    accessEnabled:
                        false,

                    isAdmin:
                        false,

                    botAccess:
                        false,

                    botActive:
                        false,

                    status:
                        "PENDING"

                });

        }

        else {

            // =====================================
            // Update Telegram Profile
            // =====================================

            user.username =
                telegramUser.username || "";

            user.firstName =
                telegramUser.first_name || "";

            if (
                telegramUser.last_name !==
                undefined
            ) {

                user.lastName =
                    telegramUser.last_name || "";

            }


            await user.save();

        }


        // =====================================
        // Blocked User
        // =====================================

        if (
            user.status ===
            "BLOCKED"
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "User account is blocked"

            });

        }


        // =====================================
        // Attach Authenticated User
        // =====================================

        req.user =
            user;


        req.telegramUser =
            telegramUser;


        req.telegramAuth = {

            authDate:
                validation.authDate

        };


        next();

    }

    catch (error) {

        console.error(
            "[Auth Middleware Error]",
            error
        );


        next(error);

    }

}


// =====================================
// Require Approved User
// =====================================

export function requireApprovedUser(
    req,
    res,
    next
) {

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message:
                "Authentication required"

        });

    }


    if (
        req.user.approvalStatus &&
        req.user.approvalStatus !==
        "APPROVED"
    ) {

        return res.status(403).json({

            success: false,

            message:
                "User approval is required"

        });

    }


    if (
        req.user.accessEnabled !==
        true
    ) {

        return res.status(403).json({

            success: false,

            message:
                "User access is disabled"

        });

    }


    next();

}


// =====================================
// Require Admin
// =====================================

export function requireAdmin(
    req,
    res,
    next
) {

    if (!req.user) {

        return res.status(401).json({

            success: false,

            message:
                "Authentication required"

        });

    }


    if (
        req.user.isAdmin !==
        true
    ) {

        return res.status(403).json({

            success: false,

            message:
                "Admin permission required"

        });

    }


    next();

}