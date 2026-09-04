// =====================================
// ..M
// AutoTrade AI
// Telegram Bot
// File: backend/bot.js
// =====================================

import User from "./models/User.js";

// =====================================
// ..M
// Environment
// =====================================

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const BACKEND_URL =
    process.env.BACKEND_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    "";

const MINI_APP_URL =
    process.env.MINI_APP_URL ||
    process.env.FRONTEND_URL ||
    "";

const SUPPORT_USERNAME = "@mehdi2410l";

// =====================================
// ..M
// Telegram API
// =====================================

const TELEGRAM_API = TELEGRAM_BOT_TOKEN
    ? `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`
    : null;

// =====================================
// ..M
// Telegram Request
// =====================================

async function telegramRequest(method, body = {}) {
    if (!TELEGRAM_API) {
        console.error(
            "❌ TELEGRAM_BOT_TOKEN تنظیم نشده است."
        );

        return null;
    }

    try {
        const response = await fetch(
            `${TELEGRAM_API}/${method}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
        );

        const data = await response.json();

        if (!data.ok) {
            console.error(
                `❌ Telegram API Error [${method}]:`,
                data.description
            );

            return null;
        }

        return data.result;

    } catch (error) {
        console.error(
            `❌ Telegram Request Error [${method}]:`,
            error.message
        );

        return null;
    }
}

// =====================================
// ..M
// Send Message
// =====================================

async function sendMessage(
    chatId,
    text,
    extra = {}
) {
    return telegramRequest(
        "sendMessage",
        {
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            ...extra
        }
    );
}

// =====================================
// ..M
// Remove Keyboard
// =====================================

async function removeKeyboard(chatId) {
    return sendMessage(
        chatId,
        " ",
        {
            reply_markup: {
                remove_keyboard: true
            }
        }
    );
}

// =====================================
// ..M
// Phone Keyboard
// =====================================

function phoneKeyboard() {
    return {
        keyboard: [
            [
                {
                    text: "📱 ارسال شماره تلفن",
                    request_contact: true
                }
            ]
        ],
        resize_keyboard: true,
        one_time_keyboard: true
    };
}

// =====================================
// ..M
// Mini App Keyboard
// =====================================

function miniAppKeyboard() {
    if (!MINI_APP_URL) {
        return undefined;
    }

    return {
        inline_keyboard: [
            [
                {
                    text: "🚀 ورود به AutoTrade AI",
                    web_app: {
                        url: MINI_APP_URL
                    }
                }
            ]
        ]
    };
}

// =====================================
// ..M
// Welcome Message
// =====================================

async function sendWelcomeMessage(
    chatId,
    firstName = ""
) {
    return sendMessage(
        chatId,
        `👋 <b>به AutoTrade AI خوش آمدید!</b> 🚀🤖

شما وارد سیستم هوشمند <b>AutoTrade AI</b> شدید.

برای شروع ثبت‌نام و استفاده از خدمات، لطفاً ابتدا <b>نام و نام خانوادگی</b> خود را در یک پیام بنویسید.

مثال:
<b>علی صام</b>`,
        {
            reply_markup: {
                remove_keyboard: true
            }
        }
    );
}

// =====================================
// ..M
// Ask Name
// =====================================

async function sendNameRequest(chatId) {
    return sendMessage(
        chatId,
        `📝 <b>لطفاً نام و نام خانوادگی خود را در یک پیام بنویسید.</b>

مثال:
<b>علی صام</b>`
    );
}

// =====================================
// ..M
// Ask Phone
// =====================================

async function sendPhoneRequest(chatId) {
    return sendMessage(
        chatId,
        `📱 <b>مرحله آخر ثبت‌نام</b>

لطفاً شماره تلفن خود را با استفاده از دکمه زیر ارسال کنید.

پس از ارسال شماره تلفن، اطلاعات شما ثبت و برای تأیید مدیریت ارسال می‌شود.`,
        {
            reply_markup: phoneKeyboard()
        }
    );
}

// =====================================
// ..M
// Waiting Approval
// =====================================

async function sendWaitingMessage(chatId) {
    await removeKeyboard(chatId);

    return sendMessage(
        chatId,
        `✅ <b>اطلاعات شما با موفقیت ثبت شد.</b>

⏳ <b>در انتظار تأیید مدیریت</b>

ثبت‌نام شما تکمیل شده و درخواست دسترسی شما برای مدیریت ارسال شد.

پس از تأیید، پیام فعال شدن دسترسی برای شما ارسال خواهد شد.

🙏 لطفاً منتظر بمانید.`
    );
}

// =====================================
// ..M
// Existing User Message
// =====================================

async function sendExistingUserMessage(
    chatId,
    user
) {

    // =====================================
    // ..M
    // Rejected
    // =====================================

    if (
        user.approvalStatus === "REJECTED"
    ) {
        return sendMessage(
            chatId,
            `❌ <b>درخواست شما توسط مدیریت تأیید نشد.</b>

در صورت نیاز به پشتیبانی پیام بدهید:

${SUPPORT_USERNAME}`
        );
    }

    // =====================================
    // ..M
    // Approved
    // =====================================

    if (
        user.accessEnabled === true &&
        user.approvalStatus === "APPROVED" &&
        user.status === "ACTIVE"
    ) {
        return sendMessage(
            chatId,
            `👋 <b>خوش برگشتی ${user.firstName || "دوست عزیز"}!</b>

دسترسی شما به <b>AutoTrade AI</b> فعال است 🚀

می‌توانید وارد Mini App شوید.`,
            {
                reply_markup:
                    miniAppKeyboard()
            }
        );
    }

    // =====================================
    // ..M
    // Completed / Pending
    // =====================================

    if (
        user.registrationStep === "COMPLETED" ||
        user.approvalStatus === "PENDING"
    ) {
        return sendWaitingMessage(
            chatId
        );
    }

    // =====================================
    // ..M
    // Waiting For Phone
    // =====================================

    if (
        user.registrationStep === "PHONE"
    ) {
        return sendPhoneRequest(
            chatId
        );
    }

    // =====================================
    // ..M
    // Waiting For Name
    // =====================================

    return sendNameRequest(
        chatId
    );
}

// =====================================
// ..M
// Notify Admins
// =====================================

async function notifyAdminsAboutRegistration(
    user
) {
    try {

        const admins = await User.find({
            isAdmin: true,
            telegramId: {
                $exists: true,
                $ne: ""
            }
        });

        if (!admins.length) {
            console.warn(
                "⚠️ هیچ ادمینی با isAdmin=true پیدا نشد."
            );

            return;
        }

        const requestDate =
            new Date().toLocaleString(
                "fa-IR",
                {
                    timeZone: "Asia/Tehran"
                }
            );

        const username =
            user.username
                ? `@${String(
                    user.username
                ).replace(/^@/, "")}`
                : "ندارد";

        const message =
`🔔 <b>درخواست ثبت‌نام جدید</b>

👤 <b>نام:</b> ${user.firstName || "ثبت نشده"}

👤 <b>نام خانوادگی:</b> ${user.lastName || "ثبت نشده"}

📱 <b>شماره تلفن:</b>
<code>${user.phoneNumber || "ثبت نشده"}</code>

🆔 <b>Telegram ID:</b>
<code>${user.telegramId}</code>

🔹 <b>Username:</b> ${username}

📅 <b>تاریخ درخواست:</b>
${requestDate}

📌 <b>وضعیت:</b>
⏳ در انتظار تأیید مدیریت

لطفاً درخواست کاربر را در پنل مدیریت بررسی کنید.`;

        for (
            const admin of admins
        ) {
            await sendMessage(
                admin.telegramId,
                message
            );
        }

        console.log(
            `✅ Registration notification sent to ${admins.length} admin(s).`
        );

    } catch (error) {

        console.error(
            "❌ Admin registration notification error:",
            error.message
        );
    }
}

// =====================================
// ..M
// Approval Notification
// =====================================

async function sendApprovalNotification(
    telegramId,
    firstName = ""
) {
    return sendMessage(
        telegramId,
        `🎉 <b>دسترسی شما تأیید شد!</b>

سلام ${firstName || "دوست عزیز"} 👋

مدیریت درخواست شما را تأیید کرد.

🚀 اکنون دسترسی شما به <b>AutoTrade AI</b> فعال است.

برای ورود به Mini App روی دکمه زیر بزنید.`,
        {
            reply_markup:
                miniAppKeyboard()
        }
    );
}

// =====================================
// ..M
// Rejection Notification
// =====================================

async function sendRejectionNotification(
    telegramId
) {
    return sendMessage(
        telegramId,
        `❌ <b>درخواست شما توسط مدیریت تأیید نشد.</b>

در صورت نیاز به پشتیبانی پیام بدهید:

${SUPPORT_USERNAME}`
    );
}

// =====================================
// ..M
// Find User
// =====================================

async function findUserByTelegramId(
    telegramId
) {
    return User.findOne({
        telegramId: String(
            telegramId
        )
    });
}

// =====================================
// ..M
// Parse Full Name
// =====================================

function parseFullName(text) {

    const clean = String(
        text || ""
    )
        .trim()
        .replace(/\s+/g, " ");

    if (!clean) {
        return null;
    }

    const parts =
        clean.split(" ");

    if (parts.length < 2) {
        return null;
    }

    const firstName =
        parts.shift();

    const lastName =
        parts.join(" ");

    if (
        !firstName ||
        !lastName
    ) {
        return null;
    }

    return {
        firstName,
        lastName
    };
}

// =====================================
// ..M
// Handle Start
// =====================================

async function handleStart(
    message
) {

    if (
        !message?.chat?.id
    ) {
        return;
    }

    const chatId =
        message.chat.id;

    const telegramUser =
        message.from || {};

    const telegramId =
        String(
            telegramUser.id ||
            chatId
        );

    let user =
        await findUserByTelegramId(
            telegramId
        );

    // =====================================
    // ..M
    // New User
    // =====================================

    if (!user) {

        user =
            await User.create({

                telegramId,

                username:
                    telegramUser.username ||
                    "",

                firstName:
                    "",

                lastName:
                    "",

                phoneNumber:
                    "",

                registrationStep:
                    "NAME",

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
                    "PENDING"
            });

        // =====================================
        // ..M
        // فقط یک پیام خوش‌آمدگویی
        // =====================================

        await sendWelcomeMessage(
            chatId,
            telegramUser.first_name || ""
        );

        return;
    }

    // =====================================
    // ..M
    // Update Username
    // =====================================

    let changed = false;

    if (
        telegramUser.username &&
        user.username !==
            telegramUser.username
    ) {
        user.username =
            telegramUser.username;

        changed = true;
    }

    if (changed) {
        await user.save();
    }

    // =====================================
    // ..M
    // Existing User
    // =====================================

    return sendExistingUserMessage(
        chatId,
        user
    );
}

// =====================================
// ..M
// Handle Name
// =====================================

async function handleNameMessage(
    message
) {

    if (
        !message?.chat?.id ||
        !message?.from?.id
    ) {
        return;
    }

    const chatId =
        message.chat.id;

    const telegramId =
        String(
            message.from.id
        );

    const user =
        await findUserByTelegramId(
            telegramId
        );

    if (!user) {
        await sendNameRequest(
            chatId
        );

        return;
    }

    // =====================================
    // ..M
    // Already Completed
    // =====================================

    if (
        user.registrationStep ===
            "COMPLETED" ||
        user.approvalStatus ===
            "APPROVED"
    ) {
        return sendExistingUserMessage(
            chatId,
            user
        );
    }

    // =====================================
    // ..M
    // Parse Name
    // =====================================

    const parsed =
        parseFullName(
            message.text
        );

    if (!parsed) {

        await sendMessage(
            chatId,
            `⚠️ لطفاً <b>نام و نام خانوادگی</b> خود را کامل در یک پیام بنویسید.

مثال:
<b>علی صام</b>`
        );

        return;
    }

    // =====================================
    // ..M
    // Save Name
    // =====================================

    user.firstName =
        parsed.firstName;

    user.lastName =
        parsed.lastName;

    user.registrationStep =
        "PHONE";

    user.accessEnabled =
        false;

    user.approvalStatus =
        "PENDING";

    user.status =
        "PENDING";

    user.botAccess =
        false;

    user.botActive =
        false;

    await user.save();

    // =====================================
    // ..M
    // Ask Phone
    // =====================================

    await sendPhoneRequest(
        chatId
    );
}

// =====================================
// ..M
// Handle Phone
// =====================================

async function handlePhoneContact(
    message
) {

    if (
        !message?.chat?.id ||
        !message?.from?.id ||
        !message?.contact?.phone_number
    ) {
        return;
    }

    const chatId =
        message.chat.id;

    const telegramId =
        String(
            message.from.id
        );

    const user =
        await findUserByTelegramId(
            telegramId
        );

    if (!user) {
        await sendNameRequest(
            chatId
        );

        return;
    }

    // =====================================
    // ..M
    // Check Contact Owner
    // =====================================

    if (
        message.contact.user_id &&
        String(
            message.contact.user_id
        ) !== telegramId
    ) {

        await sendMessage(
            chatId,
            "⚠️ لطفاً شماره تلفن متعلق به همین حساب تلگرام را ارسال کنید."
        );

        return;
    }

    // =====================================
    // ..M
    // Normalize Phone
    // =====================================

    let phone =
        String(
            message.contact.phone_number
        ).trim();

    if (
        phone.startsWith("+")
    ) {
        phone =
            phone.substring(1);
    }

    // =====================================
    // ..M
    // Save Registration
    // =====================================

    user.phoneNumber =
        phone;

    user.registrationStep =
        "COMPLETED";

    user.accessEnabled =
        false;

    user.approvalStatus =
        "PENDING";

    user.status =
        "PENDING";

    user.botAccess =
        false;

    user.botActive =
        false;

    user.lastLogin =
        new Date();

    await user.save();

    // =====================================
    // ..M
    // Remove Keyboard
    // =====================================

    await removeKeyboard(
        chatId
    );

    // =====================================
    // ..M
    // Registration Completed
    // =====================================

    await sendWaitingMessage(
        chatId
    );

    // =====================================
    // ..M
    // Notify Admins
    // =====================================

    await notifyAdminsAboutRegistration(
        user
    );
}

// =====================================
// ..M
// Handle Text
// =====================================

async function handleTextMessage(
    message
) {

    if (
        !message?.chat?.id ||
        !message?.from?.id ||
        !message?.text
    ) {
        return;
    }

    const text =
        String(
            message.text
        ).trim();

    // =====================================
    // ..M
    // Start
    // =====================================

    if (
        text.startsWith("/start")
    ) {
        return handleStart(
            message
        );
    }

    // =====================================
    // ..M
    // Find User
    // =====================================

    const user =
        await findUserByTelegramId(
            String(
                message.from.id
            )
        );

    if (!user) {
        await handleStart(
            message
        );

        return;
    }

    // =====================================
    // ..M
    // Name
    // =====================================

    if (
        user.registrationStep ===
            "NAME"
    ) {
        return handleNameMessage(
            message
        );
    }

    // =====================================
    // ..M
    // Completed / Pending
    // =====================================

    if (
        user.registrationStep ===
            "COMPLETED" ||
        user.approvalStatus ===
            "PENDING"
    ) {
        return sendWaitingMessage(
            message.chat.id
        );
    }

    // =====================================
    // ..M
    // Phone
    // =====================================

    if (
        user.registrationStep ===
            "PHONE"
    ) {
        return sendPhoneRequest(
            message.chat.id
        );
    }
}

// =====================================
// ..M
// Handle Update
// =====================================

async function handleUpdate(
    update
) {

    try {

        if (!update) {
            return;
        }

        if (
            update.message
        ) {

            const message =
                update.message;

            // =====================================
            // ..M
            // Contact
            // =====================================

            if (
                message.contact
            ) {
                return handlePhoneContact(
                    message
                );
            }

            // =====================================
            // ..M
            // Text
            // =====================================

            if (
                message.text
            ) {
                return handleTextMessage(
                    message
                );
            }
        }

    } catch (error) {

        console.error(
            "❌ Telegram update error:",
            error
        );
    }
}

// =====================================
// ..M
// Telegram Webhook
// =====================================

export async function telegramWebhook(
    req,
    res
) {

    try {

        await handleUpdate(
            req.body
        );

        return res
            .status(200)
            .json({
                success: true
            });

    } catch (error) {

        console.error(
            "❌ Telegram webhook error:",
            error
        );

        return res
            .status(200)
            .json({
                success: false
            });
    }
}

// =====================================
// ..M
// Set Telegram Webhook
// =====================================

export async function setTelegramWebhook() {

    if (
        !TELEGRAM_BOT_TOKEN
    ) {

        console.error(
            "❌ TELEGRAM_BOT_TOKEN تنظیم نشده است."
        );

        return false;
    }

    if (!BACKEND_URL) {

        console.error(
            "❌ BACKEND_URL یا RENDER_EXTERNAL_URL تنظیم نشده است."
        );

        return false;
    }

    const webhookUrl =
        `${BACKEND_URL.replace(
            /\/$/,
            ""
        )}/api/webhook/telegram`;

    const result =
        await telegramRequest(
            "setWebhook",
            {
                url: webhookUrl,

                allowed_updates: [
                    "message"
                ]
            }
        );

    if (result) {

        console.log(
            `✅ Telegram webhook set: ${webhookUrl}`
        );

        return true;
    }

    return false;
}

// =====================================
// ..M
// Bot Commands
// =====================================

export async function setBotCommands() {

    const result =
        await telegramRequest(
            "setMyCommands",
            {
                commands: [
                    {
                        command: "start",
                        description:
                            "شروع / ثبت‌نام"
                    }
                ]
            }
        );

    return Boolean(
        result
    );
}

// =====================================
// ..M
// Exports
// =====================================

export {
    sendMessage,
    sendWelcomeMessage,
    sendNameRequest,
    sendPhoneRequest,
    sendWaitingMessage,
    sendApprovalNotification,
    sendRejectionNotification,
    notifyAdminsAboutRegistration,
    removeKeyboard
};

// =====================================
// ..M
// Default Export
// =====================================

export default {
    telegramWebhook,
    setTelegramWebhook,
    setBotCommands,
    sendMessage,
    sendWelcomeMessage,
    sendNameRequest,
    sendPhoneRequest,
    sendWaitingMessage,
    sendApprovalNotification,
    sendRejectionNotification,
    notifyAdminsAboutRegistration
};