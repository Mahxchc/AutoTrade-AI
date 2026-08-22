// =====================================
// Telegram Authentication :: M
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

        // =================================
        // Validate Input
        // =================================

        if (
            typeof initData !== "string" ||
            !initData.trim()
        ) {

            return {

                valid: false,

                message:
                    "Telegram initData is missing"

            };

        }


        // =================================
        // Get Bot Token
        // =================================

        const botToken =
            process.env.TELEGRAM_BOT_TOKEN
                ?.trim();


        if (!botToken) {

            console.error(
                "[TELEGRAM AUTH] TELEGRAM_BOT_TOKEN is missing"
            );


            return {

                valid: false,

                message:
                    "TELEGRAM_BOT_TOKEN is not configured"

            };

        }


        // =================================
        // Parse Telegram InitData
        // =================================

        const params =
            new URLSearchParams(
                initData
            );


        // =================================
        // Get Received Hash
        // =================================

        const receivedHash =
            params.get("hash");


        if (!receivedHash) {

            return {

                valid: false,

                message:
                    "Telegram hash is missing"

            };

        }


        // =================================
        // Validate Hash Format
        // =================================

        if (
            !/^[a-fA-F0-9]{64}$/.test(
                receivedHash
            )
        ) {

            return {

                valid: false,

                message:
                    "Invalid Telegram hash format"

            };

        }


        // =================================
        // Remove Hash
        // =================================

        params.delete("hash");


        // =================================
        // Build Data Check String
        // =================================

        const dataCheckString =
            Array.from(
                params.entries()
            )
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


        if (!dataCheckString) {

            return {

                valid: false,

                message:
                    "Telegram data check string is empty"

            };

        }


        // =================================
        // Create Telegram Secret Key
        // =================================
        //
        // Telegram specification:
        //
        // secret_key =
        // HMAC_SHA256(
        //     bot_token,
        //     "WebAppData"
        // )
        //
        // Node.js:
        //
        // createHmac(
        //     "sha256",
        //     "WebAppData"
        // ).update(botToken)
        //
        // =================================

        const secretKey =
            crypto
                .createHmac(
                    "sha256",
                    "WebAppData"
                )
                .update(
                    botToken,
                    "utf8"
                )
                .digest();


        // =================================
        // Calculate Telegram Hash
        // =================================

        const calculatedHash =
            crypto
                .createHmac(
                    "sha256",
                    secretKey
                )
                .update(
                    dataCheckString,
                    "utf8"
                )
                .digest("hex");


        // =================================
        // Convert Hashes
        // =================================

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


        // =================================
        // Compare Hashes
        // =================================

        if (
            receivedBuffer.length !==
            calculatedBuffer.length
        ) {

            console.error(
                "[TELEGRAM AUTH] Hash length mismatch"
            );


            return {

                valid: false,

                message:
                    "Invalid Telegram signature"

            };

        }


        const hashesMatch =
            crypto.timingSafeEqual(
                receivedBuffer,
                calculatedBuffer
            );


        if (!hashesMatch) {

            console.error(
                "[TELEGRAM AUTH] Signature mismatch"
            );


            // ---------------------------------
            // Safe diagnostic information
            // ---------------------------------
            //
            // NEVER log the bot token.
            //
            console.error(
                "[TELEGRAM AUTH] Bot token configured:",
                Boolean(botToken)
            );

            console.error(
                "[TELEGRAM AUTH] InitData length:",
                initData.length
            );

            console.error(
                "[TELEGRAM AUTH] Data check length:",
                dataCheckString.length
            );

            console.error(
                "[TELEGRAM AUTH] Received hash:",
                receivedHash
            );

            console.error(
                "[TELEGRAM AUTH] Calculated hash:",
                calculatedHash
            );


            return {

                valid: false,

                message:
                    "Invalid Telegram signature"

            };

        }


        // =================================
        // Validate auth_date
        // =================================

        const authDate =
            Number(
                params.get(
                    "auth_date"
                )
            );


        if (
            !Number.isSafeInteger(
                authDate
            ) ||
            authDate <= 0
        ) {

            return {

                valid: false,

                message:
                    "Telegram auth_date is missing or invalid"

            };

        }


        // =================================
        // Current Time
        // =================================

        const currentTime =
            Math.floor(
                Date.now() / 1000
            );


        const authAge =
            currentTime -
            authDate;


        // =================================
        // Reject Future Data
        // =================================

        if (
            authAge < -60
        ) {

            return {

                valid: false,

                message:
                    "Invalid Telegram authentication time"

            };

        }


        // =================================
        // Reject Old Data
        // =================================

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


        // =================================
        // Get Telegram User
        // =================================

        const userRaw =
            params.get("user");


        if (!userRaw) {

            return {

                valid: false,

                message:
                    "Telegram user is missing"

            };

        }


        // =================================
        // Parse Telegram User
        // =================================

        let telegramUser;


        try {

            telegramUser =
                JSON.parse(
                    userRaw
                );

        }

        catch (error) {

            console.error(
                "[TELEGRAM AUTH] User JSON parse error"
            );


            return {

                valid: false,

                message:
                    "Invalid Telegram user data"

            };

        }


        // =================================
        // Validate Telegram User
        // =================================

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


        // =================================
        // Authentication Successful
        // =================================

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
            "[TELEGRAM AUTH ERROR]",
            error
        );


        return {

            valid: false,

            message:
                "Telegram authentication failed"

        };

    }

}