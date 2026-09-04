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
    process.env.TELEGRAM_BOT_TOKEN || "";

const BACKEND_URL =
    process.env.BACKEND_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    "";

const MINI_APP_URL =
    process.env.MINI_APP_URL ||
    process.env.FRONTEND_URL ||
    "";

const SUPPORT_USERNAME =
    "@mehdi2410l";

// =====================================
// Telegram API :: M
// =====================================

const TELEGRAM_API =
    BOT_TOKEN
        ? `https://api.telegram.org/bot${BOT_TOKEN}`
        : null;

// =====================================
// Telegram API Request :: M
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
                method: "POST",

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
// HTML Escape :: M
// =====================================

function escapeHtml(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

// =====================================
// Normalize Phone :: M
// =====================================

function normalizePhone(phone) {

    if (!phone) {
        return "";
    }

    return String(phone)
        .trim()
        .replace(/[\s()-]/g, "");

}

// =====================================
// Send Message :: M
// =====================================

export async function sendMessage(
    chatId,
    text,
    replyMarkup = null
) {

    const body = {

        chat_id: chatId,

        text,

        parse_mode: "HTML",

        disable_web_page_preview: true

    };

    if (replyMarkup) {
        body.reply_markup = replyMarkup;
    }

    return telegramRequest(
        "sendMessage",
        body
    );

}

// =====================================
// Remove Keyboard :: M
// =====================================

async function removeKeyboard(chatId) {

    return sendMessage(

        chatId,

        " ",
        {
            remove_keyboard: true
        }

    );

}

// =====================================
// Phone Keyboard :: M
// =====================================

function getPhoneKeyboard() {

    return {

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

        resize_keyboard: true,

        one_time_keyboard: true

    };

}

// =====================================
// Mini App Keyboard :: M
// =====================================

function getMiniAppKeyboard() {

    if (!MINI_APP_URL) {
        return null;
    }

    return {

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

    };

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

برای ساخت حساب، اطلاعات Telegram شما ثبت شده است.

👤 <b>نام:</b>
${escapeHtml(firstName || "ثبت نشده")}

👤 <b>نام خانوادگی:</b>
${escapeHtml(lastName || "ثبت نشده")}

برای تکمیل ثبت‌نام، شماره تلفن خود را با دکمه زیر ارسال کنید 📱`,

        getPhoneKeyboard()

    );

}

// =====================================
// Phone Request :: M
// =====================================

async function sendPhoneRequest(chatId) {

    return sendMessage(

        chatId,

        `📱 <b>شماره تلفن شما ثبت نشده است.</b>

برای تکمیل ثبت‌نام، روی دکمه زیر بزنید و شماره Telegram خودتان را ارسال کنید.`,

        getPhoneKeyboard()

    );

}

// =====================================
// Waiting For Admin :: M
// =====================================

async function sendWaitingApprovalMessage(
    chatId,
    firstName
) {

    await removeKeyboard(chatId);

    return sendMessage(

        chatId,

        `✅ <b>ثبت‌نام شما با موفقیت کامل شد!</b>

سلام ${escapeHtml(firstName || "کاربر عزیز")} 👋

اطلاعات شما با موفقیت ثبت شد.

👤 نام و نام خانوادگی
📱 شماره تلفن
🆔 حساب Telegram

⏳ <b>درخواست شما در انتظار تأیید مدیریت است.</b>

پس از تأیید مدیریت، ربات به‌صورت خودکار به شما اطلاع می‌دهد و دسترسی ورود به AutoTrade AI برای شما فعال خواهد شد.`

    );

}

// =====================================
// Approved Message :: M
// =====================================

export async function sendApprovalNotification(
    user
) {

    if (!user?.telegramId) {
        return false;
    }

    const keyboard =
        getMiniAppKeyboard();

    const text =

        `🎉 <b>درخواست شما تأیید شد!</b>

سلام ${escapeHtml(
            user.firstName ||
            "کاربر عزیز"
        )} 👋

✅ حساب شما توسط مدیریت تأیید شد.
✅ دسترسی AutoTrade AI برای شما فعال شد.

اکنون می‌توانید وارد برنامه شوید و از امکانات آن استفاده کنید. 🚀

${keyboard
    ? "👇 برای ورود روی دکمه زیر بزنید:"
    : ""}`;

    await sendMessage(

        user.telegramId,

        text,

        keyboard

    );

    return true;

}

// =====================================
// Rejected Message :: M
// =====================================

export async function sendRejectionNotification(
    user
) {

    if (!user?.telegramId) {
        return false;
    }

    await sendMessage(

        user.telegramId,

        `❌ <b>درخواست شما توسط مدیریت تأیید نشد.</b>

در صورت نیاز به پشتیبانی پیام بدهید.

💬 پشتیبانی: ${SUPPORT_USERNAME}`

    );

    return true;

}

// =====================================
// Existing User Message :: M
// =====================================

async function sendExistingUserMessage(
    chatId,
    user
) {

    if (
        user.approvalStatus ===
        "REJECTED"
    ) {

        return sendMessage(

            chatId,

            `❌ <b>درخواست شما توسط مدیریت تأیید نشد.</b>

در صورت نیاز به پشتیبانی پیام بدهید.

💬 پشتیبانی: ${SUPPORT_USERNAME}`

        );

    }

    if (
        user.accessEnabled === true &&
        user.status === "ACTIVE"
    ) {

        const keyboard =
            getMiniAppKeyboard();

        return sendMessage(

            chatId,

            `👋 <b>خوش برگشتی ${escapeHtml(
                user.firstName ||
                "کاربر عزیز"
            )}!</b>

✅ حساب شما تأیید شده است.

می‌توانید وارد AutoTrade AI شوید. 🚀`,

            keyboard

        );

    }

    if (
        user.phoneNumber &&
        user.phoneNumber.trim()
    ) {

        return sendMessage(

            chatId,

            `⏳ <b>درخواست شما در انتظار تأیید مدیریت است.</b>

اطلاعات شما قبلاً ثبت شده است.

پس از تأیید مدیریت، ربات به‌صورت خودکار به شما اطلاع می‌دهد.`

        );

    }

    return sendPhoneRequest(chatId);

}

// =====================================
// Handle /start :: M
// =====================================

async function handleStart(message) {

    const from =
        message.from;

    const chat =
        message.chat;

    if (!from || !chat) {
        return;
    }

    const telegramId =
        String(from.id);

    const firstName =
        String(
            from.first_name || ""
        ).trim();

    const lastName =
        String(
            from.last_name || ""
        ).trim();

    const username =
        String(
            from.username || ""
        ).trim();

    let user =
        await User.findOne({
            telegramId
        });

    // =================================
    // Create User :: M
    // =================================

    if (!user) {

        user =
            await User.create({

                telegramId,

                username,

                firstName,

                lastName,

                phoneNumber: "",

                accessEnabled: false,

                approvalStatus:
                    "PENDING",

                isAdmin: false,

                botAccess: false,

                botActive: false,

                walletId: null,

                status: "PENDING",

                lastLogin:
                    new Date()

            });

        console.log(
            "NEW TELEGRAM USER:",
            telegramId
        );

    }

    // =================================
    // Update User :: M
    // =================================

    else {

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

    return sendExistingUserMessage(
        chat.id,
        user
    );

}

// =====================================
// Handle Phone Contact :: M
// =====================================

async function handlePhoneContact(message) {

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

    // =================================
    // Security Check :: M
    // =================================

    if (
        contact.user_id &&
        String(contact.user_id) !==
        String(from.id)
    ) {

        return sendMessage(

            chat.id,

            `❌ <b>شماره تلفن معتبر نیست.</b>

لطفاً فقط از دکمه <b>📱 ارسال شماره تلفن</b> استفاده کنید.`

        );

    }

    const telegramId =
        String(from.id);

    const phoneNumber =
        normalizePhone(
            contact.phone_number
        );

    if (!phoneNumber) {

        return sendPhoneRequest(
            chat.id
        );

    }

    const user =
        await User.findOne({
            telegramId
        });

    if (!user) {

        return sendMessage(

            chat.id,

            `❌ <b>حساب شما پیدا نشد.</b>

لطفاً ابتدا /start را ارسال کنید.`

        );

    }

    // =================================
    // Update Registration :: M
    // =================================

    user.phoneNumber =
        phoneNumber;

    user.firstName =
        String(
            from.first_name ||
            user.firstName ||
            ""
        ).trim();

    user.lastName =
        String(
            from.last_name ||
            user.lastName ||
            ""
        ).trim();

    user.username =
        String(
            from.username ||
            user.username ||
            ""
        ).trim();

    user.accessEnabled =
        false;

    user.approvalStatus =
        "PENDING";

    user.botAccess =
        false;

    user.botActive =
        false;

    user.status =
        "PENDING";

    user.lastLogin =
        new Date();

    await user.save();

    console.log(
        "REGISTRATION COMPLETED - WAITING ADMIN:",
        telegramId
    );

    return sendWaitingApprovalMessage(

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

    if (message.contact) {

        await handlePhoneContact(
            message
        );

        return;

    }

    const text =
        String(
            message.text || ""
        ).trim();

    if (
        text === "/start" ||
        text.startsWith("/start ")
    ) {

        await handleStart(
            message
        );

        return;

    }

    if (text) {

        await sendMessage(

            message.chat.id,

            `👋 <b>سلام!</b>

برای شروع کار با AutoTrade AI، دستور زیر را ارسال کنید:

/start`

        );

    }

}

// =====================================
// Setup Telegram Webhook :: M
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
            "Telegram webhook skipped: BACKEND_URL or RENDER_EXTERNAL_URL is missing"
        );

        return;

    }

    const webhookUrl =
        `${BACKEND_URL.replace(
            /\/$/,
            ""
        )}/api/telegram/webhook`;

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
            "TELEGRAM WEBHOOK:",
            webhookUrl
        );

        console.log(
            "TELEGRAM WEBHOOK RESULT:",
            result
        );

    }

    catch (error) {

        console.error(
            "TELEGRAM WEBHOOK ERROR:",
            error.message
        );

    }

}

// =====================================
// Get Telegram Bot Information :: M
// =====================================

export async function getTelegramBotInfo() {

    if (!BOT_TOKEN) {
        return null;
    }

    return telegramRequest(
        "getMe"
    );

}

// =====================================
// Set Telegram Bot Commands :: M
// =====================================

export async function setupTelegramCommands() {

    if (!BOT_TOKEN) {
        return;
    }

    try {

        await telegramRequest(

            "setMyCommands",

            {

                commands: [

                    {

                        command:
                            "start",

                        description:
                            "شروع و ثبت‌نام"

                    }

                ]

            }

        );

        console.log(
            "TELEGRAM BOT COMMANDS CONFIGURED"
        );

    }

    catch (error) {

        console.error(
            "TELEGRAM COMMAND SETUP ERROR:",
            error.message
        );

    }

}