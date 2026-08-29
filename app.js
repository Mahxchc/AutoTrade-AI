// =====================================
// ..M AutoTrade AI
// File: MiniApp/app.js
// نسخه کامل Mini App
// Support: @mehdi2410l
// =====================================

"use strict";


// =====================================
// TELEGRAM
// =====================================

const tg =
    window.Telegram &&
    window.Telegram.WebApp
        ? window.Telegram.WebApp
        : null;


if (tg) {

    tg.ready();

    tg.expand();

    try {

        tg.setBackgroundColor("#050816");
        tg.setHeaderColor("#050816");

    } catch (error) {

        console.warn(
            "Telegram UI:",
            error
        );

    }

}


// =====================================
// CONFIG
// =====================================

const BACKEND_URL =
    "https://autotrade-backend-02cc.onrender.com";

const SUPPORT_USERNAME =
    "@mehdi2410l";


// =====================================
// STATE
// =====================================

const state = {

    page: "dashboard",

    loading: false,

    user: {

        id: 0,

        firstName: "کاربر",

        lastName: "",

        username: ""

    },

    wallet: {

        balance: 0,

        totalProfit: 0,

        totalTrades: 0,

        withdrawable: 0,

        currency: "USDT"

    },

    bot: {

        status: "STOPPED",

        strategy: "AI Scalping",

        accuracy: 0,

        confidence: 0,

        lastSignal: "WAIT"

    },

    trades: [],

    deposits: [],

    exchangeRate: 0

};


// =====================================
// TELEGRAM USER
// =====================================

function getTelegramUser() {

    const user =
        tg?.initDataUnsafe?.user;

    if (!user) {

        return;

    }

    state.user = {

        id:
            Number(user.id) || 0,

        firstName:
            user.first_name ||
            "کاربر",

        lastName:
            user.last_name ||
            "",

        username:
            user.username ||
            ""

    };

}


// =====================================
// HELPERS
// =====================================

function number(value) {

    const n =
        Number(value);

    return Number.isFinite(n)
        ? n
        : 0;

}


function usd(value) {

    return number(value)
        .toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


function toman(value) {

    return number(value)
        .toLocaleString(
            "fa-IR",
            {
                maximumFractionDigits: 0
            }
        );

}


function safe(value) {

    return String(
        value ?? ""
    )
    .replace(
        /[&<>"']/g,
        function (character) {

            const map = {

                "&": "&amp;",

                "<": "&lt;",

                ">": "&gt;",

                '"': "&quot;",

                "'": "&#039;"

            };

            return map[character];

        }
    );

}


function userId() {

    return (
        state.user.id ||
        tg?.initDataUnsafe?.user?.id ||
        0
    );

}


// =====================================
// ROOT
// =====================================

function getRoot() {

    let root =
        document.getElementById(
            "app"
        );

    if (!root) {

        root =
            document.getElementById(
                "root"
            );

    }

    if (!root) {

        root =
            document.body;

    }

    return root;

}


// =====================================
// TOAST
// =====================================

function showToast(message) {

    let toast =
        document.getElementById(
            "m-toast"
        );

    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "m-toast";

        document.body.appendChild(
            toast
        );

    }

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        window.__toastTimer
    );

    window.__toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


// =====================================
// API
// =====================================

async function api(
    path,
    options = {}
) {

    const headers = {

        "Content-Type":
            "application/json"

    };


    if (tg?.initData) {

        headers[
            "X-Telegram-Init-Data"
        ] =
            tg.initData;

    }


    const response =
        await fetch(
            BACKEND_URL + path,
            {

                ...options,

                headers: {

                    ...headers,

                    ...(options.headers || {})

                }

            }
        );


    let data = {};

    try {

        data =
            await response.json();

    } catch (error) {

        data = {};

    }


    if (!response.ok) {

        throw new Error(

            data.message ||
            "ارتباط با سرور برقرار نشد"

        );

    }


    return data;

}


// =====================================
// LOAD EXCHANGE RATE
// =====================================

async function loadExchangeRate() {

    try {

        const data =
            await api(
                "/api/currency/exchange-rate"
            );

        state.exchangeRate =
            number(

                data.rate ??
                data.exchangeRate ??
                data.usdToToman ??
                data.usdToIrr ??
                0

            );

    } catch (error) {

        state.exchangeRate = 0;

        console.warn(
            "Exchange Rate:",
            error.message
        );

    }

}


// =====================================
// LOAD WALLET
// =====================================

async function loadWallet() {

    const id =
        state.user.backendId;

    if (!id) {

        return;

    }


    try {

        const data =
            await api(
                "/api/wallet/" +
                encodeURIComponent(id)
            );

        const wallet =
            data.wallet ||
            data ||
            {};


        state.wallet = {

            balance:
                number(
                    wallet.balance
                ),

            totalProfit:
                number(
                    wallet.totalProfit
                ),

            totalTrades:
                number(
                    wallet.totalTrades
                ),

            withdrawable:
                number(
                    wallet.withdrawable ??
                    wallet.balance
                ),

            currency:
                wallet.currency ||
                "USDT"

        };

    } catch (error) {

        console.warn(
            "Wallet:",
            error.message
        );

    }

}


// =====================================
// LOAD BOT
// =====================================

async function loadBot() {

    const id =
        state.user.backendId;

    if (!id) {

        return;

    }


    try {

        const data =
            await api(
                "/api/bot/" +
                encodeURIComponent(id)
            );

        const bot =
            data.bot ||
            data ||
            {};


        state.bot = {

            status:
                bot.status ||
                "STOPPED",

            strategy:
                bot.strategy ||
                "AI Scalping",

            accuracy:
                number(
                    bot.accuracy
                ),

            confidence:
                number(
                    bot.confidence
                ),

            lastSignal:
                bot.lastSignal ||
                "WAIT"

        };

    } catch (error) {

        console.warn(
            "Bot:",
            error.message
        );

    }

}


// =====================================
// LOAD TRADES
// =====================================

async function loadTrades() {

    const id =
        state.user.backendId;

    if (!id) {

        return;

    }


    try {

        const data =
            await api(
                "/api/trades/" +
                encodeURIComponent(id)
            );

        state.trades =
            Array.isArray(data)
                ? data
                : (
                    data.trades ||
                    []
                );

    } catch (error) {

        state.trades = [];

    }

}


// =====================================
// LOAD DEPOSITS
// =====================================

async function loadDeposits() {

    const id =
        state.user.backendId;

    if (!id) {

        return;

    }


    try {

        const data =
            await api(
                "/api/deposit/user/" +
                encodeURIComponent(id)
            );

        state.deposits =
            data.deposits ||
            [];

    } catch (error) {

        state.deposits = [];

    }

}


// =====================================
// TELEGRAM AUTH
// =====================================

async function authenticate() {

    if (
        !tg?.initData
    ) {

        return;

    }


    try {

        const data =
            await api(
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


        const user =
            data.user ||
            data;


        state.user.backendId =
            user._id ||
            user.id;

    } catch (error) {

        console.warn(
            "Telegram Auth:",
            error.message
        );

    }

}


// =====================================
// HEADER
// =====================================

function renderHeader(
    title,
    subtitle
) {

    return `

        <div class="m-header">

            <div>

                <div class="m-title">
                    ${safe(title)}
                </div>

                <div class="m-subtitle">
                    ${safe(subtitle)}
                </div>

            </div>

            <button
                class="m-refresh"
                data-action="refresh"
                type="button"
            >
                ↻
            </button>

        </div>

    `;

}


// =====================================
// DASHBOARD
// =====================================

function renderDashboard() {

    const w =
        state.wallet;

    const b =
        state.bot;


    const tomanValue =

        state.exchangeRate > 0

            ?

        number(w.balance) *
        state.exchangeRate

            :

        0;


    return `

        ${renderHeader(
            "AutoTrade AI",
            "مدیریت هوشمند سرمایه"
        )}


        <div class="m-card m-balance">

            <div class="m-card-top">

                <span>
                    موجودی کل
                </span>

                <b>
                    USDT
                </b>

            </div>


            <div class="m-big-number">

                $${usd(w.balance)}

            </div>


            <div class="m-toman">

                ${toman(tomanValue)}
                تومان

            </div>


            <div class="m-actions">

                <button
                    class="m-button primary"
                    data-page="deposit"
                    type="button"
                >
                    واریز
                </button>

                <button
                    class="m-button"
                    data-page="withdraw"
                    type="button"
                >
                    برداشت
                </button>

            </div>

        </div>


        <div class="m-grid">

            <div class="m-stat">

                <span>
                    سود امروز
                </span>

                <strong>
                    $0.00
                </strong>

                <small>
                    0.00%
                </small>

            </div>


            <div class="m-stat">

                <span>
                    سود کل
                </span>

                <strong>
                    $${usd(w.totalProfit)}
                </strong>

                <small>
                    0.00%
                </small>

            </div>


            <div class="m-stat">

                <span>
                    تعداد معاملات
                </span>

                <strong>
                    ${number(
                        w.totalTrades
                    ).toLocaleString("fa-IR")}
                </strong>

                <small>
                    معاملات ثبت‌شده
                </small>

            </div>


            <div class="m-stat">

                <span>
                    نرخ موفقیت
                </span>

                <strong>
                    0.00%
                </strong>

                <small>
                    عملکرد
                </small>

            </div>

        </div>


        <div class="m-section-title">

            <h2>
                ربات هوش مصنوعی
            </h2>

            <span
                class="${
                    b.status === "ACTIVE"
                        ? "m-status active"
                        : "m-status"
                }"
            >

                ${
                    b.status === "ACTIVE"
                        ? "فعال"
                        : "متوقف"
                }

            </span>

        </div>


        <div class="m-card">

            <div class="m-row">

                <span>
                    استراتژی
                </span>

                <strong>
                    ${safe(b.strategy)}
                </strong>

            </div>


            <div class="m-row">

                <span>
                    دقت تحلیل
                </span>

                <strong>
                    ${number(b.accuracy).toFixed(2)}%
                </strong>

            </div>


            <div class="m-row">

                <span>
                    آخرین سیگنال
                </span>

                <strong>

                    ${
                        b.lastSignal === "BUY"
                            ? "خرید"
                            :
                        b.lastSignal === "SELL"
                            ? "فروش"
                            :
                        "انتظار"
                    }

                </strong>

            </div>


            <button
                class="m-button primary full"
                data-action="startBot"
                type="button"
            >

                ${
                    b.status === "ACTIVE"
                        ?
                    "ربات فعال است"
                        :
                    "شروع معامله‌گری هوشمند"
                }

            </button>

        </div>


        <div class="m-section-title">

            <h2>
                آخرین معاملات
            </h2>

            <button
                class="m-link"
                data-page="trades"
                type="button"
            >
                مشاهده همه
            </button>

        </div>


        <div class="m-card">

            ${renderTrades(3)}

        </div>

    `;

}


// =====================================
// WALLET
// =====================================

function renderWallet() {

    const w =
        state.wallet;


    return `

        ${renderHeader(
            "کیف پول",
            "موجودی حساب شما"
        )}


        <div class="m-card m-balance">

            <div class="m-card-top">

                <span>
                    موجودی قابل استفاده
                </span>

                <b>
                    USDT
                </b>

            </div>


            <div class="m-big-number">

                $${usd(w.balance)}

            </div>


            <div class="m-toman">

                ${toman(
                    number(w.balance) *
                    number(state.exchangeRate)
                )}

                تومان

            </div>

        </div>


        <div class="m-actions">

            <button
                class="m-button primary"
                data-page="deposit"
                type="button"
            >
                واریز
            </button>

            <button
                class="m-button"
                data-page="withdraw"
                type="button"
            >
                برداشت
            </button>

        </div>


        <div class="m-section-title">

            <h2>
                خلاصه
            </h2>

        </div>


        <div class="m-card">

            <div class="m-row">

                <span>
                    سرمایه فعلی
                </span>

                <strong>
                    $${usd(w.balance)}
                </strong>

            </div>


            <div class="m-row">

                <span>
                    سود کل
                </span>

                <strong>
                    $${usd(w.totalProfit)}
                </strong>

            </div>


            <div class="m-row">

                <span>
                    قابل برداشت
                </span>

                <strong>
                    $${usd(w.withdrawable)}
                </strong>

            </div>


            <div class="m-row">

                <span>
                    تعداد معاملات
                </span>

                <strong>
                    ${number(w.totalTrades)}
                </strong>

            </div>

        </div>

    `;

}


// =====================================
// TRADES
// =====================================

function renderTrades(
    limit = 50
) {

    if (
        !state.trades.length
    ) {

        return `

            <div class="m-empty">

                <div>
                    📊
                </div>

                <strong>
                    هنوز معامله‌ای ثبت نشده است
                </strong>

                <span>
                    تعداد معاملات: 0
                </span>

            </div>

        `;

    }


    return state.trades
        .slice(0, limit)
        .map(
            function (trade) {

                const type =
                    trade.type === "BUY"
                        ? "خرید"
                        : "فروش";


                return `

                    <div class="m-trade">

                        <div>

                            <strong>
                                ${type}
                                ${safe(
                                    trade.symbol ||
                                    ""
                                )}
                            </strong>

                            <small>
                                ${
                                    trade.status ===
                                    "OPEN"
                                        ?
                                    "باز"
                                        :
                                    "بسته"
                                }
                            </small>

                        </div>


                        <div>

                            <strong>
                                $${usd(
                                    trade.profit
                                )}
                            </strong>

                            <small>
                                سود / زیان
                            </small>

                        </div>

                    </div>

                `;

            }
        )
        .join("");

}


// =====================================
// TRADES PAGE
// =====================================

function renderTradesPage() {

    return `

        ${renderHeader(
            "معاملات",
            "معاملات ثبت‌شده"
        )}


        <div class="m-card">

            ${renderTrades()}

        </div>

    `;

}


// =====================================
// ANALYTICS
// =====================================

function renderAnalytics() {

    const w =
        state.wallet;


    return `

        ${renderHeader(
            "آمار",
            "عملکرد حساب"
        )}


        <div class="m-grid">

            <div class="m-stat">

                <span>
                    سرمایه فعلی
                </span>

                <strong>
                    $${usd(w.balance)}
                </strong>

            </div>


            <div class="m-stat">

                <span>
                    سود کل
                </span>

                <strong>
                    $${usd(w.totalProfit)}
                </strong>

            </div>


            <div class="m-stat">

                <span>
                    معاملات
                </span>

                <strong>
                    ${number(
                        w.totalTrades
                    )}
                </strong>

            </div>


            <div class="m-stat">

                <span>
                    موفقیت
                </span>

                <strong>
                    0.00%
                </strong>

            </div>

        </div>


        <div class="m-card">

            <div class="m-empty">

                <strong>
                    اطلاعات آماری
                </strong>

                <span>
                    سود امروز: $0.00
                </span>

                <span>
                    ضرر امروز: $0.00
                </span>

                <span>
                    تعداد معاملات موفق: 0
                </span>

                <span>
                    تعداد معاملات ناموفق: 0
                </span>

            </div>

        </div>

    `;

}


// =====================================
// PROFILE
// فقط پشتیبانی
// =====================================

function renderProfile() {

    return `

        ${renderHeader(
            "پشتیبانی",
            "ارتباط با پشتیبانی AutoTrade AI"
        )}


        <div class="m-card m-support">

            <div class="m-support-icon">
                💬
            </div>


            <h2>
                پشتیبانی
            </h2>


            <p>
                برای ارتباط با پشتیبانی
                روی دکمه زیر بزنید.
            </p>


            <div class="m-support-id">

                ${SUPPORT_USERNAME}

            </div>


            <button
                class="m-button primary full"
                data-action="support"
                type="button"
            >

                ارتباط با پشتیبانی

            </button>

        </div>

    `;

}


// =====================================
// DEPOSIT
// =====================================

function renderDeposit() {

    return `

        ${renderHeader(
            "واریز",
            "افزایش موجودی حساب"
        )}


        <div class="m-card">

            <label class="m-label">
                مبلغ به تومان
            </label>


            <input
                id="depositAmount"
                class="m-input"
                type="number"
                min="0"
                value="0"
                placeholder="0"
            />


            <div class="m-row">

                <span>
                    نرخ دلار
                </span>

                <strong>
                    ${
                        state.exchangeRate > 0
                            ?
                        toman(
                            state.exchangeRate
                        ) + " تومان"
                            :
                        "0 تومان"
                    }
                </strong>

            </div>


            <div class="m-row">

                <span>
                    معادل USDT
                </span>

                <strong
                    id="depositUsd"
                >
                    $0.00
                </strong>

            </div>


            <button
                class="m-button primary full"
                data-action="createDeposit"
                type="button"
            >

                ایجاد درخواست واریز

            </button>

        </div>

    `;

}


// =====================================
// WITHDRAW
// =====================================

function renderWithdraw() {

    return `

        ${renderHeader(
            "برداشت",
            "درخواست برداشت موجودی"
        )}


        <div class="m-card">

            <div class="m-row">

                <span>
                    موجودی قابل برداشت
                </span>

                <strong>
                    $${usd(
                        state.wallet.withdrawable
                    )}
                </strong>

            </div>


            <label class="m-label">
                مبلغ USDT
            </label>


            <input
                id="withdrawAmount"
                class="m-input"
                type="number"
                min="0"
                step="0.01"
                value="0"
            />


            <label class="m-label">
                شبکه
            </label>


            <select
                id="withdrawNetwork"
                class="m-input"
            >

                <option value="">
                    انتخاب شبکه
                </option>

                <option value="TRC20">
                    TRC20
                </option>

                <option value="BEP20">
                    BEP20
                </option>

                <option value="ERC20">
                    ERC20
                </option>

            </select>


            <label class="m-label">
                آدرس کیف پول
            </label>


            <input
                id="withdrawAddress"
                class="m-input"
                type="text"
                placeholder="آدرس کیف پول"
            />


            <button
                class="m-button primary full"
                data-action="withdraw"
                type="button"
            >

                ثبت درخواست برداشت

            </button>

        </div>

    `;

}


// =====================================
// PAGE RENDER
// =====================================

function renderPage() {

    const root =
        getRoot();


    let content = "";


    switch (
        state.page
    ) {

        case "wallet":

            content =
                renderWallet();

            break;


        case "trades":

            content =
                renderTradesPage();

            break;


        case "analytics":

            content =
                renderAnalytics();

            break;


        case "profile":

            content =
                renderProfile();

            break;


        case "deposit":

            content =
                renderDeposit();

            break;


        case "withdraw":

            content =
                renderWithdraw();

            break;


        default:

            content =
                renderDashboard();

            break;

    }


    root.innerHTML = `

        <div class="m-app">

            <div class="m-content">

                ${content}

            </div>


            ${
                state.page === "deposit" ||
                state.page === "withdraw"

                    ?

                ""

                    :

                renderBottomNav()

            }

        </div>

    `;


    attachInputEvents();

}


// =====================================
// BOTTOM NAV
// =====================================

function renderBottomNav() {

    return `

        <nav class="m-bottom-nav">


            <button
                class="${
                    state.page === "dashboard"
                        ? "active"
                        : ""
                }"
                data-page="dashboard"
                type="button"
            >

                <span>
                    ⌂
                </span>

                <small>
                    داشبورد
                </small>

            </button>


            <button
                class="${
                    state.page === "wallet"
                        ? "active"
                        : ""
                }"
                data-page="wallet"
                type="button"
            >

                <span>
                    ▣
                </span>

                <small>
                    کیف پول
                </small>

            </button>


            <button
                class="${
                    state.page === "trades"
                        ? "active"
                        : ""
                }"
                data-page="trades"
                type="button"
            >

                <span>
                    ↕
                </span>

                <small>
                    معاملات
                </small>

            </button>


            <button
                class="${
                    state.page === "analytics"
                        ? "active"
                        : ""
                }"
                data-page="analytics"
                type="button"
            >

                <span>
                    ◔
                </span>

                <small>
                    آمار
                </small>

            </button>


            <button
                class="${
                    state.page === "profile"
                        ? "active"
                        : ""
                }"
                data-page="profile"
                type="button"
            >

                <span>
                    ◉
                </span>

                <small>
                    پشتیبانی
                </small>

            </button>


        </nav>

    `;

}


// =====================================
// NAVIGATION
// =====================================

function goTo(
    page
) {

    state.page =
        page;

    renderPage();

    window.scrollTo(
        0,
        0
    );

}


// =====================================
// SUPPORT
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
// START BOT
// =====================================

async function startBot() {

    const id =
        state.user.backendId;

    if (!id) {

        showToast(
            "ابتدا اتصال حساب انجام شود"
        );

        return;

    }


    if (
        state.bot.status ===
        "ACTIVE"
    ) {

        showToast(
            "ربات در حال حاضر فعال است"
        );

        return;

    }


    try {

        await api(

            "/api/bot/start/" +
            encodeURIComponent(id),

            {

                method:
                    "POST",

                body:
                    JSON.stringify({})

            }

        );


        await loadBot();

        renderPage();

        showToast(
            "ربات هوش مصنوعی فعال شد"
        );

    } catch (error) {

        showToast(
            error.message
        );

    }

}


// =====================================
// CREATE DEPOSIT
// =====================================

async function createDeposit() {

    const amount =
        number(
            document
                .getElementById(
                    "depositAmount"
                )
                ?.value
        );


    const id =
        state.user.backendId;


    if (!id) {

        showToast(
            "حساب کاربری هنوز آماده نیست"
        );

        return;

    }


    if (
        amount <= 0
    ) {

        showToast(
            "مبلغ را بیشتر از صفر وارد کنید"
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


    try {

        const data =
            await api(
                "/api/deposit",
                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            userId:
                                id,

                            amountToman:
                                amount,

                            exchangeRate:
                                state.exchangeRate,

                            method:
                                "GATEWAY",

                            gateway:
                                "ZARINPAL"

                        })

                }
            );


        showToast(

            data.message ||
            "درخواست واریز ایجاد شد"

        );


        await loadDeposits();

        goTo(
            "wallet"
        );

    } catch (error) {

        showToast(
            error.message
        );

    }

}


// =====================================
// WITHDRAW
// =====================================

async function submitWithdraw() {

    const id =
        state.user.backendId;


    const amount =
        number(
            document
                .getElementById(
                    "withdrawAmount"
                )
                ?.value
        );


    const network =
        document
            .getElementById(
                "withdrawNetwork"
            )
            ?.value ||
            "";


    const address =
        document
            .getElementById(
                "withdrawAddress"
            )
            ?.value
            ?.trim() ||
            "";


    if (!id) {

        showToast(
            "حساب کاربری آماده نیست"
        );

        return;

    }


    if (
        amount <= 0
    ) {

        showToast(
            "مبلغ برداشت باید بیشتر از صفر باشد"
        );

        return;

    }


    if (
        amount >
        state.wallet.withdrawable
    ) {

        showToast(
            "موجودی قابل برداشت کافی نیست"
        );

        return;

    }


    if (
        !network ||
        !address
    ) {

        showToast(
            "شبکه و آدرس را وارد کنید"
        );

        return;

    }


    try {

        await api(
            "/api/withdraw",
            {

                method:
                    "POST",

                body:
                    JSON.stringify({

                        userId:
                            id,

                        amount,

                        network,

                        address

                    })

            }
        );


        showToast(
            "درخواست برداشت ثبت شد"
        );


        await loadWallet();

        goTo(
            "wallet"
        );

    } catch (error) {

        showToast(
            error.message
        );

    }

}


// =====================================
// INPUT EVENTS
// =====================================

function attachInputEvents() {

    const deposit =
        document.getElementById(
            "depositAmount"
        );


    if (deposit) {

        deposit.addEventListener(
            "input",
            function () {

                const amount =
                    number(
                        deposit.value
                    );


                const usdValue =

                    state.exchangeRate > 0

                        ?

                    amount /
                    state.exchangeRate

                        :

                    0;


                const output =
                    document.getElementById(
                        "depositUsd"
                    );


                if (output) {

                    output.textContent =
                        "$" +
                        usd(usdValue);

                }

            }
        );

    }

}


// =====================================
// CLICK EVENTS
// =====================================

document.addEventListener(
    "click",
    async function (event) {

        const pageButton =
            event.target.closest(
                "[data-page]"
            );


        const actionButton =
            event.target.closest(
                "[data-action]"
            );


        if (pageButton) {

            const page =
                pageButton.dataset.page;


            if (page) {

                goTo(page);

                return;

            }

        }


        if (!actionButton) {

            return;

        }


        const action =
            actionButton.dataset.action;


        if (
            action ===
            "support"
        ) {

            openSupport();

            return;

        }


        if (
            action ===
            "refresh"
        ) {

            await refresh();

            showToast(
                "اطلاعات به‌روزرسانی شد"
            );

            return;

        }


        if (
            action ===
            "startBot"
        ) {

            await startBot();

            return;

        }


        if (
            action ===
            "createDeposit"
        ) {

            await createDeposit();

            return;

        }


        if (
            action ===
            "withdraw"
        ) {

            await submitWithdraw();

            return;

        }

    }
);


// =====================================
// REFRESH
// =====================================

async function refresh() {

    await Promise.all([

        loadExchangeRate(),

        loadWallet(),

        loadBot(),

        loadTrades(),

        loadDeposits()

    ]);


    renderPage();

}


// =====================================
// CSS
// =====================================

function injectStyles() {

    if (
        document.getElementById(
            "m-auto-trade-style"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "m-auto-trade-style";


    style.textContent = `

        * {
            box-sizing: border-box;
        }


        body {

            margin: 0;

            padding: 0;

            background: #050816;

            color: #ffffff;

            font-family:
                Tahoma,
                Arial,
                sans-serif;

            direction: rtl;

        }


        button,
        input,
        select {

            font-family: inherit;

        }


        button {

            cursor: pointer;

        }


        .m-app {

            min-height: 100vh;

            background: #050816;

            padding-bottom: 80px;

        }


        .m-content {

            width: 100%;

            max-width: 700px;

            margin: auto;

            padding: 18px;

        }


        .m-header {

            display: flex;

            align-items: center;

            justify-content: space-between;

            margin-bottom: 20px;

        }


        .m-title {

            font-size: 25px;

            font-weight: 800;

        }


        .m-subtitle {

            color: #94a3b8;

            font-size: 13px;

            margin-top: 5px;

        }


        .m-refresh {

            width: 42px;

            height: 42px;

            border: 1px solid #263244;

            border-radius: 13px;

            background: #111827;

            color: #ffffff;

            font-size: 22px;

        }


        .m-card {

            background: #111827;

            border: 1px solid #263244;

            border-radius: 20px;

            padding: 18px;

            margin-bottom: 15px;

        }


        .m-balance {

            background:
                linear-gradient(
                    145deg,
                    #111827,
                    #0b1220
                );

        }


        .m-card-top {

            display: flex;

            justify-content: space-between;

            align-items: center;

            color: #cbd5e1;

            font-size: 14px;

        }


        .m-card-top b {

            background: #1e293b;

            border-radius: 8px;

            padding: 5px 9px;

            font-size: 12px;

        }


        .m-big-number {

            direction: ltr;

            text-align: right;

            font-size: 36px;

            font-weight: 800;

            margin-top: 18px;

        }


        .m-toman {

            color: #94a3b8;

            margin-top: 7px;

            font-size: 14px;

        }


        .m-actions {

            display: grid;

            grid-template-columns: 1fr 1fr;

            gap: 10px;

            margin-bottom: 15px;

        }


        .m-button {

            border: 1px solid #334155;

            background: #172033;

            color: #ffffff;

            border-radius: 13px;

            padding: 14px;

            font-size: 15px;

            font-weight: 700;

        }


        .m-button.primary {

            background: #2563eb;

            border-color: #2563eb;

        }


        .m-button.full {

            width: 100%;

            margin-top: 15px;

        }


        .m-button:active {

            transform: scale(.98);

        }


        .m-grid {

            display: grid;

            grid-template-columns: 1fr 1fr;

            gap: 12px;

            margin-bottom: 18px;

        }


        .m-stat {

            background: #111827;

            border: 1px solid #263244;

            border-radius: 17px;

            padding: 16px;

        }


        .m-stat span {

            display: block;

            color: #94a3b8;

            font-size: 13px;

        }


        .m-stat strong {

            display: block;

            direction: ltr;

            text-align: right;

            font-size: 21px;

            margin-top: 10px;

        }


        .m-stat small {

            display: block;

            color: #64748b;

            margin-top: 6px;

            font-size: 11px;

        }


        .m-section-title {

            display: flex;

            align-items: center;

            justify-content: space-between;

            margin: 20px 2px 12px;

        }


        .m-section-title h2 {

            margin: 0;

            font-size: 18px;

        }


        .m-status {

            background: #334155;

            color: #cbd5e1;

            padding: 6px 10px;

            border-radius: 20px;

            font-size: 12px;

        }


        .m-status.active {

            background: #14532d;

            color: #bbf7d0;

        }


        .m-link {

            border: 0;

            background: transparent;

            color: #60a5fa;

            font-size: 13px;

        }


        .m-row {

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 15px;

            padding: 12px 0;

            border-bottom: 1px solid #1e293b;

        }


        .m-row:last-child {

            border-bottom: 0;

        }


        .m-row span {

            color: #94a3b8;

            font-size: 13px;

        }


        .m-row strong {

            font-size: 14px;

        }


        .m-trade {

            display: flex;

            align-items: center;

            justify-content: space-between;

            padding: 14px 0;

            border-bottom: 1px solid #1e293b;

        }


        .m-trade:last-child {

            border-bottom: 0;

        }


        .m-trade strong {

            display: block;

            font-size: 14px;

        }


        .m-trade small {

            display: block;

            color: #94a3b8;

            margin-top: 5px;

            font-size: 11px;

        }


        .m-empty {

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            gap: 9px;

            padding: 28px 10px;

            text-align: center;

        }


        .m-empty > div {

            font-size: 30px;

        }


        .m-empty strong {

            font-size: 14px;

        }


        .m-empty span {

            color: #64748b;

            font-size: 12px;

        }


        .m-bottom-nav {

            position: fixed;

            left: 10px;

            right: 10px;

            bottom: 10px;

            max-width: 680px;

            margin: auto;

            z-index: 1000;

            display: grid;

            grid-template-columns:
                repeat(5, 1fr);

            gap: 3px;

            padding: 7px;

            background: #111827;

            border: 1px solid #263244;

            border-radius: 18px;

            box-shadow:
                0 10px 35px
                rgba(0,0,0,.45);

        }


        .m-bottom-nav button {

            border: 0;

            background: transparent;

            color: #64748b;

            border-radius: 13px;

            padding: 8px 3px;

        }


        .m-bottom-nav button.active {

            background: #1e293b;

            color: #ffffff;

        }


        .m-bottom-nav span {

            display: block;

            font-size: 20px;

        }


        .m-bottom-nav small {

            display: block;

            font-size: 10px;

            margin-top: 4px;

        }


        .m-support {

            text-align: center;

            padding: 30px 20px;

        }


        .m-support-icon {

            width: 72px;

            height: 72px;

            margin: 0 auto 18px;

            display: flex;

            align-items: center;

            justify-content: center;

            background: #2563eb;

            border-radius: 50%;

            font-size: 32px;

        }


        .m-support h2 {

            margin: 0 0 10px;

            font-size: 22px;

        }


        .m-support p {

            color: #94a3b8;

            line-height: 1.8;

            margin: 0 0 18px;

        }


        .m-support-id {

            direction: ltr;

            background: #0b1220;

            border: 1px solid #334155;

            border-radius: 12px;

            padding: 13px;

            margin-bottom: 15px;

            font-size: 17px;

        }


        .m-label {

            display: block;

            color: #cbd5e1;

            font-size: 13px;

            margin: 15px 0 8px;

        }


        .m-input {

            width: 100%;

            border: 1px solid #334155;

            background: #0b1220;

            color: #ffffff;

            border-radius: 12px;

            padding: 14px;

            outline: none;

            font-size: 15px;

            direction: rtl;

        }


        .m-input:focus {

            border-color: #2563eb;

        }


        #m-toast {

            position: fixed;

            left: 20px;

            right: 20px;

            bottom: 95px;

            z-index: 2000;

            background: #1e293b;

            border: 1px solid #334155;

            color: #ffffff;

            border-radius: 13px;

            padding: 13px 15px;

            text-align: center;

            font-size: 13px;

            opacity: 0;

            pointer-events: none;

            transform: translateY(15px);

            transition: .2s;

        }


        #m-toast.show {

            opacity: 1;

            transform: translateY(0);

        }


        @media (
            max-width: 380px
        ) {

            .m-content {

                padding: 13px;

            }


            .m-big-number {

                font-size: 30px;

            }


            .m-bottom-nav small {

                font-size: 9px;

            }

        }

    `;


    document.head.appendChild(
        style
    );

}


// =====================================
// INIT
// =====================================

async function init() {

    injectStyles();

    getTelegramUser();

    renderPage();


    await authenticate();


    await refresh();


    renderPage();

}


init();