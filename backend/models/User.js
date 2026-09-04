// =====================================
// ..M AutoTrade AI
// Telegram Bot
// File: backend/bot.js
// =====================================

import User from "./models/User.js";


// =====================================
// Environment :: M
// =====================================

const BOT_TOKEN =
    process.env.TELEGRAM_BOT_TOKEN;

const BACKEND_URL =
    process.env.BACKEND_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    "";

const MINI_APP_URL =
    process.env.MINI_APP_URL ||
    process.env.FRONTEND_URL ||
    "";


// =====================================
// Telegram API :: M
// =====================================

const TELEGRAM_API =
    BOT_TOKEN
        ? `https://api.telegram.org/bot${BOT_TOKEN}`
        : null;


// =====================================
// Telegram Request :: M
// =====================================

async function telegramRequest(
    method,
    body = {}
) {

    if (!TELEGRAM_API) {

        throw new Error(
            "TELEGRAM_BOT_TOKEN is not configured"
        );

    }


    const response =
        await fetch(
            `${TELEGRAM_API}/${method}`,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json"

                },

                body:
                    JSON.stringify(body)

            }
        );


    const data =
        await response.json();


    if (!data.ok) {

        console.error(
            "Telegram API Error:",
            data
        );

        throw new Error(
            data.description ||
            "Telegram API request failed"
        );

    }


    return data.result;

}


// =====================================
// Send Message :: M
// =====================================

async function sendMessage(
    chatId,
    text,
    replyMarkup = undefined
) {

    const body = {

        chat_id:
            chatId,

        text,

        parse_mode:
            "HTML",

        disable_web_page_preview:
            true

    };


    if (replyMarkup) {

        body.reply_markup =
            replyMarkup;

    }


    return telegramRequest(
        "sendMessage",
        body
    );

}


// =====================================
// Welcome Message :: M
// =====================================

async function sendWelcomeMessage(
    chatId,
    firstName,
    lastName
) {

    const fullName =
        [
            firstName,
            lastName
        ]
        .filter(Boolean)
        .join(" ");


    const displayName =
        fullName ||
        "کاربر عزیز";


    return sendMessage(

        chatId,

        `👋 <b>سلام ${escapeHtml(displayName)}!</b>

به <b>AutoTrade AI</b> خوش آمدید 🚀

برای ساخت حساب شما، اطلاعات Telegram شما را ثبت می‌کنیم.

👤 <b>نام و نام خانوادگی:</b>
${escapeHtml(displayName)}

در مرحله بعد شماره تلفن خود را با دکمه زیر ارسال کنید 📱`,

        {

            keyboard: [

                [

                    {

                        text:
                            "📱 ارسال شماره تلفن",

                        request_contact:
                            true

                    }

                ]

            ],

            resize_keyboard:
                true,

            one_time_keyboard:
                true

        }

    );

}


// =====================================
// Registered Message :: M
// =====================================

async function sendRegisteredMessage(
    chatId,
    firstName
) {

    const miniAppButton =
        MINI_APP_URL
            ? {

                inline_keyboard: [

                    [

                        {

                            text:
                                "🚀 ورود به AutoTrade AI",

                            web_app: {

                                url:
                                    MINI_APP_URL

                            }

                        }

                    ]

                ]

            }
            : undefined;


    return sendMessage(

        chatId,

        `🎉 <b>ثبت‌نام شما کامل شد!</b>

سلام ${escapeHtml(firstName || "کاربر عزیز")} 👋

اطلاعات حساب شما با موفقیت ثبت شد.

✅ نام و نام خانوادگی
✅ شماره تلفن
✅ حساب Telegram

اکنون می‌توانید وارد AutoTrade AI شوید.`,

        miniAppButton

    );

}


// =====================================
// Existing User Message :: M
// =====================================

async function sendExistingUserMessage(
    chatId,
    firstName
) {

    const miniAppButton =
        MINI_APP_URL
            ? {

                inline_keyboard: [

                    [

                        {

                            text:
                                "🚀 ورود به AutoTrade AI",

                            web_app: {

                                url:
                                    MINI_APP_URL

                            }

                        }

                    ]

                ]

            }
            : undefined;


    return sendMessage(

        chatId,

        `👋 <b>خوش برگشتی ${escapeHtml(firstName || "کاربر عزیز")}!</b>

حساب شما قبلاً ثبت شده است. ✅

می‌توانید مستقیماً وارد AutoTrade AI شوید.`,

        miniAppButton

    );

}


// =====================================
// Phone Request Message :: M
// =====================================

async function sendPhoneRequest(
    chatId
) {

    return sendMessage(

        chatId,

        `📱 <b>شماره تلفن شما هنوز ثبت نشده است.</b>

برای تکمیل ثبت‌نام، روی دکمه زیر بزنید تا شماره Telegram خودتان را ارسال کنید.`,

        {

            keyboard: [

                [

                    {

                        text:
                            "📱 ارسال شماره تلفن",

                        request_contact:
                            true

                    }

                ]

            ],

            resize_keyboard:
                true,

            one_time_keyboard:
                true

        }

    );

}


// =====================================
// Escape HTML :: M
// =====================================

function escapeHtml(
    value
) {

    return String(
        value || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================
// Normalize Phone :: M
// =====================================

function normalizePhone(
    phone
) {

    if (!phone) {

        return "";

    }


    return String(
        phone
    )
        .trim()
        .replace(
            /[\s()-]/g,
            ""
        );

}


// =====================================
// Handle /start :: M
// =====================================

async function handleStart(
    message
) {

    const from =
        message.from;

    const chat =
        message.chat;


    if (!from || !chat) {

        return;

    }


    const telegramId =
        String(
            from.id
        );


    const firstName =
        String(
            from.first_name ||
            ""
        )
        .trim();


    const lastName =
        String(
            from.last_name ||
            ""
        )
        .trim();


    const username =
        String(
            from.username ||
            ""
        )
        .trim();


    let user =
        await User.findOne({

            telegramId

        });


    // ---------------------------------
    // Create User :: M
    // ---------------------------------

    if (!user) {

        user =
            await User.create({

                telegramId,

                username,

                firstName,

                lastName,

                phoneNumber:
                    "",

                accessEnabled:
                    false,

                approvalStatus:
                    "PENDING",

                isAdmin:
                    false,

                botAccess:
                    false,

                botActive:
                    false,

                status:
                    "PENDING",

                lastLogin:
                    new Date()

            });


        console.log(
            `New Telegram user registered: ${telegramId}`
        );

    }

    else {

        // -----------------------------
        // Update Telegram Identity
        // -----------------------------

        user.username =
            username;

        user.firstName =
            firstName;

        user.lastName =
            lastName;

        user.lastLogin =
            new Date();


        await user.save();

    }


    // ---------------------------------
    // User already has phone
    // ---------------------------------

    if (
        user.phoneNumber
    ) {

        return sendExistingUserMessage(

            chat.id,

            user.firstName

        );

    }


    // ---------------------------------
    // New / incomplete registration
    // ---------------------------------

    return sendWelcomeMessage(

        chat.id,

        user.firstName,

        user.lastName

    );

}


// =====================================
// Handle Phone Contact :: M
// =====================================

async function handlePhoneContact(
    message
) {

    const from =
        message.from;

    const contact =
        message.contact;

    const chat =
        message.chat;


    if (
        !from ||
        !contact ||
        !chat
    ) {

        return;

    }


    // ---------------------------------
    // Security Check
    // ---------------------------------
    //
    // شماره باید متعلق به همان کاربری
    // باشد که آن را ارسال کرده است.
    //
    // ---------------------------------

    if (
        contact.user_id &&
        String(
            contact.user_id
        ) !==
        String(
            from.id
        )
    ) {

        return sendMessage(

            chat.id,

            `❌ <b>شماره ارسال‌شده متعلق به حساب Telegram شما نیست.</b>

لطفاً از دکمه <b>📱 ارسال شماره تلفن</b> استفاده کنید و شماره خودتان را ارسال کنید.`

        );

    }


    const telegramId =
        String(
            from.id
        );


    const phoneNumber =
        normalizePhone(
            contact.phone_number
        );


    if (!phoneNumber) {

        return sendMessage(

            chat.id,

            "❌ شماره تلفن معتبر دریافت نشد. لطفاً دوباره تلاش کنید."

        );

    }


    const user =
        await User.findOne({

            telegramId

        });


    if (!user) {

        return sendMessage(

            chat.id,

            `❌ حساب شما پیدا نشد.

لطفاً ابتدا /start را ارسال کنید.`

        );

    }


    // ---------------------------------
    // Save Phone :: M
    // ---------------------------------

    user.phoneNumber =
        phoneNumber;

    user.firstName =
        String(
            from.first_name ||
            user.firstName ||
            ""
        )
        .trim();

    user.lastName =
        String(
            from.last_name ||
            user.lastName ||
            ""
        )
        .trim();

    user.username =
        String(
            from.username ||
            user.username ||
            ""
        )
        .trim();

    user.lastLogin =
        new Date();


    await user.save();


    console.log(
        `Telegram phone saved for user: ${telegramId}`
    );


    return sendRegisteredMessage(

        chat.id,

        user.firstName

    );

}


// =====================================
// Handle Telegram Update :: M
// =====================================

export async function handleTelegramUpdate(
    update
) {

    if (!update) {

        return;

    }


    const message =
        update.message;


    if (!message) {

        return;

    }


    const text =
        String(
            message.text ||
            ""
        )
        .trim();


    // ---------------------------------
    // /start
    // ---------------------------------

    if (
        text === "/start" ||
        text.startsWith("/start ")
    ) {

        await handleStart(
            message
        );

        return;

    }


    // ---------------------------------
    // Contact
    // ---------------------------------

    if (
        message.contact
    ) {

        await handlePhoneContact(
            message
        );

        return;

    }

}


// =====================================
// Setup Webhook :: M
// =====================================

export async function setupTelegramWebhook() {

    if (!BOT_TOKEN) {

        console.warn(
            "Telegram Bot disabled: TELEGRAM_BOT_TOKEN is missing"
        );

        return;

    }


    if (!BACKEND_URL) {

        console.warn(
            "Telegram Bot webhook skipped: BACKEND_URL or RENDER_EXTERNAL_URL is missing"
        );

        return;

    }


    const webhookUrl =
        `${BACKEND_URL.replace(/\/$/, "")}/api/telegram/webhook`;


    try {

        const result =
            await telegramRequest(

                "setWebhook",

                {

                    url:
                        webhookUrl,

                    allowed_updates: [

                        "message"

                    ],

                    drop_pending_updates:
                        false

                }

            );


        console.log(
            "Telegram webhook configured:",
            webhookUrl
        );


        console.log(
            "Telegram webhook result:",
            result
        );

    }

    catch (error) {

        console.error(
            "Telegram webhook setup failed:",
            error.message
        );

    }

}


// =====================================
// Bot Info :: M
// =====================================

export async function getTelegramBotInfo() {

    if (!BOT_TOKEN) {

        return null;

    }


    return telegramRequest(
        "getMe"
    );

}