// =====================================
// Telegram Authentication:: M
// AutoTrade AI
// File: backend/utils/telegramAuth.js
// =====================================

import crypto from "crypto";


// =====================================
// Validate Telegram WebApp initData
// =====================================

export function validateTelegramInitData(
    initData
) {

    try {

        if (!initData) {

            return {
                valid: false,
                message: "Telegram initData is missing"
            };

        }


        const botToken =
            process.env.TELEGRAM_BOT_TOKEN;


        if (!botToken) {

            return {
                valid: false,
                message:
                    "TELEGRAM_BOT_TOKEN is not configured"
            };

        }


        const params =
            new URLSearchParams(initData);


        const receivedHash =
            params.get("hash");


        if (!receivedHash) {

            return {
                valid: false,
                message:
                    "Telegram hash is missing"
            };

        }


        params.delete("hash");


        const dataCheckString =
            [...params.entries()]
                .sort(([a], [b]) =>
                    a.localeCompare(b)
                )
                .map(
                    ([key, value]) =>
                        `${key}=${value}`
                )
                .join("\n");


        const secretKey =
            crypto
                .createHmac(
                    "sha256",
                    "WebAppData"
                )
                .update(botToken)
                .digest();


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
                message:
                    "Invalid Telegram signature"
            };

        }


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


        const userRaw =
            params.get("user");


        let telegramUser = null;


        if (userRaw) {

            try {

                telegramUser =
                    JSON.parse(userRaw);

            }

            catch {

                return {
                    valid: false,
                    message:
                        "Invalid Telegram user data"
                };

            }

        }


        if (
            !telegramUser ||
            !telegramUser.id
        ) {

            return {
                valid: false,
                message:
                    "Telegram user is missing"
            };

        }


        return {

            valid: true,

            user: telegramUser

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