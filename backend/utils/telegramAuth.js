// =====================================
// Telegram Authentication:: M
// AutoTrade AI
// Secure Telegram WebApp Authentication
// File: backend/utils/telegramAuth.js
// =====================================

import crypto from "crypto";


// =====================================
// Telegram initData Maximum Age
// =====================================

const MAX_AUTH_AGE =
    24 * 60 * 60;


// =====================================
// Validate Telegram WebApp initData
// =====================================

export function validateTelegramInitData(
    initData
) {

    try {

        // =====================================
        // Check initData
        // =====================================

        if (!initData) {

            return {

                valid: false,

                message:
                    "Telegram initData is missing"

            };

        }


        // =====================================
        // Get Bot Token
        // =====================================

        const botToken =
            process.env.TELEGRAM_BOT_TOKEN;


        if (!botToken) {

            return {

                valid: false,

                message:
                    "TELEGRAM_BOT_TOKEN is not configured"

            };

        }


        // =====================================
        // Parse Telegram Data
        // =====================================

        const params =
            new URLSearchParams(
                initData
            );


        // =====================================
        // Get Telegram Hash
        // =====================================

        const receivedHash =
            params.get("hash");


        if (!receivedHash) {

            return {

                valid: false,

                message:
                    "Telegram hash is missing"

            };

        }


        // =====================================
        // Validate Hash Format
        // =====================================

        if (
            !/^[a-f0-9]{64}$/i.test(
                receivedHash
            )
        ) {

            return {

                valid: false,

                message:
                    "Invalid Telegram hash format"

            };

        }


        // =====================================
        // Remove Hash
        // =====================================

        params.delete("hash");


        // =====================================
        // Build Data Check String
        // =====================================

        const dataCheckString =
            [...params.entries()]
                .sort(
                    ([keyA], [keyB]) =>
                        keyA.localeCompare(
                            keyB
                        )
                )
                .map(
                    ([key, value]) =>
                        `${key}=${value}`
                )
                .join("\n");


        // =====================================
        // Create Telegram Secret Key
        // =====================================

        const secretKey =
            crypto
                .createHmac(
                    "sha256",
                    "WebAppData"
                )
                .update(
                    botToken
                )
                .digest();


        // =====================================
        // Calculate Telegram Hash
        // =====================================

        const calculatedHash =
            crypto
                .createHmac(
                    "sha256",
                    secretKey
                )
                .update(
                    dataCheckString
                )
                .digest("hex");


        // =====================================
        // Convert Hashes To Buffers
        // =====================================

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


        // =====================================
        // Hash Length Check
        // =====================================

        if (
            receivedBuffer.length !==
            calculatedBuffer.length
        ) {

            return {

                valid: false,

                message:
                    "Invalid Telegram signature"

            };

        }


        // =====================================
        // Secure Hash Comparison
        // =====================================

        if (
            !crypto.timingSafeEqual(
                receivedBuffer,
                calculatedBuffer
            )
        ) {

            return {

                valid: false,

                message:
                    "Invalid Telegram signature"

            };

        }


        // =====================================
        // Validate auth_date
        // =====================================

        const authDate =
            Number(
                params.get(
                    "auth_date"
                )
            );


        if (
            !Number.isFinite(
                authDate
            )
        ) {

            return {

                valid: false,

                message:
                    "Telegram auth_date is missing"

            };

        }


        // =====================================
        // Current Time
        // =====================================

        const currentTime =
            Math.floor(
                Date.now() / 1000
            );


        const authAge =
            currentTime -
            authDate;


        // =====================================
        // Reject Future Data
        // =====================================

        if (
            authAge < -60
        ) {

            return {

                valid: false,

                message:
                    "Invalid Telegram authentication time"

            };

        }


        // =====================================
        // Reject Old Data
        // =====================================

        if (
            authAge >
            MAX_AUTH_AGE
        ) {

            return {

                valid: false,

                message:
                    "Telegram authentication data has expired"

            };

        }


        // =====================================
        // Get Telegram User
        // =====================================

        const userRaw =
            params.get("user");


        if (!userRaw) {

            return {

                valid: false,

                message:
                    "Telegram user is missing"

            };

        }


        // =====================================
        // Parse Telegram User
        // =====================================

        let telegramUser;


        try {

            telegramUser =
                JSON.parse(
                    userRaw
                );

        }

        catch {

            return {

                valid: false,

                message:
                    "Invalid Telegram user data"

            };

        }


        // =====================================
        // Validate Telegram User ID
        // =====================================

        if (
            !telegramUser ||
            !telegramUser.id
        ) {

            return {

                valid: false,

                message:
                    "Telegram user ID is missing"

            };

        }


        // =====================================
        // Final Success
        // =====================================

        return {

            valid: true,

            user:
                telegramUser,

            authDate:

                authDate

        };

    }

    catch (error) {

        console.error(
            "Telegram authentication error:",
            error
        );


        return {

            valid: false,

            message:
                "Telegram authentication failed"

        };

    }

}