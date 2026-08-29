// =====================================
// ..M AutoTrade AI
// Complete Mini App :: M
// Frontend Application
// File: MiniApp/app.js
// =====================================


// =====================================
// CONFIG :: M
// =====================================

const BACKEND_URL =
    "https://autotrade-backend-02cc.onrender.com";

const SUPPORT_USERNAME =
    "@mehdi2410l";


// =====================================
// Telegram WebApp :: M
// =====================================

const tg =
    window.Telegram?.WebApp || null;

if (tg) {

    try {

        tg.ready();
        tg.expand();

        if (typeof tg.setHeaderColor === "function") {
            tg.setHeaderColor("#0b1020");
        }

        if (typeof tg.setBackgroundColor === "function") {
            tg.setBackgroundColor("#0b1020");
        }

    } catch (error) {

        console.warn(
            "Telegram WebApp initialization error:",
            error
        );

    }

}


// =====================================
// Global State :: M
// =====================================

const state = {

    currentPage:
        "dashboard",

    loading:
        false,

    user:
        null,

    wallet: {

        balance:
            0,

        withdrawable:
            0,

        totalProfit:
            0,

        totalTrades:
            0

    },

    exchangeRate:
        0,

    bot: {

        status:
            "STOPPED",

        strategy:
            "AI Scalping",

        accuracy:
            0,

        confidence:
            0,

        lastSignal:
            "WAIT"

    },

    trades:
        [],

    deposits:
        [],

    withdrawals:
        []

};


// =====================================
// Helpers :: M
// =====================================

function getApp() {

    return document.getElementById("app");

}


// =====================================
// Safe Number :: M
// =====================================

function safeNumber(value) {

    const number =
        Number(value);

    if (
        !Number.isFinite(number)
    ) {

        return 0;

    }

    return number;

}


// =====================================
// Persian Number :: M
// =====================================

function faNumber(value) {

    const number =
        safeNumber(value);

    return number
        .toLocaleString("fa-IR", {
            maximumFractionDigits: 8
        });

}


// =====================================
// Currency Format USD :: M
// =====================================

function formatUSD(value) {

    return safeNumber(value)
        .toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 8
        }) + " USD";

}


// =====================================
// Currency Format Toman :: M
// =====================================

function formatToman(value) {

    return safeNumber(value)
        .toLocaleString("fa-IR", {
            maximumFractionDigits: 0
        }) + " تومان";

}


// =====================================
// USD → Toman :: M
// =====================================

function usdToToman(usd) {

    const amount =
        safeNumber(usd);

    const rate =
        safeNumber(
            state.exchangeRate
        );

    if (
        amount <= 0 ||
        rate <= 0
    ) {

        return 0;

    }

    return Math.round(
        amount * rate
    );

}


// =====================================
// Get Telegram User :: M
// =====================================

function getTelegramUser() {

    try {

        return (
            tg?.initDataUnsafe?.user ||
            null
        );

    } catch (error) {

        return null;

    }

}


// =====================================
// User Name :: M
// =====================================

function getUserName() {

    const user =
        state.user ||
        getTelegramUser() ||
        {};

    const name =
        [
            user.first_name,
            user.last_name
        ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return name ||
        "کاربر AutoTrade AI";

}


// =====================================
// Username :: M
// =====================================

function getUsername() {

    const user =
        state.user ||
        getTelegramUser() ||
        {};

    if (
        user.username
    ) {

        return "@" +
            user.username;

    }

    return "بدون نام کاربری";

}


// =====================================
// Telegram ID :: M
// =====================================

function getTelegramId() {

    const user =
        state.user ||
        getTelegramUser() ||
        {};

    return (
        user.id ||
        0
    );

}


// =====================================
// API Request :: M
// =====================================

async function apiRequest(
    endpoint,
    options = {}
) {

    try {

        const response =
            await fetch(
                BACKEND_URL + endpoint,
                {

                    method:
                        options.method ||
                        "GET",

                    headers: {

                        "Content-Type":
                            "application/json",

                        ...(options.headers || {})

                    },

                    body:
                        options.body
                            ? JSON.stringify(
                                options.body
                            )
                            : undefined

                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch {

            data =
                null;

        }


        if (
            !response.ok
        ) {

            throw new Error(
                data?.message ||
                "خطا در ارتباط با سرور"
            );

        }


        return data || {};

    }

    catch (error) {

        console.warn(
            "API Error:",
            endpoint,
            error
        );

        return {

            success:
                false,

            error:
                true,

            message:
                error.message

        };

    }

}


// =====================================
// Load Exchange Rate :: M
// =====================================

async function loadExchangeRate() {

    const data =
        await apiRequest(
            "/api/currency/exchange-rate"
        );


    const rate =
        safeNumber(

            data?.rate ??
            data?.exchangeRate ??
            data?.data?.rate ??
            data?.data?.exchangeRate ??
            0

        );


    state.exchangeRate =
        rate;

}


// =====================================
// Authenticate Telegram :: M
// =====================================

async function authenticateTelegram() {

    if (
        !tg ||
        !tg.initData
    ) {

        state.user =
            getTelegramUser();

        return;

    }


    const data =
        await apiRequest(
            "/api/auth/telegram",
            {

                method:
                    "POST",

                body: {

                    initData:
                        tg.initData

                }

            }
        );


    if (
        data?.success &&
        data?.user
    ) {

        state.user =
            data.user;

    }
    else {

        state.user =
            getTelegramUser();

    }

}


// =====================================
// Load Wallet :: M
// =====================================

async function loadWallet() {

    const telegramUser =
        getTelegramUser();

    const userId =
        state.user?._id ||
        state.user?.id ||
        telegramUser?.id;


    if (!userId) {

        return;

    }


    const data =
        await apiRequest(
            "/api/wallet/" +
            encodeURIComponent(
                userId
            )
        );


    const wallet =
        data?.wallet ||
        data?.data ||
        data;


    if (
        wallet &&
        !wallet.error
    ) {

        state.wallet.balance =
            safeNumber(
                wallet.balance ??
                wallet.balanceUSD ??
                0
            );


        state.wallet.withdrawable =
            safeNumber(
                wallet.withdrawable ??
                wallet.available ??
                wallet.balance ??
                0
            );


        state.wallet.totalProfit =
            safeNumber(
                wallet.totalProfit ??
                0
            );


        state.wallet.totalTrades =
            safeNumber(
                wallet.totalTrades ??
                0
            );

    }

}


// =====================================
// Load Bot :: M
// =====================================

async function loadBot() {

    const telegramUser =
        getTelegramUser();

    const userId =
        state.user?._id ||
        state.user?.id ||
        telegramUser?.id;


    if (!userId) {

        return;

    }


    const data =
        await apiRequest(
            "/api/bot/" +
            encodeURIComponent(
                userId
            )
        );


    const bot =
        data?.bot ||
        data?.data ||
        data;


    if (
        bot &&
        !bot.error
    ) {

        state.bot.status =
            bot.status ||
            "STOPPED";

        state.bot.strategy =
            bot.strategy ||
            "AI Scalping";

        state.bot.accuracy =
            safeNumber(
                bot.accuracy
            );

        state.bot.confidence =
            safeNumber(
                bot.confidence
            );

        state.bot.lastSignal =
            bot.lastSignal ||
            "WAIT";

    }

}


// =====================================
// Load Trades :: M
// =====================================

async function loadTrades() {

    const telegramUser =
        getTelegramUser();

    const userId =
        state.user?._id ||
        state.user?.id ||
        telegramUser?.id;


    if (!userId) {

        return;

    }


    const data =
        await apiRequest(
            "/api/trades/" +
            encodeURIComponent(
                userId
            )
        );


    if (
        Array.isArray(
            data?.trades
        )
    ) {

        state.trades =
            data.trades;

    }
    else if (
        Array.isArray(data)
    ) {

        state.trades =
            data;

    }
    else {

        state.trades =
            [];

    }

}


// =====================================
// Load Deposits :: M
// =====================================

async function loadDeposits() {

    const telegramUser =
        getTelegramUser();

    const userId =
        state.user?._id ||
        state.user?.id ||
        telegramUser?.id;


    if (!userId) {

        return;

    }


    const data =
        await apiRequest(
            "/api/deposit/user/" +
            encodeURIComponent(
                userId
            )
        );


    state.deposits =
        Array.isArray(
            data?.deposits
        )
            ? data.deposits
            : [];

}


// =====================================
// Load Withdrawals :: M
// =====================================

async function loadWithdrawals() {

    const telegramUser =
        getTelegramUser();

    const userId =
        state.user?._id ||
        state.user?.id ||
        telegramUser?.id;


    if (!userId) {

        return;

    }


    const data =
        await apiRequest(
            "/api/withdraw/user/" +
            encodeURIComponent(
                userId
            )
        );


    state.withdrawals =
        Array.isArray(
            data?.withdrawals
        )
            ? data.withdrawals
            : [];

}


// =====================================
// Load All Data :: M
// =====================================

async function loadAllData() {

    await Promise.allSettled([

        authenticateTelegram(),

        loadExchangeRate()

    ]);


    await Promise.allSettled([

        loadWallet(),

        loadBot(),

        loadTrades(),

        loadDeposits(),

        loadWithdrawals()

    ]);

}


// =====================================
// Bottom Navigation :: M
// =====================================

function renderBottomNavigation() {

    return `

        <nav class="bottom-nav">

            <button
                class="nav-item ${state.currentPage === "dashboard" ? "active" : ""}"
                onclick="navigateTo('dashboard')"
            >

                <span>⌂</span>
                <small>داشبورد</small>

            </button>


            <button
                class="nav-item ${state.currentPage === "wallet" ? "active" : ""}"
                onclick="navigateTo('wallet')"
            >

                <span>▣</span>
                <small>کیف پول</small>

            </button>


            <button
                class="nav-item ${state.currentPage === "trades" ? "active" : ""}"
                onclick="navigateTo('trades')"
            >

                <span>↕</span>
                <small>معاملات</small>

            </button>


            <button
                class="nav-item ${state.currentPage === "analytics" ? "active" : ""}"
                onclick="navigateTo('analytics')"
            >

                <span>◔</span>
                <small>آمار</small>

            </button>


            <button
                class="nav-item ${state.currentPage === "profile" ? "active" : ""}"
                onclick="navigateTo('profile')"
            >

                <span>◉</span>
                <small>پروفایل</small>

            </button>

        </nav>

    `;

}


// =====================================
// Header :: M
// =====================================

function renderHeader(
    title
) {

    return `

        <div class="top-header">

            <div>

                <div class="app-title">
                    AutoTrade AI
                </div>

                <div class="app-subtitle">
                    ربات معامله‌گر خودکار
                </div>

            </div>

            <div class="header-status">

                <span class="status-dot"></span>

                آنلاین

            </div>

        </div>

    `;

}


// =====================================
// Dashboard :: M
// =====================================

function renderDashboard() {

    const balance =
        state.wallet.balance;

    const profit =
        state.wallet.totalProfit;

    const toman =
        usdToToman(
            balance
        );


    return `

        <div class="page">

            ${renderHeader("داشبورد")}


            <div class="welcome-box">

                <div class="welcome-small">
                    خوش آمدید
                </div>

                <h1>
                    ${getUserName()}
                </h1>

                <p>
                    سیستم معامله‌گری خودکار شما آماده است.
                </p>

            </div>


            <div class="main-balance-card">

                <div class="card-label">
                    موجودی فعلی
                </div>

                <div class="balance-usd">
                    ${formatUSD(balance)}
                </div>

                <div class="balance-toman">
                    ${formatToman(toman)}
                </div>

            </div>


            <div class="stats-grid">

                <div class="stat-card">

                    <span>
                        سود کل
                    </span>

                    <strong>
                        ${formatUSD(profit)}
                    </strong>

                </div>


                <div class="stat-card">

                    <span>
                        معاملات
                    </span>

                    <strong>
                        ${faNumber(
                            state.wallet.totalTrades
                        )}
                    </strong>

                </div>


                <div class="stat-card">

                    <span>
                        دقت AI
                    </span>

                    <strong>
                        ${faNumber(
                            state.bot.accuracy
                        )}٪
                    </strong>

                </div>


                <div class="stat-card">

                    <span>
                        وضعیت ربات
                    </span>

                    <strong>
                        ${
                            state.bot.status === "ACTIVE"
                                ? "فعال"
                                : "متوقف"
                        }
                    </strong>

                </div>

            </div>


            <div class="section-card">

                <div class="section-title">
                    🤖 موتور هوش مصنوعی
                </div>

                <div class="info-row">

                    <span>
                        استراتژی
                    </span>

                    <strong>
                        ${state.bot.strategy}
                    </strong>

                </div>


                <div class="info-row">

                    <span>
                        آخرین سیگنال
                    </span>

                    <strong>
                        ${state.bot.lastSignal}
                    </strong>

                </div>


                <div class="info-row">

                    <span>
                        اطمینان
                    </span>

                    <strong>
                        ${faNumber(
                            state.bot.confidence
                        )}٪
                    </strong>

                </div>

            </div>


            <button
                class="primary-button"
                onclick="toggleBot()"
            >

                ${
                    state.bot.status === "ACTIVE"
                        ? "⏹ توقف معاملات AI"
                        : "▶ شروع معاملات AI"
                }

            </button>

        </div>

        ${renderBottomNavigation()}

    `;

}


// =====================================
// Wallet :: M
// =====================================

function renderWallet() {

    const balance =
        state.wallet.balance;

    const withdrawable =
        state.wallet.withdrawable;


    return `

        <div class="page">

            ${renderHeader("کیف پول")}


            <div class="wallet-main-card">

                <div class="card-label">
                    موجودی کل
                </div>

                <div class="balance-usd">
                    ${formatUSD(balance)}
                </div>

                <div class="balance-toman">
                    ${formatToman(
                        usdToToman(balance)
                    )}
                </div>

            </div>


            <div class="section-card">

                <div class="section-title">
                    موجودی قابل برداشت
                </div>

                <div class="big-number">
                    ${formatUSD(
                        withdrawable
                    )}
                </div>

                <div class="muted">
                    ${formatToman(
                        usdToToman(
                            withdrawable
                        )
                    )}
                </div>

            </div>


            <div class="wallet-actions">

                <button
                    class="primary-button"
                    onclick="showDeposit()"
                >
                    + واریز
                </button>


                <button
                    class="secondary-button"
                    onclick="showWithdraw()"
                >
                    برداشت تومان
                </button>

            </div>


            <div class="section-card">

                <div class="section-title">
                    نرخ تبدیل
                </div>

                <div class="info-row">

                    <span>
                        دلار
                    </span>

                    <strong>
                        ${
                            state.exchangeRate > 0
                                ? formatToman(
                                    state.exchangeRate
                                )
                                : "۰ تومان"
                        }
                    </strong>

                </div>

            </div>

        </div>

        ${renderBottomNavigation()}

    `;

}


// =====================================
// Trades :: M
// =====================================

function renderTrades() {

    const trades =
        Array.isArray(
            state.trades
        )
            ? state.trades
            : [];


    const tradeRows =
        trades.length
            ? trades.slice(0, 30).map(
                trade => {

                    const profit =
                        safeNumber(
                            trade.profit
                        );


                    return `

                        <div class="trade-row">

                            <div>

                                <strong>
                                    ${
                                        trade.symbol ||
                                        "نامشخص"
                                    }
                                </strong>

                                <small>
                                    ${
                                        trade.type ||
                                        "WAIT"
                                    }
                                </small>

                            </div>


                            <div class="${
                                profit >= 0
                                    ? "profit"
                                    : "loss"
                            }">

                                ${
                                    profit >= 0
                                        ? "+"
                                        : ""
                                }

                                ${formatUSD(profit)}

                            </div>

                        </div>

                    `;

                }
            ).join("")
            : `

                <div class="empty-state">

                    <div class="empty-icon">
                        ↕
                    </div>

                    <strong>
                        هنوز معامله‌ای ثبت نشده است
                    </strong>

                    <span>
                        ۰ معامله
                    </span>

                </div>

            `;


    return `

        <div class="page">

            ${renderHeader("معاملات")}


            <div class="section-card">

                <div class="section-title">
                    معاملات اخیر
                </div>

                ${tradeRows}

            </div>

        </div>

        ${renderBottomNavigation()}

    `;

}


// =====================================
// Analytics :: M
// =====================================

function renderAnalytics() {

    const totalTrades =
        safeNumber(
            state.wallet.totalTrades
        );

    const profit =
        safeNumber(
            state.wallet.totalProfit
        );


    return `

        <div class="page">

            ${renderHeader("آمار")}


            <div class="analytics-grid">

                <div class="analytics-card">

                    <span>
                        کل معاملات
                    </span>

                    <strong>
                        ${faNumber(
                            totalTrades
                        )}
                    </strong>

                </div>


                <div class="analytics-card">

                    <span>
                        سود کل
                    </span>

                    <strong>
                        ${formatUSD(profit)}
                    </strong>

                </div>


                <div class="analytics-card">

                    <span>
                        دقت هوش مصنوعی
                    </span>

                    <strong>
                        ${faNumber(
                            state.bot.accuracy
                        )}٪
                    </strong>

                </div>


                <div class="analytics-card">

                    <span>
                        اطمینان AI
                    </span>

                    <strong>
                        ${faNumber(
                            state.bot.confidence
                        )}٪
                    </strong>

                </div>

            </div>


            <div class="section-card">

                <div class="section-title">
                    وضعیت سرمایه
                </div>

                <div class="info-row">

                    <span>
                        سرمایه فعلی
                    </span>

                    <strong>
                        ${formatUSD(
                            state.wallet.balance
                        )}
                    </strong>

                </div>


                <div class="info-row">

                    <span>
                        معادل تومان
                    </span>

                    <strong>
                        ${formatToman(
                            usdToToman(
                                state.wallet.balance
                            )
                        )}
                    </strong>

                </div>

            </div>

        </div>

        ${renderBottomNavigation()}

    `;

}


// =====================================
// Profile :: M
// =====================================

function renderProfile() {

    const user =
        state.user ||
        getTelegramUser() ||
        {};


    const name =
        getUserName();

    const username =
        getUsername();

    const telegramId =
        getTelegramId();


    return `

        <div class="page">

            ${renderHeader("پروفایل")}


            <div class="profile-card">

                <div class="profile-avatar">

                    ${
                        name
                            .charAt(0)
                            .toUpperCase()
                    }

                </div>


                <div class="profile-name">

                    ${name}

                </div>


                <div class="profile-username">

                    ${username}

                </div>


                <div class="account-badge">

                    حساب واقعی

                </div>

            </div>


            <div class="section-card">

                <div class="section-title">
                    اطلاعات حساب
                </div>


                <div class="info-row">

                    <span>
                        نام و نام خانوادگی
                    </span>

                    <strong>
                        ${name}
                    </strong>

                </div>


                <div class="info-row">

                    <span>
                        نام کاربری
                    </span>

                    <strong>
                        ${username}
                    </strong>

                </div>


                <div class="info-row">

                    <span>
                        شناسه تلگرام
                    </span>

                    <strong>
                        ${
                            telegramId
                                ? faNumber(
                                    telegramId
                                )
                                : "۰"
                        }
                    </strong>

                </div>


                <div class="info-row">

                    <span>
                        نوع حساب
                    </span>

                    <strong>
                        حساب واقعی
                    </strong>

                </div>

            </div>


            <div class="section-card support-card">

                <div class="support-icon">
                    💬
                </div>


                <div class="section-title">
                    پشتیبانی
                </div>


                <div class="support-username">
                    ${SUPPORT_USERNAME}
                </div>


                <button
                    class="primary-button"
                    onclick="openSupport()"
                >

                    💬 ارتباط با پشتیبانی

                </button>

            </div>

        </div>

        ${renderBottomNavigation()}

    `;

}


// =====================================
// Deposit :: M
// =====================================

function showDeposit() {

    const app =
        getApp();

    if (!app) return;


    app.innerHTML = `

        <div class="page">

            ${renderHeader("واریز")}


            <div class="section-card">

                <div class="section-title">
                    واریز تومان
                </div>


                <p class="muted">
                    مبلغ مورد نظر خود را به تومان وارد کنید.
                </p>


                <label>
                    مبلغ واریز
                </label>


                <input
                    id="depositAmount"
                    class="money-input"
                    type="number"
                    inputmode="numeric"
                    min="1"
                    placeholder="مثلاً ۵۰۰۰۰۰"
                />


                <div
                    id="depositPreview"
                    class="amount-preview"
                >
                    معادل دلار: ۰ USD
                </div>


                <button
                    class="primary-button"
                    onclick="createDeposit()"
                >

                    ادامه واریز

                </button>


                <button
                    class="secondary-button"
                    onclick="navigateTo('wallet')"
                >

                    بازگشت

                </button>

            </div>

        </div>

        ${renderBottomNavigation()}

    `;


    const input =
        document.getElementById(
            "depositAmount"
        );


    if (input) {

        input.addEventListener(
            "input",
            updateDepositPreview
        );

    }

}


// =====================================
// Deposit Preview :: M
// =====================================

function updateDepositPreview() {

    const input =
        document.getElementById(
            "depositAmount"
        );

    const preview =
        document.getElementById(
            "depositPreview"
        );


    if (
        !input ||
        !preview
    ) {

        return;

    }


    const toman =
        safeNumber(
            input.value
        );


    const rate =
        safeNumber(
            state.exchangeRate
        );


    const usd =
        rate > 0
            ? toman / rate
            : 0;


    preview.textContent =
        `معادل دلار: ${formatUSD(usd)}`;

}


// =====================================
// Create Deposit :: M
// =====================================

async function createDeposit() {

    const input =
        document.getElementById(
            "depositAmount"
        );


    const amountToman =
        Math.floor(
            safeNumber(
                input?.value
            )
        );


    if (
        amountToman <= 0
    ) {

        showToast(
            "مبلغ واریز را وارد کنید"
        );

        return;

    }


    const telegramUser =
        getTelegramUser();


    const userId =
        state.user?._id ||
        state.user?.id ||
        telegramUser?.id;


    if (!userId) {

        showToast(
            "کاربر تلگرام شناسایی نشد"
        );

        return;

    }


    if (
        state.exchangeRate <= 0
    ) {

        showToast(
            "نرخ دلار هنوز دریافت نشده است"
        );

        return;

    }


    const button =
        document.querySelector(
            ".primary-button"
        );


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "در حال ایجاد درخواست...";

    }


    const data =
        await apiRequest(
            "/api/deposit",
            {

                method:
                    "POST",

                body: {

                    userId,

                    amountToman,

                    exchangeRate:
                        state.exchangeRate,

                    method:
                        "GATEWAY",

                    gateway:
                        "ZARINPAL"

                }

            }
        );


    if (
        data?.success
    ) {

        showToast(
            "درخواست واریز ایجاد شد"
        );


        if (
            data?.deposit?.paymentUrl
        ) {

            openExternal(
                data.deposit.paymentUrl
            );

        }
        else {

            navigateTo(
                "wallet"
            );

        }

    }
    else {

        showToast(
            data?.message ||
            "ایجاد درخواست واریز ناموفق بود"
        );

    }


    if (button) {

        button.disabled =
            false;

        button.textContent =
            "ادامه واریز";

    }

}


// =====================================
// Withdraw :: M
// کاملاً تومان‌محور
// =====================================

function showWithdraw() {

    const app =
        getApp();

    if (!app) return;


    const availableToman =
        usdToToman(
            state.wallet.withdrawable
        );


    app.innerHTML = `

        <div class="page">

            ${renderHeader("برداشت")}


            <div class="section-card">

                <div class="section-title">
                    برداشت تومان
                </div>


                <div class="available-box">

                    <span>
                        موجودی قابل برداشت
                    </span>

                    <strong>
                        ${formatToman(
                            availableToman
                        )}
                    </strong>

                    <small>
                        ${formatUSD(
                            state.wallet.withdrawable
                        )}
                    </small>

                </div>


                <label>
                    مبلغ برداشت به تومان
                </label>


                <input
                    id="withdrawAmountToman"
                    class="money-input"
                    type="number"
                    inputmode="numeric"
                    min="100000"
                    placeholder="مثلاً ۵۰۰۰۰۰"
                />


                <label>
                    شماره شبا
                </label>


                <input
                    id="withdrawBankAccount"
                    class="money-input"
                    type="text"
                    inputmode="text"
                    placeholder="IR..."
                />


                <label>
                    نام صاحب حساب
                </label>


                <input
                    id="withdrawHolderName"
                    class="money-input"
                    type="text"
                    placeholder="نام و نام خانوادگی"
                />


                <button
                    class="secondary-button"
                    onclick="fillWithdrawAll()"
                >

                    برداشت کل موجودی

                </button>


                <button
                    class="primary-button"
                    onclick="createWithdraw()"
                >

                    ثبت درخواست برداشت

                </button>


                <button
                    class="secondary-button"
                    onclick="navigateTo('wallet')"
                >

                    بازگشت

                </button>

            </div>

        </div>

        ${renderBottomNavigation()}

    `;

}


// =====================================
// Fill Withdraw All :: M
// =====================================

function fillWithdrawAll() {

    const input =
        document.getElementById(
            "withdrawAmountToman"
        );


    if (input) {

        input.value =
            usdToToman(
                state.wallet.withdrawable
            );

    }

}


// =====================================
// Create Withdraw :: M
// =====================================

async function createWithdraw() {

    const amountInput =
        document.getElementById(
            "withdrawAmountToman"
        );


    const bankInput =
        document.getElementById(
            "withdrawBankAccount"
        );


    const holderInput =
        document.getElementById(
            "withdrawHolderName"
        );


    const amountToman =
        Math.floor(
            safeNumber(
                amountInput?.value
            )
        );


    const bankAccount =
        String(
            bankInput?.value ||
            ""
        ).trim();


    const accountHolderName =
        String(
            holderInput?.value ||
            ""
        ).trim();


    if (
        amountToman <= 0
    ) {

        showToast(
            "مبلغ برداشت را به تومان وارد کنید"
        );

        return;

    }


    if (
        amountToman <
        100000
    ) {

        showToast(
            "حداقل برداشت ۱۰۰٬۰۰۰ تومان است"
        );

        return;

    }


    if (
        !bankAccount
    ) {

        showToast(
            "شماره شبا را وارد کنید"
        );

        return;

    }


    if (
        !accountHolderName
    ) {

        showToast(
            "نام صاحب حساب را وارد کنید"
        );

        return;

    }


    const telegramUser =
        getTelegramUser();


    const userId =
        state.user?._id ||
        state.user?.id ||
        telegramUser?.id;


    if (!userId) {

        showToast(
            "کاربر شناسایی نشد"
        );

        return;

    }


    const data =
        await apiRequest(
            "/api/withdraw",
            {

                method:
                    "POST",

                body: {

                    userId,

                    amountToman,

                    method:
                        "BANK",

                    bankAccount,

                    accountHolderName

                }

            }
        );


    if (
        data?.success
    ) {

        showToast(
            "درخواست برداشت ثبت شد"
        );


        await loadWallet();

        navigateTo(
            "wallet"
        );

    }
    else {

        showToast(
            data?.message ||
            "ثبت برداشت ناموفق بود"
        );

    }

}


// =====================================
// Toggle Bot :: M
// =====================================

async function toggleBot() {

    const telegramUser =
        getTelegramUser();

    const userId =
        state.user?._id ||
        state.user?.id ||
        telegramUser?.id;


    if (!userId) {

        showToast(
            "کاربر شناسایی نشد"
        );

        return;

    }


    if (
        state.bot.status ===
        "ACTIVE"
    ) {

        showToast(
            "توقف ربات از پنل مدیریت انجام می‌شود"
        );

        return;

    }


    const data =
        await apiRequest(
            "/api/bot/start/" +
            encodeURIComponent(
                userId
            ),
            {

                method:
                    "POST"

            }
        );


    if (
        data?.success ||
        data?.bot
    ) {

        state.bot.status =
            "ACTIVE";

        showToast(
            "ربات AI فعال شد"
        );

        render();

    }
    else {

        showToast(
            data?.message ||
            "فعال‌سازی ربات ناموفق بود"
        );

    }

}


// =====================================
// Open Support :: M
// =====================================

function openSupport() {

    const username =
        SUPPORT_USERNAME
            .replace("@", "")
            .trim();


    const url =
        "https://t.me/" +
        username;


    try {

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

    } catch (error) {

        console.warn(
            "Support open error:",
            error
        );

    }


    openExternal(
        url
    );

}


// =====================================
// External Link :: M
// =====================================

function openExternal(
    url
) {

    if (!url) {

        return;

    }


    try {

        if (
            tg &&
            typeof tg.openLink ===
            "function"
        ) {

            tg.openLink(
                url
            );

            return;

        }

    } catch {

        // fallback
    }


    window.open(
        url,
        "_blank"
    );

}


// =====================================
// Toast :: M
// =====================================

function showToast(
    message
) {

    let toast =
        document.getElementById(
            "appToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "appToast";

        toast.className =
            "app-toast";

        document.body.appendChild(
            toast
        );

    }


    toast.textContent =
        message ||
        "انجام شد";


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.__toastTimer
    );


    window.__toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3000
        );

}


// =====================================
// Navigation :: M
// =====================================

function navigateTo(
    page
) {

    const allowed = [

        "dashboard",
        "wallet",
        "trades",
        "analytics",
        "profile"

    ];


    if (
        !allowed.includes(
            page
        )
    ) {

        page =
            "dashboard";

    }


    state.currentPage =
        page;


    render();

}


// =====================================
// Render :: M
// =====================================

function render() {

    const app =
        getApp();


    if (!app) {

        return;

    }


    try {

        switch (
            state.currentPage
        ) {

            case "wallet":

                app.innerHTML =
                    renderWallet();

                break;


            case "trades":

                app.innerHTML =
                    renderTrades();

                break;


            case "analytics":

                app.innerHTML =
                    renderAnalytics();

                break;


            case "profile":

                app.innerHTML =
                    renderProfile();

                break;


            case "dashboard":

            default:

                app.innerHTML =
                    renderDashboard();

                break;

        }

    }

    catch (error) {

        console.error(
            "Render Error:",
            error
        );


        app.innerHTML = `

            <div class="page">

                ${renderHeader("خطا")}

                <div class="section-card">

                    <div class="section-title">
                        AutoTrade AI
                    </div>

                    <p>
                        اطلاعات موقتاً در دسترس نیست.
                    </p>

                    <strong>
                        موجودی: ۰ USD
                    </strong>

                    <button
                        class="primary-button"
                        onclick="render()"
                    >
                        تلاش مجدد
                    </button>

                </div>

            </div>

            ${renderBottomNavigation()}

        `;

    }

}


// =====================================
// Inject Required Styles :: M
// =====================================

function injectStyles() {

    if (
        document.getElementById(
            "autotrade-runtime-style"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "autotrade-runtime-style";


    style.textContent = `

        * {
            box-sizing: border-box;
        }


        html,
        body {

            margin: 0;
            padding: 0;

            min-height: 100%;

            background:
                #0b1020;

            color:
                #ffffff;

            font-family:
                Arial,
                Tahoma,
                sans-serif;

        }


        body {

            padding-bottom:
                82px;

        }


        button,
        input {

            font-family:
                inherit;

        }


        button {

            cursor:
                pointer;

        }


        .page {

            width:
                100%;

            max-width:
                700px;

            margin:
                0 auto;

            padding:
                18px 16px 100px;

        }


        .top-header {

            display:
                flex;

            justify-content:
                space-between;

            align-items:
                center;

            margin-bottom:
                18px;

        }


        .app-title {

            font-size:
                22px;

            font-weight:
                800;

        }


        .app-subtitle {

            margin-top:
                4px;

            font-size:
                12px;

            opacity:
                .65;

        }


        .header-status {

            display:
                flex;

            align-items:
                center;

            gap:
                6px;

            font-size:
                12px;

            opacity:
                .8;

        }


        .status-dot {

            width:
                8px;

            height:
                8px;

            border-radius:
                50%;

            background:
                #42d392;

        }


        .welcome-box {

            padding:
                20px;

            border-radius:
                22px;

            background:
                #111827;

            margin-bottom:
                14px;

        }


        .welcome-small {

            font-size:
                13px;

            opacity:
                .65;

        }


        .welcome-box h1 {

            margin:
                7px 0;

            font-size:
                24px;

        }


        .welcome-box p {

            margin:
                0;

            font-size:
                13px;

            opacity:
                .65;

        }


        .main-balance-card,
        .wallet-main-card {

            padding:
                25px;

            border-radius:
                24px;

            background:
                linear-gradient(
                    145deg,
                    #18233b,
                    #101827
                );

            margin-bottom:
                14px;

        }


        .card-label {

            font-size:
                13px;

            opacity:
                .65;

            margin-bottom:
                8px;

        }


        .balance-usd {

            font-size:
                29px;

            font-weight:
                800;

        }


        .balance-toman {

            margin-top:
                7px;

            font-size:
                15px;

            opacity:
                .75;

        }


        .stats-grid,
        .analytics-grid {

            display:
                grid;

            grid-template-columns:
                repeat(2, 1fr);

            gap:
                10px;

            margin-bottom:
                14px;

        }


        .stat-card,
        .analytics-card {

            padding:
                16px;

            border-radius:
                18px;

            background:
                #111827;

        }


        .stat-card span,
        .analytics-card span {

            display:
                block;

            font-size:
                12px;

            opacity:
                .6;

            margin-bottom:
                8px;

        }


        .stat-card strong,
        .analytics-card strong {

            font-size:
                17px;

        }


        .section-card {

            padding:
                18px;

            border-radius:
                20px;

            background:
                #111827;

            margin-bottom:
                14px;

        }


        .section-title {

            font-size:
                16px;

            font-weight:
                800;

            margin-bottom:
                15px;

        }


        .info-row,
        .trade-row {

            display:
                flex;

            justify-content:
                space-between;

            align-items:
                center;

            gap:
                12px;

            padding:
                13px 0;

            border-bottom:
                1px solid
                rgba(255,255,255,.07);

        }


        .info-row:last-child,
        .trade-row:last-child {

            border-bottom:
                0;

        }


        .info-row span {

            font-size:
                13px;

            opacity:
                .65;

        }


        .info-row strong {

            font-size:
                13px;

            text-align:
                left;

        }


        .primary-button,
        .secondary-button {

            width:
                100%;

            border:
                0;

            border-radius:
                15px;

            padding:
                15px;

            margin-top:
                10px;

            font-size:
                14px;

            font-weight:
                800;

        }


        .primary-button {

            background:
                #ffffff;

            color:
                #0b1020;

        }


        .secondary-button {

            background:
                #1c2639;

            color:
                #ffffff;

        }


        button:disabled {

            opacity:
                .5;

            cursor:
                not-allowed;

        }


        .wallet-actions {

            margin-bottom:
                14px;

        }


        .big-number {

            font-size:
                25px;

            font-weight:
                800;

        }


        .muted {

            margin-top:
                6px;

            opacity:
                .6;

            font-size:
                13px;

        }


        .profile-card {

            text-align:
                center;

            padding:
                24px;

            border-radius:
                24px;

            background:
                #111827;

            margin-bottom:
                14px;

        }


        .profile-avatar {

            width:
                76px;

            height:
                76px;

            margin:
                0 auto 12px;

            border-radius:
                50%;

            display:
                flex;

            align-items:
                center;

            justify-content:
                center;

            background:
                #25314b;

            font-size:
                28px;

            font-weight:
                800;

        }


        .profile-name {

            font-size:
                21px;

            font-weight:
                800;

        }


        .profile-username {

            margin-top:
                5px;

            font-size:
                13px;

            opacity:
                .6;

        }


        .account-badge {

            display:
                inline-block;

            margin-top:
                12px;

            padding:
                6px 12px;

            border-radius:
                20px;

            background:
                #182b25;

            font-size:
                11px;

        }


        .support-card {

            text-align:
                center;

        }


        .support-icon {

            font-size:
                32px;

            margin-bottom:
                7px;

        }


        .support-username {

            direction:
                ltr;

            font-size:
                17px;

            font-weight:
                800;

            margin:
                10px 0;

        }


        .trade-row small {

            display:
                block;

            margin-top:
                5px;

            opacity:
                .5;

        }


        .profit {

            color:
                #57d99a;

        }


        .loss {

            color:
                #ff7373;

        }


        .empty-state {

            text-align:
                center;

            padding:
                35px 10px;

            opacity:
                .7;

        }


        .empty-icon {

            font-size:
                35px;

            margin-bottom:
                10px;

        }


        .money-input {

            width:
                100%;

            border:
                1px solid
                rgba(255,255,255,.1);

            outline:
                none;

            border-radius:
                14px;

            background:
                #0b1020;

            color:
                #ffffff;

            padding:
                15px;

            margin:
                8px 0 12px;

            font-size:
                15px;

            direction:
                rtl;

        }


        .money-input:focus {

            border-color:
                rgba(255,255,255,.35);

        }


        label {

            display:
                block;

            font-size:
                13px;

            margin-top:
                10px;

            opacity:
                .75;

        }


        .amount-preview {

            padding:
                12px;

            border-radius:
                12px;

            background:
                #0b1020;

            font-size:
                13px;

            opacity:
                .8;

            margin-bottom:
                8px;

        }


        .available-box {

            padding:
                16px;

            border-radius:
                16px;

            background:
                #0b1020;

            margin-bottom:
                15px;

        }


        .available-box span,
        .available-box small {

            display:
                block;

            opacity:
                .6;

        }


        .available-box strong {

            display:
                block;

            margin:
                7px 0;

            font-size:
                22px;

        }


        .bottom-nav {

            position:
                fixed;

            z-index:
                100;

            bottom:
                0;

            right:
                0;

            left:
                0;

            height:
                72px;

            display:
                grid;

            grid-template-columns:
                repeat(5, 1fr);

            background:
                rgba(11,16,32,.97);

            border-top:
                1px solid
                rgba(255,255,255,.08);

            backdrop-filter:
                blur(12px);

        }


        .nav-item {

            border:
                0;

            background:
                transparent;

            color:
                #ffffff;

            opacity:
                .5;

            display:
                flex;

            flex-direction:
                column;

            align-items:
                center;

            justify-content:
                center;

            gap:
                4px;

        }


        .nav-item span {

            font-size:
                20px;

        }


        .nav-item small {

            font-size:
                10px;

        }


        .nav-item.active {

            opacity:
                1;

        }


        .app-toast {

            position:
                fixed;

            z-index:
                999;

            left:
                50%;

            bottom:
                90px;

            transform:
                translate(-50%, 20px);

            background:
                #ffffff;

            color:
                #0b1020;

            padding:
                12px 18px;

            border-radius:
                14px;

            font-size:
                13px;

            opacity:
                0;

            pointer-events:
                none;

            transition:
                .25s ease;

            white-space:
                nowrap;

            max-width:
                90%;

            overflow:
                hidden;

            text-overflow:
                ellipsis;

        }


        .app-toast.show {

            opacity:
                1;

            transform:
                translate(-50%, 0);

        }


        @media (
            min-width: 600px
        ) {

            .bottom-nav {

                left:
                    50%;

                right:
                    auto;

                width:
                    700px;

                transform:
                    translateX(-50%);

                border-radius:
                    18px 18px 0 0;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


// =====================================
// Initialization :: M
// =====================================

async function initApp() {

    injectStyles();

    render();


    try {

        await loadAllData();

    }

    catch (error) {

        console.error(
            "Initial loading error:",
            error
        );

    }


    render();

}


// =====================================
// Auto Refresh :: M
// =====================================

setInterval(
    async () => {

        try {

            await Promise.allSettled([

                loadExchangeRate(),
                loadWallet(),
                loadBot()

            ]);


            render();

        }

        catch (error) {

            console.warn(
                "Auto refresh error:",
                error
            );

        }

    },
    30000
);


// =====================================
// Global Functions :: M
// =====================================

window.navigateTo =
    navigateTo;

window.render =
    render;

window.renderProfile =
    renderProfile;

window.openSupport =
    openSupport;

window.showDeposit =
    showDeposit;

window.createDeposit =
    createDeposit;

window.showWithdraw =
    showWithdraw;

window.createWithdraw =
    createWithdraw;

window.fillWithdrawAll =
    fillWithdrawAll;

window.toggleBot =
    toggleBot;

window.updateDepositPreview =
    updateDepositPreview;


// =====================================
// Start :: M
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    initApp
);


// اگر DOMContentLoaded قبلاً اجرا شده باشد
if (
    document.readyState !==
    "loading"
) {

    initApp();

}