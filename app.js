// =====================================
// ..M AutoTrade AI
// Mini App
// File: MiniApp/app.js
// =====================================

"use strict";

// =====================================
// Telegram WebApp :: M
// =====================================

const tg =
    window.Telegram?.WebApp || null;


// =====================================
// Backend URL :: M
// =====================================

const BACKEND_URL =
    "https://autotrade-backend-02cc.onrender.com";


// =====================================
// Support :: M
// =====================================

const SUPPORT_USERNAME =
    "@mehdi2410l";


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
        10000,

    loginTime:
        null,

    loading:
        false

};


// =====================================
// DOM :: M
// =====================================

const app =
    document.getElementById("app");


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

        if (tg.setHeaderColor) {

            tg.setHeaderColor(
                "#07182d"
            );

        }

        if (tg.setBackgroundColor) {

            tg.setBackgroundColor(
                "#061529"
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
// Escape HTML :: M
// =====================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
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
// Number Formatter :: M
// =====================================

function formatNumber(
    value,
    decimals = 2
) {

    const number =
        Number(value);

    if (
        !Number.isFinite(number)
    ) {

        return "0";

    }

    return number.toLocaleString(
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
// Toman Formatter :: M
// =====================================

function formatToman(
    value
) {

    const number =
        Number(value);

    if (
        !Number.isFinite(number)
    ) {

        return "۰ تومان";

    }

    return Math.round(number)
        .toLocaleString(
            "fa-IR"
        ) +
        " تومان";

}


// =====================================
// USD To Toman :: M
// =====================================

function usdToToman(
    usd
) {

    const rate =
        Number(
            state.exchangeRate
        ) || 10000;

    return (
        Number(usd) *
        rate
    );

}


// =====================================
// API Request :: M
// =====================================

async function apiRequest(
    endpoint,
    options = {}
) {

    const headers = {

        "Content-Type":
            "application/json",

        ...(options.headers || {})

    };


    // ---------------------------------
    // Telegram Init Data
    // ---------------------------------

    if (
        tg &&
        tg.initData
    ) {

        headers[
            "X-Telegram-Init-Data"
        ] =
            tg.initData;

        headers[
            "X-Telegram-InitData"
        ] =
            tg.initData;

    }


    const response =
        await fetch(

            BACKEND_URL +
            endpoint,

            {

                ...options,

                headers

            }

        );


    let data = null;


    try {

        data =
            await response.json();

    }

    catch {

        data = null;

    }


    if (
        !response.ok
    ) {

        throw new Error(

            data?.message ||
            "خطا در ارتباط با سرور"

        );

    }


    return data;

}


// =====================================
// Telegram Authentication :: M
// =====================================

async function authenticateTelegram() {

    if (
        !tg ||
        !tg.initData
    ) {

        throw new Error(
            "Telegram WebApp authentication data is unavailable"
        );

    }


    const response =
        await apiRequest(

            "/api/auth/telegram",

            {

                method:
                    "POST",

                body:
                    JSON.stringify({

                        initData:
                            tg.initData

                    })

            }

        );


    if (
        response?.user
    ) {

        state.backendUser =
            response.user;

    }

    else if (
        response?.data?.user
    ) {

        state.backendUser =
            response.data.user;

    }


    state.telegramUser =
        tg.initDataUnsafe?.user ||
        null;


    state.loginTime =
        new Date();


    return response;

}


// =====================================
// Normalize User :: M
// =====================================

function getUser() {

    return (
        state.backendUser ||
        {}
    );

}


// =====================================
// Admin Check :: M
// =====================================

function isAdmin() {

    const user =
        getUser();

    return (
        user.isAdmin === true
    );

}


// =====================================
// Registration Complete :: M
// =====================================

function isRegistrationComplete() {

    const user =
        getUser();


    // ---------------------------------
    // Explicit registration step
    // ---------------------------------

    if (
        user.registrationStep ===
        "COMPLETED"
    ) {

        return true;

    }


    // ---------------------------------
    // Completed registration fallback
    // ---------------------------------

    const firstName =
        String(
            user.firstName ||
            ""
        ).trim();

    const lastName =
        String(
            user.lastName ||
            ""
        ).trim();

    const phone =
        String(
            user.phoneNumber ||
            ""
        ).trim();


    return (
        firstName.length > 0 &&
        lastName.length > 0 &&
        phone.length > 0
    );

}


// =====================================
// Access Allowed :: M
// =====================================

function isAccessAllowed() {

    const user =
        getUser();


    // ---------------------------------
    // Admin
    // ---------------------------------

    if (
        user.isAdmin === true
    ) {

        return true;

    }


    // ---------------------------------
    // Normal Approved User
    // ---------------------------------

    return (

        user.accessEnabled === true &&

        user.approvalStatus ===
            "APPROVED" &&

        user.status ===
            "ACTIVE"

    );

}


// =====================================
// Approval Pending :: M
// =====================================

function isApprovalPending() {

    const user =
        getUser();


    return (

        user.approvalStatus ===
            "PENDING"

    );

}


// =====================================
// Approval Rejected :: M
// =====================================

function isApprovalRejected() {

    const user =
        getUser();


    return (

        user.approvalStatus ===
            "REJECTED"

    );

}


// =====================================
// Load Exchange Rate :: M
// =====================================

async function loadExchangeRate() {

    try {

        const response =
            await apiRequest(
                "/api/currency/exchange-rate"
            );


        const currency =
            response?.currency;


        const rate =
            Number(
                currency?.exchangeRate
            );


        if (
            Number.isFinite(rate) &&
            rate > 0
        ) {

            state.exchangeRate =
                rate;

        }

    }

    catch (error) {

        console.error(
            "Exchange rate error:",
            error
        );

    }

}


// =====================================
// Load Wallet :: M
// =====================================

async function loadWallet() {

    const user =
        getUser();


    if (
        !user._id &&
        !user.id
    ) {

        return;

    }


    const userId =
        user._id ||
        user.id;


    try {

        const response =
            await apiRequest(

                `/api/wallet/${encodeURIComponent(
                    userId
                )}`

            );


        state.wallet =
            response?.wallet ||
            response?.data ||
            response ||
            null;

    }

    catch (error) {

        console.error(
            "Wallet error:",
            error
        );

        state.wallet = {

            balanceUSD:
                0,

            balanceToman:
                0,

            totalProfit:
                0,

            withdrawable:
                0

        };

    }

}


// =====================================
// Load Trades :: M
// =====================================

async function loadTrades() {

    try {

        const response =
            await apiRequest(
                "/api/trades/me"
            );


        state.trades =
            response?.trades ||
            response?.data ||
            [];


        if (
            !Array.isArray(
                state.trades
            )
        ) {

            state.trades = [];

        }

    }

    catch (error) {

        console.error(
            "Trades error:",
            error
        );

        state.trades = [];

    }

}


// =====================================
// Load Bot :: M
// =====================================

async function loadBot() {

    const user =
        getUser();


    const userId =
        user._id ||
        user.id;


    if (!userId) {

        return;

    }


    try {

        const response =
            await apiRequest(

                `/api/bot/${encodeURIComponent(
                    userId
                )}`

            );


        state.bot =
            response?.bot ||
            response?.data ||
            response ||
            null;

    }

    catch (error) {

        console.error(
            "Bot error:",
            error
        );

        state.bot = {

            status:
                "STOPPED"

        };

    }

}


// =====================================
// Refresh Data :: M
// =====================================

async function refreshData() {

    if (
        !isAccessAllowed()
    ) {

        renderCurrentPage();

        return;

    }


    state.loading =
        true;


    try {

        await Promise.all([

            loadExchangeRate(),

            loadWallet(),

            loadTrades(),

            loadBot()

        ]);

    }

    catch (error) {

        console.error(
            "Refresh error:",
            error
        );

    }

    finally {

        state.loading =
            false;

        renderCurrentPage();

    }

}


// =====================================
// Access Page :: M
// =====================================

function renderAccessPage() {

    const user =
        getUser();


    // =================================
    // BLOCKED
    // =================================

    if (
        user.status ===
        "BLOCKED"
    ) {

        app.innerHTML = `

            <div class="access-page">

                <div class="access-card">

                    <div class="access-icon">
                        🚫
                    </div>

                    <h2>
                        دسترسی مسدود است
                    </h2>

                    <p>
                        دسترسی حساب شما مسدود شده است.
                    </p>

                    <button
                        class="primary-button"
                        onclick="openSupport()"
                    >
                        ارتباط با پشتیبانی
                    </button>

                </div>

            </div>

        `;

        return;

    }


    // =================================
    // REJECTED
    // =================================

    if (
        isApprovalRejected()
    ) {

        app.innerHTML = `

            <div class="access-page">

                <div class="access-card">

                    <div class="access-icon">
                        ❌
                    </div>

                    <h2>
                        درخواست تأیید نشد
                    </h2>

                    <p>
                        درخواست شما توسط مدیریت تأیید نشد.
                    </p>

                    <p>
                        در صورت نیاز به پشتیبانی با ما در ارتباط باشید.
                    </p>

                    <div class="support-name">
                        ${escapeHtml(
                            SUPPORT_USERNAME
                        )}
                    </div>

                    <button
                        class="primary-button"
                        onclick="openSupport()"
                    >
                        ارتباط با پشتیبانی
                    </button>

                </div>

            </div>

        `;

        return;

    }


    // =================================
    // REGISTRATION INCOMPLETE
    // =================================
    //
    // مهم:
    // این قسمت قبل از Pending بررسی می‌شود.
    // اگر اطلاعات کامل نباشد فقط پیام تکمیل
    // ثبت‌نام نمایش داده می‌شود.
    //
    // =================================

    if (
        !isRegistrationComplete()
    ) {

        app.innerHTML = `

            <div class="access-page">

                <div class="access-card">

                    <div class="access-icon">
                        📝
                    </div>

                    <h2>
                        تکمیل ثبت‌نام
                    </h2>

                    <p>
                        لطفاً ابتدا ثبت نام خود را کامل کنید.
                    </p>

                    <button
                        class="primary-button"
                        onclick="openTelegramBot()"
                    >
                        تکمیل ثبت‌نام
                    </button>

                </div>

            </div>

        `;

        return;

    }


    // =================================
    // REGISTRATION COMPLETE + PENDING
    // =================================
    //
    // این همان متن دقیق موردنظر کاربر است.
    //
    // =================================

    if (
        isApprovalPending() ||
        (
            user.accessEnabled !== true &&
            user.approvalStatus !==
                "APPROVED"
        )
    ) {

        app.innerHTML = `

            <div class="access-page">

                <div class="access-card">

                    <div class="access-icon">
                        ⏳
                    </div>

                    <h2>
                        در انتظار تأیید مدیریت
                    </h2>

                    <p class="pending-message">
                        <strong>
                            ✅ اطلاعات شما با موفقیت ثبت شد.
                        </strong>
                        <br><br>

                        <strong>
                            ⏳ در انتظار تأیید مدیریت
                        </strong>
                        <br><br>

                        ثبت‌نام شما تکمیل شده و درخواست دسترسی شما برای مدیریت ارسال شد.
                        <br><br>

                        پس از تأیید، پیام فعال شدن دسترسی برای شما ارسال خواهد شد.
                        <br><br>

                        🙏 لطفاً منتظر بمانید.
                    </p>

                </div>

            </div>

        `;

        return;

    }


    // =================================
    // APPROVED
    // =================================

    if (
        isAccessAllowed()
    ) {

        renderDashboard();

        return;

    }


    // =================================
    // DEFAULT
    // =================================

    app.innerHTML = `

        <div class="access-page">

            <div class="access-card">

                <div class="access-icon">
                    ⏳
                </div>

                <h2>
                    در انتظار تأیید مدیریت
                </h2>

                <p>
                    اطلاعات شما ثبت شده است و درخواست دسترسی شما در حال بررسی مدیریت است.
                </p>

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


    const balance =
        Number(
            wallet.balanceUSD ||
            wallet.balance ||
            0
        );


    const profit =
        Number(
            wallet.totalProfit ||
            wallet.profit ||
            0
        );


    const withdrawable =
        Number(
            wallet.withdrawable ||
            0
        );


    const botStatus =
        state.bot?.status ||
        "STOPPED";


    app.innerHTML = `

        <div class="dashboard-page">

            <div class="top-header">

                <div>
                    <div class="brand">
                        AutoTrade AI
                    </div>

                    <div class="subtitle">
                        وضعیت حساب
                    </div>
                </div>

                <div class="ai-badge">
                    AI
                </div>

            </div>


            <div class="balance-card">

                <div class="card-label">
                    موجودی حساب
                </div>

                <div class="balance-usd">
                    $${formatNumber(balance)}
                </div>

                <div class="balance-toman">
                    ${formatToman(
                        usdToToman(balance)
                    )}
                </div>

            </div>


            <div class="stats-grid">

                <div class="stat-card">

                    <div class="stat-title">
                        سود کل
                    </div>

                    <div class="stat-value">
                        $${formatNumber(profit)}
                    </div>

                    <div class="stat-toman">
                        ${formatToman(
                            usdToToman(profit)
                        )}
                    </div>

                </div>


                <div class="stat-card">

                    <div class="stat-title">
                        قابل برداشت
                    </div>

                    <div class="stat-value">
                        $${formatNumber(
                            withdrawable
                        )}
                    </div>

                    <div class="stat-toman">
                        ${formatToman(
                            usdToToman(
                                withdrawable
                            )
                        )}
                    </div>

                </div>

            </div>


            <div class="ai-card">

                <div class="ai-card-title">
                    🤖 موتور هوش مصنوعی
                </div>

                <div class="ai-card-status">
                    ${
                        botStatus ===
                        "ACTIVE"
                            ? "فعال"
                            : "متوقف"
                    }
                </div>

                <button
                    class="primary-button"
                    onclick="toggleBot()"
                >
                    ${
                        botStatus ===
                        "ACTIVE"
                            ? "توقف معاملات AI"
                            : "شروع معاملات AI"
                    }
                </button>

            </div>


            <div class="section-card">

                <div class="section-title">
                    📊 آخرین معاملات
                </div>

                ${
                    renderRecentTrades()
                }

            </div>


            <div class="bottom-nav">

                <button
                    onclick="goTo('dashboard')"
                    class="nav-button active"
                >
                    🏠
                    <span>
                        خانه
                    </span>
                </button>

                <button
                    onclick="goTo('trades')"
                    class="nav-button"
                >
                    📊
                    <span>
                        معاملات
                    </span>
                </button>

                <button
                    onclick="goTo('wallet')"
                    class="nav-button"
                >
                    💰
                    <span>
                        کیف پول
                    </span>
                </button>

                <button
                    onclick="goTo('profile')"
                    class="nav-button"
                >
                    👤
                    <span>
                        پروفایل
                    </span>
                </button>

            </div>

        </div>

    `;

}


// =====================================
// Recent Trades :: M
// =====================================

function renderRecentTrades() {

    const trades =
        Array.isArray(
            state.trades
        )
            ? state.trades.slice(
                0,
                5
            )
            : [];


    if (
        trades.length === 0
    ) {

        return `

            <div class="empty-state">
                هنوز معامله‌ای ثبت نشده است.
            </div>

        `;

    }


    return trades.map(
        trade => {

            const profit =
                Number(
                    trade.profit || 0
                );


            const symbol =
                escapeHtml(
                    trade.symbol ||
                    "Unknown"
                );


            return `

                <div class="trade-row">

                    <div>

                        <strong>
                            ${symbol}
                        </strong>

                        <div>
                            ${
                                escapeHtml(
                                    trade.type ||
                                    ""
                                )
                            }
                        </div>

                    </div>

                    <div>

                        <strong>
                            ${
                                profit >= 0
                                    ? "+"
                                    : ""
                            }$${formatNumber(
                                profit
                            )}
                        </strong>

                    </div>

                </div>

            `;

        }
    ).join("");

}


// =====================================
// Trades Page :: M
// =====================================

function renderTrades() {

    const trades =
        Array.isArray(
            state.trades
        )
            ? state.trades
            : [];


    app.innerHTML = `

        <div class="dashboard-page">

            <div class="page-header">

                <button
                    onclick="goTo('dashboard')"
                    class="back-button"
                >
                    ←
                </button>

                <h2>
                    معاملات
                </h2>

            </div>


            <div class="section-card">

                ${
                    trades.length
                        ? trades.map(
                            trade => {

                                const profit =
                                    Number(
                                        trade.profit ||
                                        0
                                    );


                                return `

                                    <div class="trade-row">

                                        <div>

                                            <strong>
                                                ${
                                                    escapeHtml(
                                                        trade.symbol ||
                                                        "Unknown"
                                                    )
                                                }
                                            </strong>

                                            <div>
                                                ${
                                                    escapeHtml(
                                                        trade.type ||
                                                        ""
                                                    )
                                                }
                                            </div>

                                        </div>

                                        <div>

                                            <strong>
                                                ${
                                                    profit >= 0
                                                        ? "+"
                                                        : ""
                                                }$${formatNumber(
                                                    profit
                                                )}
                                            </strong>

                                        </div>

                                    </div>

                                `;

                            }
                        ).join("")
                        : `

                            <div class="empty-state">
                                هنوز معامله‌ای ثبت نشده است.
                            </div>

                        `
                }

            </div>

        </div>

    `;

}


// =====================================
// Wallet Page :: M
// =====================================

function renderWallet() {

    const wallet =
        state.wallet || {};


    const balance =
        Number(
            wallet.balanceUSD ||
            wallet.balance ||
            0
        );


    const withdrawable =
        Number(
            wallet.withdrawable ||
            0
        );


    app.innerHTML = `

        <div class="dashboard-page">

            <div class="page-header">

                <button
                    onclick="goTo('dashboard')"
                    class="back-button"
                >
                    ←
                </button>

                <h2>
                    کیف پول
                </h2>

            </div>


            <div class="balance-card">

                <div class="card-label">
                    موجودی
                </div>

                <div class="balance-usd">
                    $${formatNumber(balance)}
                </div>

                <div class="balance-toman">
                    ${formatToman(
                        usdToToman(balance)
                    )}
                </div>

            </div>


            <div class="section-card">

                <div class="stat-title">
                    مبلغ قابل برداشت
                </div>

                <div class="stat-value">
                    $${formatNumber(
                        withdrawable
                    )}
                </div>

                <div class="stat-toman">
                    ${formatToman(
                        usdToToman(
                            withdrawable
                        )
                    )}
                </div>

            </div>

        </div>

    `;

}


// =====================================
// Profile Page :: M
// =====================================

function renderProfile() {

    const user =
        getUser();


    const telegram =
        state.telegramUser ||
        {};


    const firstName =
        user.firstName ||
        telegram.first_name ||
        "";


    const lastName =
        user.lastName ||
        telegram.last_name ||
        "";


    const username =
        user.username ||
        telegram.username ||
        "";


    const phone =
        user.phoneNumber ||
        "";


    const status =
        user.isAdmin
            ? "مدیر"
            : (
                user.approvalStatus ===
                    "APPROVED"
                    ? "فعال"
                    : (
                        user.approvalStatus ===
                            "PENDING"
                            ? "در انتظار تأیید"
                            : "غیرفعال"
                    )
            );


    app.innerHTML = `

        <div class="dashboard-page">

            <div class="page-header">

                <button
                    onclick="goTo('dashboard')"
                    class="back-button"
                >
                    ←
                </button>

                <h2>
                    پروفایل
                </h2>

            </div>


            <div class="profile-card">

                <div class="profile-avatar">
                    ${
                        escapeHtml(
                            (
                                firstName ||
                                "A"
                            ).charAt(0)
                        ).toUpperCase()
                    }
                </div>


                <h2>
                    ${
                        escapeHtml(
                            (
                                firstName +
                                " " +
                                lastName
                            ).trim() ||
                            "کاربر"
                        )
                    }
                </h2>


                <div class="profile-status">
                    ${escapeHtml(status)}
                </div>

            </div>


            <div class="section-card">

                <div class="profile-row">

                    <span>
                        نام
                    </span>

                    <strong>
                        ${
                            escapeHtml(
                                firstName ||
                                "ثبت نشده"
                            )
                        }
                    </strong>

                </div>


                <div class="profile-row">

                    <span>
                        نام خانوادگی
                    </span>

                    <strong>
                        ${
                            escapeHtml(
                                lastName ||
                                "ثبت نشده"
                            )
                        }
                    </strong>

                </div>


                <div class="profile-row">

                    <span>
                        نام کاربری
                    </span>

                    <strong>
                        ${
                            username
                                ? "@" +
                                  escapeHtml(
                                      username
                                  )
                                : "ثبت نشده"
                        }
                    </strong>

                </div>


                <div class="profile-row">

                    <span>
                        شماره تلفن
                    </span>

                    <strong>
                        ${
                            escapeHtml(
                                phone ||
                                "ثبت نشده"
                            )
                        }
                    </strong>

                </div>

            </div>


            <div class="section-card">

                <div class="section-title">
                    پشتیبانی
                </div>

                <div class="support-name">
                    ${escapeHtml(
                        SUPPORT_USERNAME
                    )}
                </div>

                <button
                    class="primary-button"
                    onclick="openSupport()"
                >
                    ارتباط با پشتیبانی
                </button>

            </div>

        </div>

    `;

}


// =====================================
// Current Page Renderer :: M
// =====================================

function renderCurrentPage() {

    // ---------------------------------
    // Not authenticated
    // ---------------------------------

    if (
        !state.backendUser
    ) {

        return;

    }


    // ---------------------------------
    // Profile is available even before
    // approval so user can see status.
    // ---------------------------------

    if (
        state.currentPage ===
        "profile"
    ) {

        renderProfile();

        return;

    }


    // ---------------------------------
    // All other pages require approval
    // ---------------------------------

    if (
        !isAccessAllowed()
    ) {

        renderAccessPage();

        return;

    }


    switch (
        state.currentPage
    ) {

        case "dashboard":

            renderDashboard();

            break;


        case "trades":

            renderTrades();

            break;


        case "wallet":

            renderWallet();

            break;


        default:

            state.currentPage =
                "dashboard";

            renderDashboard();

            break;

    }

}


// =====================================
// Navigation :: M
// =====================================

function goTo(
    page
) {

    // ---------------------------------
    // Profile always available
    // ---------------------------------

    if (
        page === "profile"
    ) {

        state.currentPage =
            "profile";

        renderCurrentPage();

        return;

    }


    // ---------------------------------
    // Other pages require approval
    // ---------------------------------

    if (
        !isAccessAllowed()
    ) {

        state.currentPage =
            "dashboard";

        renderAccessPage();

        return;

    }


    state.currentPage =
        page;

    renderCurrentPage();

}


// =====================================
// Toggle Bot :: M
// =====================================

async function toggleBot() {

    if (
        !isAccessAllowed()
    ) {

        renderAccessPage();

        return;

    }


    const user =
        getUser();


    const userId =
        user._id ||
        user.id;


    if (!userId) {

        return;

    }


    try {

        const active =
            state.bot?.status ===
            "ACTIVE";


        if (
            active
        ) {

            // ---------------------------------
            // Backend may later provide STOP.
            // ---------------------------------

            state.bot = {

                ...(state.bot || {}),

                status:
                    "STOPPED"

            };

            renderDashboard();

            return;

        }


        const response =
            await apiRequest(

                `/api/bot/start/${encodeURIComponent(
                    userId
                )}`,

                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({})

                }

            );


        state.bot =
            response?.bot ||
            response?.data ||
            {

                status:
                    "ACTIVE"

            };


        renderDashboard();

    }

    catch (error) {

        console.error(
            "Bot start error:",
            error
        );


        alert(
            error.message ||
            "خطا در شروع معاملات AI"
        );

    }

}


// =====================================
// Support :: M
// =====================================

function openSupport() {

    const username =
        SUPPORT_USERNAME.replace(
            "@",
            ""
        );


    const url =
        `https://t.me/${username}`;


    if (
        tg &&
        tg.openTelegramLink
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
// Open Telegram Bot :: M
// =====================================

function openTelegramBot() {

    const username =
        "AutoTradeAI";


    const url =
        `https://t.me/${username}`;


    if (
        tg &&
        tg.openTelegramLink
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
// Global Functions :: M
// =====================================

window.goTo =
    goTo;

window.openSupport =
    openSupport;

window.openTelegramBot =
    openTelegramBot;

window.toggleBot =
    toggleBot;

window.refreshData =
    refreshData;


// =====================================
// Initialize Application :: M
// =====================================

async function initializeApp() {

    initializeTelegram();


    // ---------------------------------
    // Loading
    // ---------------------------------

    app.innerHTML = `

        <div class="access-page">

            <div class="access-card">

                <div class="access-icon">
                    AI
                </div>

                <h2>
                    AutoTrade AI
                </h2>

                <p>
                    در حال اتصال به حساب شما...
                </p>

            </div>

        </div>

    `;


    try {

        // ---------------------------------
        // Telegram Authentication
        // ---------------------------------

        await authenticateTelegram();


        // ---------------------------------
        // Load exchange rate
        // ---------------------------------

        await loadExchangeRate();


        // ---------------------------------
        // Important:
        // only approved users load financial
        // and trading data.
        // ---------------------------------

        if (
            isAccessAllowed()
        ) {

            await Promise.all([

                loadWallet(),

                loadTrades(),

                loadBot()

            ]);

        }


        // ---------------------------------
        // Render
        // ---------------------------------

        renderCurrentPage();

    }

    catch (error) {

        console.error(
            "APPLICATION ERROR:",
            error
        );


        app.innerHTML = `

            <div class="access-page">

                <div class="access-card">

                    <div class="access-icon">
                        ⚠️
                    </div>

                    <h2>
                        خطا در اتصال
                    </h2>

                    <p>
                        اتصال به سرور برقرار نشد.
                    </p>

                    <button
                        class="primary-button"
                        onclick="location.reload()"
                    >
                        تلاش مجدد
                    </button>

                </div>

            </div>

        `;

    }

}


// =====================================
// Start :: M
// =====================================

initializeApp();


// =====================================
// ..M END
// =====================================