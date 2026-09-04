// =====================================
// ..M AutoTrade AI
// Telegram Bot
// File: backend/bot.js
// مرحله ۲۱ از ۲۰
// ثبت‌نام مرحله‌ای کامل
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
// HTML Escape :: M
// =====================================

function escapeHtml(value) {

    return String(
        value ?? ""
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

function normalizePhone(phone) {

    if (!phone) {

        return "";

    }


    return String(phone)

        .trim()

        .replace(
            /[\s()-]/g,
            ""
        );

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
// Remove Keyboard :: M
// =====================================

async function removeKeyboard(
    chatId
) {

    return telegramRequest(

        "sendMessage",

        {

            chat_id:
                chatId,

            text:
                "ثبت شد.",

            reply_markup: {

                remove_keyboard:
                    true

            }

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

        resize_keyboard:
            true,

        one_time_keyboard:
            true

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
    chatId
) {

    return sendMessage(

        chatId,

        `👋 <b>به AutoTrade AI خوش آمدید!</b> 🚀

🤖 شما وارد سیستم هوشمند AutoTrade AI شدید.

برای شروع ثبت‌نام و استفاده از خدمات، لطفاً ابتدا <b>نام و نام خانوادگی</b> خود را در یک پیام بنویسید.

مثال:

<b>علی صام</b>` 

    );

}


// =====================================
// Name Request :: M
// =====================================

async function sendNameRequest(
    chatId
) {

    return sendMessage(

        chatId,

        `👤 <b>نام و نام خانوادگی</b> خود را در یک پیام بنویسید.

مثال:

<b>علی صام</b>`

    );

}


// =====================================
// Phone Request :: M
// =====================================

async function sendPhoneRequest(
    chatId
) {

    return sendMessage(

        chatId,

        `👤 نام و نام خانوادگی شما ثبت شد.

📱 <b>حالا لطفاً شماره تلفن خود را با دکمه زیر ارسال کنید.</b>

برای امنیت، فقط شماره تلفن حساب Telegram خودتان را ارسال کنید.`,

        getPhoneKeyboard()

    );

}


// =====================================
// Waiting Approval Message :: M
// =====================================

async function sendWaitingApprovalMessage(

    chatId,

    firstName

) {

    await removeKeyboard(
        chatId
    );


    return sendMessage(

        chatId,

        `✅ <b>اطلاعات شما با موفقیت تأیید شد.</b>

سلام ${escapeHtml(
            firstName ||
            "کاربر عزیز"
        )} 👋

اطلاعات شما با موفقیت ثبت شد.

👤 نام و نام خانوادگی
📱 شماره تلفن
🆔 حساب Telegram

⏳ <b>در انتظار تأیید مدیریت برای دسترسی هستید.</b>

📩 <b>پیام تأیید دسترسی برای شما ارسال می‌شود.</b>

پس از تأیید مدیریت، ربات به‌صورت خودکار به شما اطلاع می‌دهد.`

    );

}


// =====================================
// Pending Existing User :: M
// =====================================

async function sendPendingMessage(

    chatId

) {

    return sendMessage(

        chatId,

        `⏳ <b>در انتظار تأیید مدیریت</b>

درخواست شما قبلاً ثبت شده است.

اطلاعات شما در سیستم موجود است.

📩 پس از تأیید مدیریت، پیام تأیید دسترسی برای شما به‌صورت خودکار ارسال می‌شود.`

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

        `🎉 <b>دسترسی شما تأیید شد!</b>

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
// Existing User :: M
// =====================================

async function handleExistingUser(
    chatId,
    user
) {

    // ---------------------------------
    // Rejected
    // ---------------------------------

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


    // ---------------------------------
    // Approved
    // ---------------------------------

    if (

        user.accessEnabled === true &&

        user.approvalStatus ===
            "APPROVED" &&

        user.status ===
            "ACTIVE"

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


    // ---------------------------------
    // Name Step
    // ---------------------------------

    if (
        user.registrationStep ===
        "NAME"
    ) {

        return sendNameRequest(
            chatId
        );

    }


    // ---------------------------------
    // Phone Step
    // ---------------------------------

    if (
        user.registrationStep ===
        "PHONE"
    ) {

        return sendPhoneRequest(
            chatId
        );

    }


    // ---------------------------------
    // Completed + Pending
    // ---------------------------------

    if (

        user.registrationStep ===
            "COMPLETED" &&

        user.phoneNumber

    ) {

        return sendPendingMessage(
            chatId
        );

    }


    return sendNameRequest(
        chatId
    );

}


// =====================================
// Handle Name Message :: M
// =====================================

async function handleNameMessage(
    message
) {

    const from =
        message.from;

    const chat =
        message.chat;

    if (
        !from ||
        !chat
    ) {

        return;

    }


    const text =
        String(
            message.text ||
            ""
        )
        .trim();


    if (!text) {

        return sendNameRequest(
            chat.id
        );

    }


    const parts =
        text
            .split(/\s+/)
            .filter(Boolean);


    // ---------------------------------
    // Require First + Last Name
    // ---------------------------------

    if (
        parts.length < 2
    ) {

        return sendMessage(

            chat.id,

            `❌ لطفاً <b>نام و نام خانوادگی</b> خود را با هم بنویسید.

مثال:

<b>علی صام</b>`

        );

    }


    const firstName =
        parts[0];


    const lastName =
        parts
            .slice(1)
            .join(" ");


    const telegramId =
        String(
            from.id
        );


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


    user.firstName =
        firstName;


    user.lastName =
        lastName;


    user.username =
        String(
            from.username ||
            user.username ||
            ""
        ).trim();


    user.registrationStep =
        "PHONE";


    user.lastLogin =
        new Date();


    await user.save();


    console.log(

        "NAME REGISTERED:",

        telegramId

    );


    return sendPhoneRequest(
        chat.id
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


    if (
        !from ||
        !chat
    ) {

        return;

    }


    const telegramId =
        String(
            from.id
        );


    const telegramFirstName =
        String(
            from.first_name ||
            ""
        ).trim();


    const telegramLastName =
        String(
            from.last_name ||
            ""
        ).trim();


    const username =
        String(
            from.username ||
            ""
        ).trim();


    let user =
        await User.findOne({
            telegramId
        });


    // =================================
    // NEW USER :: M
    // =================================

    if (!user) {

        user =
            await User.create({

                telegramId,

                username,

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

                walletId:
                    null,

                status:
                    "PENDING",

                lastLogin:
                    new Date()

            });


        console.log(

            "NEW TELEGRAM USER:",

            telegramId

        );


        // ---------------------------------
        // Welcome
        // ---------------------------------

        await sendWelcomeMessage(
            chat.id
        );


        // ---------------------------------
        // Name
        // ---------------------------------

        return sendNameRequest(
            chat.id
        );

    }


    // =================================
    // UPDATE TELEGRAM DATA :: M
    // =================================

    user.username =
        username;


    user.lastLogin =
        new Date();


    // فقط برای اطلاعات Telegram
    // نام قبلی ثبت‌شده توسط کاربر را
    // بدون دلیل تغییر نمی‌دهیم.

    if (
        !user.firstName &&
        telegramFirstName
    ) {

        user.firstName =
            telegramFirstName;

    }


    if (
        !user.lastName &&
        telegramLastName
    ) {

        user.lastName =
            telegramLastName;

    }


    await user.save();


    // =================================
    // Existing User
    // =================================

    return handleExistingUser(

        chat.id,

        user

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


    // =================================
    // Security Check :: M
    // =================================

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

            `❌ <b>شماره تلفن معتبر نیست.</b>

لطفاً فقط شماره تلفن حساب Telegram خودتان را ارسال کنید.`

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
    // Registration Check :: M
    // =================================

    if (
        user.registrationStep !==
        "PHONE"
    ) {

        if (
            user.registrationStep ===
            "NAME"
        ) {

            return sendNameRequest(
                chat.id
            );

        }

    }


    // =================================
    // Save Phone
    // =================================

    user.phoneNumber =
        phoneNumber;


    user.username =
        String(
            from.username ||
            user.username ||
            ""
        ).trim();


    user.registrationStep =
        "COMPLETED";


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


    // =================================
    // Contact
    // =================================

    if (
        message.contact
    ) {

        await handlePhoneContact(
            message
        );

        return;

    }


    const text =
        String(
            message.text ||
            ""
        ).trim();


    // =================================
    // /start
    // =================================

    if (

        text === "/start" ||

        text.startsWith(
            "/start "
        )

    ) {

        await handleStart(
            message
        );

        return;

    }


    // =================================
    // Name Registration
    // =================================

    if (
        text &&
        message.from
    ) {

        const user =
            await User.findOne({

                telegramId:
                    String(
                        message.from.id
                    )

            });


        if (
            user &&
            user.registrationStep ===
                "NAME"
        ) {

            await handleNameMessage(
                message
            );

            return;

        }


        if (
            user &&
            user.registrationStep ===
                "PHONE"
        ) {

            await sendPhoneRequest(
                message.chat.id
            );

            return;

        }

    }


    // =================================
    // Default Message
    // =================================

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