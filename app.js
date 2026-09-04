// =====================================
// ..M AutoTrade AI
// Mini App Application
// File: MiniApp/app.js
// مرحله ۱۹ از ۲۰
// کنترل کامل وضعیت دسترسی کاربر
// =====================================


// =====================================
// Configuration :: M
// =====================================

const BACKEND_URL =
    "https://autotrade-backend-02cc.onrender.com";


// =====================================
// Support :: M
// =====================================

const SUPPORT_USERNAME =
    "@mehdi2410l";


// =====================================
// Telegram :: M
// =====================================

const tg =
    window.Telegram &&
    window.Telegram.WebApp
        ? window.Telegram.WebApp
        : null;


// =====================================
// Application State :: M
// =====================================

const state = {

    currentPage:
        "dashboard",

    telegramUser:
        null,

    backendUser:
        null,

    wallet:
        null,

    bot:
        null,

    trades:
        [],

    exchangeRate:
        0,

    loginTime:
        null,

    loading:
        true,

    refreshing:
        false

};


// =====================================
// Safe Number :: M
// =====================================

function numberValue(value) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {

        return 0;

    }

    return number;

}


// =====================================
// Format Number :: M
// =====================================

function formatNumber(
    value,
    decimals = 2
) {

    return numberValue(value)
        .toLocaleString(
            "en-US",
            {
                minimumFractionDigits:
                    decimals,

                maximumFractionDigits:
                    decimals
            }
        );

}


// =====================================
// Format Toman :: M
// =====================================

function formatToman(value) {

    return numberValue(value)
        .toLocaleString(
            "fa-IR"
        ) +
        " تومان";

}


// =====================================
// Escape HTML :: M
// =====================================

function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =====================================
// Get Telegram User :: M
// =====================================

function getTelegramUser() {

    if (
        tg &&
        tg.initDataUnsafe &&
        tg.initDataUnsafe.user
    ) {

        return tg.initDataUnsafe.user;

    }

    return null;

}


// =====================================
// Telegram Init :: M
// =====================================

function initializeTelegram() {

    if (!tg) {

        return;

    }

    try {

        tg.ready();

        tg.expand();

        if (
            typeof tg.setHeaderColor ===
            "function"
        ) {

            tg.setHeaderColor(
                "#061426"
            );

        }

        if (
            typeof tg.setBackgroundColor ===
            "function"
        ) {

            tg.setBackgroundColor(
                "#061426"
            );

        }

    }

    catch (error) {

        console.error(
            "Telegram initialization error:",
            error
        );

    }

}


// =====================================
// API Request :: M
// =====================================

async function apiRequest(
    path,
    options = {}
) {

    const url =
        BACKEND_URL +
        path;

    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {})

    };

    if (
        tg &&
        tg.initData
    ) {

        headers[
            "X-Telegram-Init-Data"
        ] =
            tg.initData;

    }

    const response =
        await fetch(
            url,
            {
                ...options,
                headers
            }
        );

    let data =
        null;

    try {

        data =
            await response.json();

    }

    catch {

        data =
            null;

    }

    if (!response.ok) {

        const error =
            new Error(

                data?.message ||
                data?.error ||
                "خطا در ارتباط با سرور"

            );

        error.status =
            response.status;

        error.data =
            data;

        throw error;

    }

    return data;

}


// =====================================
// Telegram Authentication :: M
// =====================================

async function authenticateTelegram() {

    const user =
        getTelegramUser();

    state.telegramUser =
        user;

    if (!tg) {

        return null;

    }

    const initData =
        tg.initData;

    if (!initData) {

        return null;

    }

    try {

        const result =
            await apiRequest(
                "/api/auth/telegram",
                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            initData

                        })

                }
            );

        state.backendUser =
            result?.user ||
            result?.data ||
            null;

        return result;

    }

    catch (error) {

        console.error(
            "Telegram authentication failed:",
            error
        );

        /*
         * اگر Backend وضعیت کاربر را برگرداند،
         * حتی در صورت خطای HTTP آن را نگه می‌داریم.
         */

        if (
            error?.data?.user
        ) {

            state.backendUser =
                error.data.user;

        }

        return null;

    }

}


// =====================================
// Get Backend User ID :: M
// =====================================

function getBackendUserId() {

    return (
        state.backendUser?._id ||
        state.backendUser?.id ||
        null
    );

}


// =====================================
// Get User Access Status :: M
// =====================================

function getAccessStatus() {

    const user =
        state.backendUser || {};

    const status =
        String(
            user.status ||
            "PENDING"
        )
        .toUpperCase();

    const approvalStatus =
        String(
            user.approvalStatus ||
            "PENDING"
        )
        .toUpperCase();

    const accessEnabled =
        user.accessEnabled === true;

    const isAdmin =
        user.isAdmin === true;

    return {

        status,

        approvalStatus,

        accessEnabled,

        isAdmin,

        blocked:
            status === "BLOCKED",

        rejected:
            approvalStatus === "REJECTED",

        approved:
            approvalStatus === "APPROVED",

        active:
            status === "ACTIVE",

        allowed:
            isAdmin ||
            (
                accessEnabled &&
                approvalStatus === "APPROVED" &&
                status === "ACTIVE"
            )

    };

}


// =====================================
// Check Access :: M
// =====================================
//
// دسترسی کاربر عادی فقط زمانی مجاز است که
// هر سه شرط زیر برقرار باشد:
//
// accessEnabled = true
// approvalStatus = APPROVED
// status = ACTIVE
//
// Admin مجاز است.
//
// =====================================

function isAccessAllowed() {

    const access =
        getAccessStatus();

    return access.allowed;

}


// =====================================
// Get Access Message :: M
// =====================================

function getAccessMessage() {

    const access =
        getAccessStatus();

    if (
        access.blocked
    ) {

        return (
            "حساب شما مسدود شده است."
        );

    }

    if (
        access.rejected
    ) {

        return (
            "درخواست شما توسط مدیریت تأیید نشده است."
        );

    }

    if (
        !access.approved ||
        !access.active ||
        !access.accessEnabled
    ) {

        return (
            "حساب شما در انتظار تأیید مدیریت است."
        );

    }

    return "";

}


// =====================================
// Load Wallet :: M
// =====================================

async function loadWallet() {

    const userId =
        getBackendUserId();

    if (!userId) {

        state.wallet =
            null;

        return;

    }

    try {

        const result =
            await apiRequest(
                "/api/wallet/" +
                encodeURIComponent(
                    userId
                )
            );

        const wallet =
            result?.wallet ||
            result?.data ||
            result;

        state.wallet =
            wallet || null;

    }

    catch (error) {

        console.error(
            "Wallet error:",
            error
        );

        state.wallet =
            null;

    }

}


// =====================================
// Load Bot :: M
// =====================================

async function loadBot() {

    const userId =
        getBackendUserId();

    if (!userId) {

        state.bot =
            null;

        return;

    }

    try {

        const result =
            await apiRequest(
                "/api/bot/" +
                encodeURIComponent(
                    userId
                )
            );

        state.bot =
            result?.bot ||
            result?.data ||
            result ||
            null;

    }

    catch (error) {

        console.error(
            "Bot error:",
            error
        );

        state.bot =
            null;

    }

}


// =====================================
// Load Trades :: M
// =====================================

async function loadTrades() {

    const userId =
        getBackendUserId();

    if (!userId) {

        state.trades =
            [];

        return;

    }

    try {

        const result =
            await apiRequest(
                "/api/trades/" +
                encodeURIComponent(
                    userId
                )
            );

        state.trades =
            Array.isArray(result)
                ? result
                : (
                    result?.trades ||
                    result?.data ||
                    []
                );

    }

    catch (error) {

        console.error(
            "Trades error:",
            error
        );

        state.trades =
            [];

    }

}


// =====================================
// Load Exchange Rate :: M
// =====================================

async function loadExchangeRate() {

    try {

        const result =
            await apiRequest(
                "/api/currency/exchange-rate"
            );

        const rate =
            numberValue(

                result?.exchangeRate ??

                result?.currency?.USD?.Toman ??

                result?.data?.exchangeRate ??

                result?.data?.currency?.USD?.Toman ??

                result?.rate ??

                result?.data?.rate ??

                0

            );

        state.exchangeRate =
            rate;

        return rate;

    }

    catch (error) {

        console.error(
            "Exchange rate error:",
            error
        );

        state.exchangeRate =
            0;

        return 0;

    }

}


// =====================================
// Load All Data :: M
// =====================================

async function loadData() {

    await Promise.all([

        loadExchangeRate(),

        loadWallet(),

        loadBot(),

        loadTrades()

    ]);

}


// =====================================
// Refresh Data :: M
// =====================================

async function refreshData() {

    if (
        state.refreshing
    ) {

        return;

    }

    state.refreshing =
        true;

    try {

        showToast(
            "در حال بروزرسانی اطلاعات..."
        );

        await loadData();

        renderCurrentPage();

        showToast(
            "اطلاعات با موفقیت بروزرسانی شد"
        );

    }

    catch (error) {

        console.error(
            "Refresh error:",
            error
        );

        showToast(
            "بروزرسانی اطلاعات انجام نشد"
        );

    }

    finally {

        state.refreshing =
            false;

    }

}


// =====================================
// Access Page :: M
// =====================================

function renderAccessPage() {

    const user =
        state.backendUser || {};

    const access =
        getAccessStatus();

    const app =
        document.getElementById(
            "app"
        );

    if (!app) {

        return;

    }

    let icon =
        "🔐";

    let title =
        "در انتظار تأیید مدیریت";

    let message =
        "اطلاعات شما با موفقیت ثبت شده است. پس از تأیید مدیریت، دسترسی AutoTrade AI برای شما فعال خواهد شد.";

    if (
        access.blocked
    ) {

        icon =
            "🚫";

        title =
            "حساب شما مسدود شده است";

        message =
            "دسترسی حساب شما در حال حاضر مسدود است. برای بررسی وضعیت حساب با پشتیبانی AutoTrade AI ارتباط بگیرید.";

    }

    else if (
        access.rejected
    ) {

        icon =
            "❌";

        title =
            "درخواست شما تأیید نشد";

        message =
            "درخواست شما توسط مدیریت تأیید نشد. در صورت نیاز به پشتیبانی با ما در ارتباط باشید.";

    }

    else if (
        !user.phoneNumber ||
        !user.firstName ||
        !user.lastName
    ) {

        icon =
            "📝";

        title =
            "تکمیل ثبت‌نام";

        message =
            "برای استفاده از AutoTrade AI ابتدا باید نام، نام خانوادگی و شماره تلفن شما ثبت شود.";

    }

    app.innerHTML = `

        <div class="page">

            <div class="top-header">

                <div class="brand">

                    <div class="brand-logo">
                        AI
                    </div>

                    <div class="brand-text">

                        <div class="brand-title">
                            AutoTrade AI
                        </div>

                        <div class="brand-subtitle">
                            وضعیت حساب
                        </div>

                    </div>

                </div>

            </div>


            <div class="glass-card support-card">

                <div class="support-icon">
                    ${icon}
                </div>

                <h2>
                    ${title}
                </h2>

                <p>
                    ${message}
                </p>


                ${
                    access.rejected

                        ? `

                            <div
                                class="support-username"
                                style="margin:16px 0"
                            >
                                ${SUPPORT_USERNAME}
                            </div>

                        `

                        : ""
                }


                <button
                    type="button"
                    class="support-button"
                    onclick="openSupport()"
                >
                    ارتباط با پشتیبانی
                </button>

            </div>

        </div>

    `;

}


// =====================================
// Header :: M
// =====================================

function renderHeader() {

    const user =
        state.telegramUser || {};

    const firstName =
        user.first_name ||
        state.backendUser?.firstName ||
        "کاربر";

    return `

        <div class="top-header">

            <div class="brand">

                <div class="brand-logo">
                    AI
                </div>

                <div class="brand-text">

                    <div class="brand-title">
                        AutoTrade AI
                    </div>

                    <div class="brand-subtitle">
                        سلام ${escapeHtml(
                            firstName
                        )} 👋
                    </div>

                </div>

            </div>


            <div class="header-actions">

                <button
                    type="button"
                    class="icon-button"
                    onclick="refreshData()"
                    title="بروزرسانی"
                >
                    ↻
                </button>

                <button
                    type="button"
                    class="icon-button"
                    onclick="goTo('profile')"
                >
                    👤
                </button>

            </div>

        </div>

    `;

}


// =====================================
// Dashboard :: M
// =====================================

function renderDashboard() {

    const wallet =
        state.wallet || {};

    const bot =
        state.bot || {};

    const balance =
        numberValue(
            wallet.balance
        );

    const totalProfit =
        numberValue(
            wallet.totalProfit
        );

    const totalTrades =
        numberValue(
            wallet.totalTrades
        );

    const withdrawable =
        numberValue(
            wallet.withdrawable
        );

    const rate =
        numberValue(
            state.exchangeRate
        );

    const status =
        String(
            bot.status ||
            "STOPPED"
        )
        .toUpperCase();

    let statusClass =
        "stopped";

    let statusText =
        "متوقف";

    if (
        status === "ACTIVE"
    ) {

        statusClass =
            "active";

        statusText =
            "فعال";

    }

    if (
        status === "PENDING"
    ) {

        statusClass =
            "pending";

        statusText =
            "در انتظار";

    }

    const app =
        document.getElementById(
            "app"
        );

    if (!app) {

        return;

    }

    app.innerHTML = `

        <div class="page">

            ${renderHeader()}


            <div class="glass-card balance-card">

                <div class="balance-top">

                    <span class="balance-label">
                        موجودی کل
                    </span>

                    <span class="currency-badge">
                        USDT
                    </span>

                </div>


                <div class="balance-value">

                    $${formatNumber(balance)}

                </div>


                <div class="balance-toman">

                    معادل تومان:

                    ${
                        rate > 0
                            ? formatToman(
                                balance * rate
                            )
                            : "در حال دریافت نرخ..."
                    }

                </div>


                <div class="action-row">

                    <button
                        type="button"
                        class="primary-button"
                        onclick="goTo('wallet')"
                    >
                        کیف پول
                    </button>

                    <button
                        type="button"
                        class="secondary-button"
                        onclick="goTo('withdraw')"
                    >
                        برداشت
                    </button>

                </div>

            </div>


            <div class="stats-grid">

                <div class="glass-card stat-card">

                    <div class="stat-label">
                        سود کل
                    </div>

                    <div class="stat-value green">
                        $${formatNumber(
                            totalProfit
                        )}
                    </div>

                </div>


                <div class="glass-card stat-card">

                    <div class="stat-label">
                        معاملات
                    </div>

                    <div class="stat-value">
                        ${formatNumber(
                            totalTrades,
                            0
                        )}
                    </div>

                </div>


                <div class="glass-card stat-card">

                    <div class="stat-label">
                        قابل برداشت
                    </div>

                    <div class="stat-value">
                        $${formatNumber(
                            withdrawable
                        )}
                    </div>

                </div>


                <div class="glass-card stat-card">

                    <div class="stat-label">
                        نرخ دلار
                    </div>

                    <div class="stat-value">

                        ${
                            rate > 0
                                ? formatNumber(
                                    rate,
                                    0
                                )
                                : "0"
                        }

                    </div>

                    <div class="stat-label">
                        تومان
                    </div>

                </div>

            </div>


            <div class="section-title">

                <h2>
                    ربات هوشمند
                </h2>

                <span>
                    AutoTrade AI
                </span>

            </div>


            <div class="glass-card bot-card">

                <div class="bot-header">

                    <div class="bot-name">
                        AI Trading Bot
                    </div>

                    <div
                        class="status ${statusClass}"
                    >
                        ${statusText}
                    </div>

                </div>


                <div class="bot-info">

                    <div class="info-box">

                        <span class="info-label">
                            استراتژی
                        </span>

                        <span class="info-value">
                            ${escapeHtml(
                                bot.strategy ||
                                "AI Scalping"
                            )}
                        </span>

                    </div>


                    <div class="info-box">

                        <span class="info-label">
                            دقت
                        </span>

                        <span class="info-value">
                            ${formatNumber(
                                bot.accuracy
                            )}%
                        </span>

                    </div>


                    <div class="info-box">

                        <span class="info-label">
                            آخرین سیگنال
                        </span>

                        <span class="info-value">
                            ${escapeHtml(
                                bot.lastSignal ||
                                "WAIT"
                            )}
                        </span>

                    </div>


                    <div class="info-box">

                        <span class="info-label">
                            وضعیت
                        </span>

                        <span class="info-value">
                            ${statusText}
                        </span>

                    </div>

                </div>


                <button
                    type="button"
                    class="primary-button"
                    style="width:100%"
                    onclick="startBot()"
                >
                    شروع معامله خودکار
                </button>

            </div>


            <div class="section-title">

                <h2>
                    معاملات اخیر
                </h2>

                <span>
                    ${state.trades.length}
                    معامله
                </span>

            </div>


            ${
                state.trades.length === 0

                    ? `

                        <div class="glass-card empty-card">

                            <div class="empty-icon">
                                📊
                            </div>

                            <div class="empty-title">
                                هنوز معامله‌ای ثبت نشده است
                            </div>

                            <div class="empty-text">
                                معاملات واقعی پس از ثبت
                                در این قسمت نمایش داده می‌شوند.
                            </div>

                        </div>

                    `

                    : renderRecentTrades()
            }


            ${renderBottomNavigation()}

        </div>

    `;

}


// =====================================
// Recent Trades :: M
// =====================================

function renderRecentTrades() {

    return `

        <div>

            ${
                state.trades
                    .slice(0, 5)
                    .map(
                        trade => {

                            const profit =
                                numberValue(
                                    trade.profit
                                );

                            return `

                                <div
                                    class="glass-card stat-card"
                                    style="margin-bottom:10px"
                                >

                                    <div class="stat-label">
                                        ${escapeHtml(
                                            trade.symbol ||
                                            "نامشخص"
                                        )}
                                    </div>

                                    <div
                                        class="stat-value ${
                                            profit >= 0
                                                ? "green"
                                                : ""
                                        }"
                                    >

                                        ${
                                            profit >= 0
                                                ? "+"
                                                : ""
                                        }$${formatNumber(
                                            profit
                                        )}

                                    </div>

                                </div>

                            `;

                        }
                    )
                    .join("")
            }

        </div>

    `;

}


// =====================================
// Wallet :: M
// =====================================

function renderWallet() {

    const wallet =
        state.wallet || {};

    const balance =
        numberValue(
            wallet.balance
        );

    const withdrawable =
        numberValue(
            wallet.withdrawable
        );

    const totalProfit =
        numberValue(
            wallet.totalProfit
        );

    const rate =
        numberValue(
            state.exchangeRate
        );

    const app =
        document.getElementById(
            "app"
        );

    if (!app) {

        return;

    }

    app.innerHTML = `

        <div class="page">

            <div class="page-header">

                <h1>
                    کیف پول
                </h1>

            </div>


            <div class="glass-card balance-card">

                <div class="balance-top">

                    <span class="balance-label">
                        موجودی
                    </span>

                    <span class="currency-badge">
                        USDT
                    </span>

                </div>


                <div class="balance-value">
                    $${formatNumber(balance)}
                </div>


                <div class="balance-toman">

                    معادل تومان:

                    ${
                        rate > 0
                            ? formatToman(
                                balance * rate
                            )
                            : "در حال دریافت نرخ..."
                    }

                </div>


                <div class="action-row">

                    <button
                        type="button"
                        class="primary-button"
                        onclick="showToast('اتصال واریز در مرحله بعدی تکمیل می‌شود')"
                    >
                        واریز
                    </button>

                    <button
                        type="button"
                        class="secondary-button"
                        onclick="goTo('withdraw')"
                    >
                        برداشت
                    </button>

                </div>

            </div>


            <div class="section-title">

                <h2>
                    خلاصه کیف پول
                </h2>

            </div>


            <div class="stats-grid">

                <div class="glass-card stat-card">

                    <div class="stat-label">
                        موجودی قابل برداشت
                    </div>

                    <div class="stat-value">
                        $${formatNumber(
                            withdrawable
                        )}
                    </div>

                    <div class="stat-label">

                        ${
                            rate > 0
                                ? formatToman(
                                    withdrawable * rate
                                )
                                : "0 تومان"
                        }

                    </div>

                </div>


                <div class="glass-card stat-card">

                    <div class="stat-label">
                        سود کل
                    </div>

                    <div class="stat-value green">
                        $${formatNumber(
                            totalProfit
                        )}
                    </div>

                </div>

            </div>


            <div class="section-title">

                <h2>
                    نرخ تبدیل
                </h2>

            </div>


            <div class="glass-card stat-card">

                <div class="stat-label">
                    نرخ ۱ دلار
                </div>

                <div class="stat-value">

                    ${
                        rate > 0
                            ? formatNumber(
                                rate,
                                0
                            )
                            : "0"
                    }

                    تومان

                </div>

            </div>


            <div class="section-title">

                <h2>
                    تراکنش‌ها
                </h2>

            </div>


            <div class="glass-card empty-card">

                <div class="empty-icon">
                    💳
                </div>

                <div class="empty-title">
                    هنوز تراکنشی وجود ندارد
                </div>

                <div class="empty-text">
                    تراکنش‌های شما اینجا نمایش داده می‌شوند.
                </div>

            </div>


            ${renderBottomNavigation()}

        </div>

    `;

}


// =====================================
// Trades :: M
// =====================================

function renderTrades() {

    const app =
        document.getElementById(
            "app"
        );

    if (!app) {

        return;

    }

    const trades =
        Array.isArray(
            state.trades
        )
            ? state.trades
            : [];

    let content =
        "";

    if (
        trades.length === 0
    ) {

        content = `

            <div class="glass-card empty-card">

                <div class="empty-icon">
                    📈
                </div>

                <div class="empty-title">
                    هنوز معامله‌ای وجود ندارد
                </div>

                <div class="empty-text">
                    پس از انجام معامله،
                    نتیجه آن اینجا نمایش داده می‌شود.
                </div>

            </div>

        `;

    }

    else {

        content =
            trades
                .slice(0, 20)
                .map(
                    trade => {

                        const profit =
                            numberValue(
                                trade.profit
                            );

                        return `

                            <div
                                class="glass-card stat-card"
                                style="margin-bottom:10px"
                            >

                                <div class="stat-label">
                                    ${escapeHtml(
                                        trade.symbol ||
                                        "نامشخص"
                                    )}
                                </div>

                                <div class="stat-value ${
                                    profit >= 0
                                        ? "green"
                                        : ""
                                }">

                                    ${
                                        profit >= 0
                                            ? "+"
                                            : ""
                                    }$${formatNumber(
                                        profit
                                    )}

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");

    }

    app.innerHTML = `

        <div class="page">

            <div class="page-header">

                <h1>
                    معاملات
                </h1>

            </div>


            ${content}


            ${renderBottomNavigation()}

        </div>

    `;

}


// =====================================
// Withdraw Page :: M
// =====================================

function renderWithdraw() {

    const wallet =
        state.wallet || {};

    const withdrawable =
        numberValue(
            wallet.withdrawable
        );

    const rate =
        numberValue(
            state.exchangeRate
        );

    const app =
        document.getElementById(
            "app"
        );

    if (!app) {

        return;

    }

    app.innerHTML = `

        <div class="page">

            <div class="page-header">

                <button
                    type="button"
                    class="icon-button"
                    onclick="goTo('wallet')"
                >
                    ←
                </button>

                <h1>
                    برداشت تومان
                </h1>

            </div>


            <div class="glass-card balance-card">

                <div class="balance-label">
                    موجودی قابل برداشت
                </div>

                <div class="balance-value">
                    $${formatNumber(
                        withdrawable
                    )}
                </div>

                <div class="balance-toman">

                    معادل تقریبی:

                    ${
                        rate > 0
                            ? formatToman(
                                withdrawable * rate
                            )
                            : "0 تومان"
                    }

                </div>

            </div>


            <div class="glass-card support-card">

                <div class="support-icon">
                    💳
                </div>

                <h2>
                    برداشت به تومان
                </h2>

                <p>
                    درخواست برداشت شما بر اساس
                    نرخ دلار ثبت‌شده محاسبه می‌شود.
                </p>

                <button
                    type="button"
                    class="primary-button"
                    style="width:100%"
                    onclick="showToast('فرم برداشت در مرحله اتصال نهایی فعال می‌شود')"
                >
                    ثبت درخواست برداشت
                </button>

            </div>


            ${renderBottomNavigation()}

        </div>

    `;

}


// =====================================
// Profile :: M
// =====================================

function renderProfile() {

    const telegramUser =
        state.telegramUser || {};

    const backendUser =
        state.backendUser || {};

    const firstName =
        telegramUser.first_name ||
        backendUser.firstName ||
        "";

    const lastName =
        telegramUser.last_name ||
        backendUser.lastName ||
        "";

    const fullName =
        (
            firstName +
            " " +
            lastName
        )
            .trim() ||
        "کاربر";

    const username =
        telegramUser.username
            ? "@" +
              telegramUser.username
            : (
                backendUser.username
                    ? (
                        String(
                            backendUser.username
                        )
                            .startsWith("@")
                            ? backendUser.username
                            : "@" +
                              backendUser.username
                    )
                    : "بدون آیدی"
            );

    const telegramId =
        telegramUser.id ||
        backendUser.telegramId ||
        0;

    const phoneNumber =
        backendUser.phoneNumber ||
        backendUser.phone ||
        backendUser.mobile ||
        "ثبت نشده";

    const registrationDate =
        backendUser.createdAt ||
        backendUser.registeredAt ||
        backendUser.created_at ||
        backendUser.createdDate ||
        null;

    const loginDate =
        state.loginTime ||
        new Date();

    const access =
        getAccessStatus();

    let accessText =
        "در انتظار تأیید";

    let accessClass =
        "pending";

    if (
        access.allowed
    ) {

        accessText =
            access.isAdmin
                ? "مدیر / سازنده"
                : "فعال";

        accessClass =
            "active";

    }

    else if (
        access.blocked
    ) {

        accessText =
            "مسدود";

        accessClass =
            "stopped";

    }

    else if (
        access.rejected
    ) {

        accessText =
            "رد شده";

        accessClass =
            "stopped";

    }

    const app =
        document.getElementById(
            "app"
        );

    if (!app) {

        return;

    }

    app.innerHTML = `

        <div class="page">

            <div class="page-header">

                <h1>
                    پروفایل
                </h1>

            </div>


            <div
                class="glass-card profile-card"
            >

                <div class="profile-main">

                    <div class="avatar">

                        <span>
                            AI
                        </span>

                    </div>


                    <div>

                        <div class="profile-name">

                            ${escapeHtml(
                                fullName
                            )}

                        </div>


                        <div class="profile-username">

                            ${escapeHtml(
                                username
                            )}

                        </div>

                    </div>

                </div>


                <div class="profile-details">

                    <div class="detail-row">

                        <span class="detail-label">
                            نام
                        </span>

                        <span class="detail-value">
                            ${escapeHtml(
                                firstName ||
                                "ثبت نشده"
                            )}
                        </span>

                    </div>


                    <div class="detail-row">

                        <span class="detail-label">
                            نام خانوادگی
                        </span>

                        <span class="detail-value">
                            ${escapeHtml(
                                lastName ||
                                "ثبت نشده"
                            )}
                        </span>

                    </div>


                    <div class="detail-row">

                        <span class="detail-label">
                            آیدی تلگرام
                        </span>

                        <span class="detail-value">
                            ${escapeHtml(
                                username
                            )}
                        </span>

                    </div>


                    <div class="detail-row">

                        <span class="detail-label">
                            شناسه تلگرام
                        </span>

                        <span class="detail-value">
                            ${escapeHtml(
                                telegramId
                            )}
                        </span>

                    </div>


                    <div class="detail-row">

                        <span class="detail-label">
                            شماره تلفن
                        </span>

                        <span class="detail-value">
                            ${escapeHtml(
                                phoneNumber
                            )}
                        </span>

                    </div>


                    <div class="detail-row">

                        <span class="detail-label">
                            زمان ثبت‌نام
                        </span>

                        <span class="detail-value">

                            ${
                                registrationDate
                                    ? formatDateTime(
                                        registrationDate
                                    )
                                    : "ثبت نشده"
                            }

                        </span>

                    </div>


                    <div class="detail-row">

                        <span class="detail-label">
                            زمان ورود
                        </span>

                        <span class="detail-value">

                            ${formatDateTime(
                                loginDate
                            )}

                        </span>

                    </div>


                    <div class="detail-row">

                        <span class="detail-label">
                            وضعیت دسترسی
                        </span>

                        <span
                            class="status ${accessClass}"
                        >
                            ${accessText}
                        </span>

                    </div>

                </div>

            </div>


            <div class="section-title">

                <h2>
                    پشتیبانی
                </h2>

            </div>


            <div
                class="glass-card support-card"
            >

                <div class="support-icon">
                    💬
                </div>


                <h2>
                    پشتیبانی AutoTrade AI
                </h2>


                <p>
                    برای ارتباط مستقیم با پشتیبانی
                    روی دکمه زیر بزنید.
                </p>


                <div class="support-username">
                    ${SUPPORT_USERNAME}
                </div>


                <button
                    type="button"
                    class="support-button"
                    onclick="openSupport()"
                >
                    ارتباط با پشتیبانی
                </button>

            </div>


            ${renderBottomNavigation()}

        </div>

    `;

}


// =====================================
// Bottom Navigation :: M
// =====================================

function renderBottomNavigation() {

    return `

        <nav class="bottom-nav">

            <button
                type="button"
                class="nav-button ${
                    state.currentPage ===
                    "dashboard"
                        ? "active"
                        : ""
                }"
                onclick="goTo('dashboard')"
            >

                <span class="nav-icon">
                    ⌂
                </span>

                <span>
                    داشبورد
                </span>

            </button>


            <button
                type="button"
                class="nav-button ${
                    state.currentPage ===
                    "wallet"
                        ? "active"
                        : ""
                }"
                onclick="goTo('wallet')"
            >

                <span class="nav-icon">
                    ◇
                </span>

                <span>
                    کیف پول
                </span>

            </button>


            <button
                type="button"
                class="nav-button ${
                    state.currentPage ===
                    "trades"
                        ? "active"
                        : ""
                }"
                onclick="goTo('trades')"
            >

                <span class="nav-icon">
                    ↕
                </span>

                <span>
                    معاملات
                </span>

            </button>


            <button
                type="button"
                class="nav-button ${
                    state.currentPage ===
                    "analytics"
                        ? "active"
                        : ""
                }"
                onclick="goTo('analytics')"
            >

                <span class="nav-icon">
                    ◔
                </span>

                <span>
                    آمار
                </span>

            </button>


            <button
                type="button"
                class="nav-button ${
                    state.currentPage ===
                    "profile"
                        ? "active"
                        : ""
                }"
                onclick="goTo('profile')"
            >

                <span class="nav-icon">
                    ◉
                </span>

                <span>
                    پروفایل
                </span>

            </button>

        </nav>

    `;

}


// =====================================
// Analytics :: M
// =====================================

function renderAnalytics() {

    const wallet =
        state.wallet || {};

    const app =
        document.getElementById(
            "app"
        );

    if (!app) {

        return;

    }

    app.innerHTML = `

        <div class="page">

            <div class="page-header">

                <h1>
                    آمار
                </h1>

            </div>


            <div class="stats-grid">

                <div class="glass-card stat-card">

                    <div class="stat-label">
                        کل معاملات
                    </div>

                    <div class="stat-value">
                        ${formatNumber(
                            wallet.totalTrades,
                            0
                        )}
                    </div>

                </div>


                <div class="glass-card stat-card">

                    <div class="stat-label">
                        سود کل
                    </div>

                    <div class="stat-value green">
                        $${formatNumber(
                            wallet.totalProfit
                        )}
                    </div>

                </div>


                <div class="glass-card stat-card">

                    <div class="stat-label">
                        سود امروز
                    </div>

                    <div class="stat-value green">
                        $0.00
                    </div>

                </div>


                <div class="glass-card stat-card">

                    <div class="stat-label">
                        نرخ برد
                    </div>

                    <div class="stat-value">
                        0.00%
                    </div>

                </div>

            </div>


            <div class="section-title">

                <h2>
                    وضعیت فعلی
                </h2>

            </div>


            <div class="glass-card empty-card">

                <div class="empty-icon">
                    📊
                </div>

                <div class="empty-title">
                    اطلاعات آماری واقعی
                </div>

                <div class="empty-text">
                    آمار فقط بر اساس معاملات واقعی
                    ثبت‌شده در Backend محاسبه خواهد شد.
                </div>

            </div>


            ${renderBottomNavigation()}

        </div>

    `;

}


// =====================================
// Render Current Page :: M
// =====================================

function renderCurrentPage() {

    /*
     * اگر کاربر دسترسی ندارد،
     * اجازه نمایش هیچ صفحه مالی یا معاملاتی
     * را نمی‌دهیم.
     */

    if (
        !isAccessAllowed()
    ) {

        renderAccessPage();

        return;

    }


    if (
        state.currentPage ===
        "wallet"
    ) {

        renderWallet();

        return;

    }

    if (
        state.currentPage ===
        "trades"
    ) {

        renderTrades();

        return;

    }

    if (
        state.currentPage ===
        "withdraw"
    ) {

        renderWithdraw();

        return;

    }

    if (
        state.currentPage ===
        "analytics"
    ) {

        renderAnalytics();

        return;

    }

    if (
        state.currentPage ===
        "profile"
    ) {

        renderProfile();

        return;

    }

    renderDashboard();

}


// =====================================
// Navigation Handler :: M
// =====================================

function goTo(page) {

    /*
     * پروفایل برای کاربر تأییدنشده
     * قابل مشاهده است تا وضعیت خودش را ببیند.
     */

    if (
        !isAccessAllowed() &&
        page !== "profile"
    ) {

        renderAccessPage();

        showToast(
            getAccessMessage()
        );

        return;

    }

    state.currentPage =
        page;

    renderCurrentPage();

}


// =====================================
// Start AI Bot :: M
// =====================================

async function startBot() {

    if (
        !isAccessAllowed()
    ) {

        showToast(
            getAccessMessage()
        );

        renderAccessPage();

        return;

    }

    const userId =
        getBackendUserId();

    if (!userId) {

        showToast(
            "کاربر هنوز احراز نشده است"
        );

        return;

    }

    try {

        showToast(
            "در حال شروع ربات..."
        );

        await apiRequest(
            "/api/bot/start/" +
            encodeURIComponent(
                userId
            ),
            {

                method:
                    "POST",

                body:
                    JSON.stringify({})

            }
        );

        await loadBot();

        renderDashboard();

        showToast(
            "ربات با موفقیت فعال شد"
        );

    }

    catch (error) {

        console.error(
            error
        );

        showToast(
            error.message ||
            "فعال‌سازی ربات انجام نشد"
        );

    }

}


// =====================================
// Open Support :: M
// =====================================

function openSupport() {

    const username =
        SUPPORT_USERNAME
            .replace("@", "");

    const url =
        "https://t.me/" +
        username;

    if (
        tg &&
        typeof tg.openTelegramLink ===
        "function"
    ) {

        tg.openTelegramLink(
            url
        );

        return;

    }

    window.open(
        url,
        "_blank"
    );

}


// =====================================
// Toast :: M
// =====================================

function showToast(message) {

    const oldToast =
        document.querySelector(
            ".toast"
        );

    if (oldToast) {

        oldToast.remove();

    }

    const toast =
        document.createElement(
            "div"
        );

    toast.className =
        "toast";

    toast.textContent =
        message;

    document.body.appendChild(
        toast
    );

    setTimeout(
        () => {

            if (
                toast &&
                toast.parentNode
            ) {

                toast.remove();

            }

        },
        3000
    );

}


// =====================================
// Date / Time :: M
// =====================================

function formatDateTime(date) {

    if (!date) {

        return "ثبت نشده";

    }

    const value =
        new Date(date);

    if (
        Number.isNaN(
            value.getTime()
        )
    ) {

        return "ثبت نشده";

    }

    return value.toLocaleString(
        "fa-IR",
        {

            year:
                "numeric",

            month:
                "2-digit",

            day:
                "2-digit",

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}


// =====================================
// Application Start :: M
// =====================================

async function initializeApp() {

    initializeTelegram();

    state.loginTime =
        new Date();

    try {

        const authResult =
            await authenticateTelegram();

        if (
            !authResult ||
            !state.backendUser
        ) {

            state.loading =
                false;

            renderAccessPage();

            return;

        }

        /*
         * فقط کاربر تأییدشده اطلاعات مالی
         * و معاملاتی را دریافت می‌کند.
         */

        if (
            isAccessAllowed()
        ) {

            await loadData();

        }

    }

    catch (error) {

        console.error(
            "Application initialization error:",
            error
        );

    }

    state.loading =
        false;


    if (
        !isAccessAllowed()
    ) {

        renderAccessPage();

        return;

    }

    renderDashboard();

}


// =====================================
// Global Functions :: M
// =====================================

window.goTo =
    goTo;

window.openSupport =
    openSupport;

window.startBot =
    startBot;

window.showToast =
    showToast;

window.refreshData =
    refreshData;


// =====================================
// Start :: M
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);