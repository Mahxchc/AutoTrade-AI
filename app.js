// =====================================
// ..M AutoTrade AI
// Main Mini App
// File: MiniApp/app.js
// =====================================


// =====================================
// ..M CONFIG
// =====================================

const BACKEND_URL =
    "https://autotrade-backend-02cc.onrender.com";

const SUPPORT_USERNAME =
    "@mehdi2510l";

const DEFAULT_RATE =
    100000;


// =====================================
// ..M STATE
// =====================================

const state = {

    user: null,

    wallet: {

        balance: 0,

        withdrawable: 0,

        totalProfit: 0,

        totalTrades: 0,

        currency: "USDT"

    },

    trades: [],

    bot: {

        status: "STOPPED",

        strategy: "AI Scalping",

        accuracy: 0,

        lastSignal: "WAIT"

    },

    exchangeRate:
        DEFAULT_RATE,

    currentPage:
        "dashboard"

};


// =====================================
// ..M TELEGRAM
// =====================================

const tg =
    window.Telegram &&
    window.Telegram.WebApp
        ? window.Telegram.WebApp
        : null;


if (tg) {

    tg.ready();

    tg.expand();

}


// =====================================
// ..M DOM
// =====================================

function getApp() {

    return document.getElementById(
        "app"
    );

}


// =====================================
// ..M NUMBER
// =====================================

function number(value) {

    const n =
        Number(value);

    if (
        !Number.isFinite(n)
    ) {

        return 0;

    }

    return n;

}


// =====================================
// ..M USD FORMAT
// =====================================

function formatUSD(value) {

    return number(value)
        .toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ) + " USD";

}


// =====================================
// ..M TOMAN FORMAT
// =====================================

function formatToman(value) {

    return Math.round(
        number(value)
    ).toLocaleString(
        "fa-IR"
    ) + " تومان";

}


// =====================================
// ..M USD TO TOMAN
// =====================================

function usdToToman(
    usd
) {

    return Math.round(
        number(usd) *
        number(
            state.exchangeRate ||
            DEFAULT_RATE
        )
    );

}


// =====================================
// ..M TOAST
// =====================================

let toastTimer = null;


function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) {

        return;

    }

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2600
        );

}


// =====================================
// ..M API
// =====================================

async function api(
    path,
    options = {}
) {

    const url =
        BACKEND_URL +
        path;

    const headers = {

        "Content-Type":
            "application/json"

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

                headers: {

                    ...headers,

                    ...(options.headers || {})

                }

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
            data?.error ||
            "خطا در ارتباط با سرور"

        );

    }


    return data;

}


// =====================================
// ..M AUTH
// =====================================

async function authenticateTelegram() {

    if (
        !tg ||
        !tg.initData
    ) {

        state.user = {

            _id:
                localStorage.getItem(
                    "autotrade_user_id"
                ),

            telegramId:
                null,

            firstName:
                "کاربر",

            username:
                ""

        };

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
            data?.user ||
            data?.data?.user ||
            data?.data ||
            data;


        state.user =
            user;


        if (
            user?._id
        ) {

            localStorage.setItem(
                "autotrade_user_id",
                user._id
            );

        }

    }

    catch (error) {

        console.error(
            "Telegram Auth Error:",
            error
        );


        showToast(
            "احراز هویت انجام نشد"
        );

    }

}


// =====================================
// ..M USER ID
// =====================================

function getUserId() {

    return (

        state.user?._id ||

        state.user?.id ||

        localStorage.getItem(
            "autotrade_user_id"
        )

    );

}


// =====================================
// ..M LOAD WALLET
// =====================================

async function loadWallet() {

    const userId =
        getUserId();


    if (!userId) {

        return;

    }


    try {

        const data =
            await api(
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
            typeof wallet ===
                "object"
        ) {

            state.wallet = {

                ...state.wallet,

                ...wallet

            };

        }

    }

    catch (error) {

        console.warn(
            "Wallet:",
            error.message
        );

    }

}


// =====================================
// ..M LOAD TRADES
// =====================================

async function loadTrades() {

    const userId =
        getUserId();


    if (!userId) {

        return;

    }


    try {

        const data =
            await api(
                "/api/trades/" +
                encodeURIComponent(
                    userId
                )
            );


        const trades =
            Array.isArray(data)
                ? data
                : (
                    data?.trades ||
                    data?.data ||
                    []
                );


        state.trades =
            Array.isArray(trades)
                ? trades
                : [];

    }

    catch (error) {

        console.warn(
            "Trades:",
            error.message
        );

    }

}


// =====================================
// ..M LOAD BOT
// =====================================

async function loadBot() {

    const userId =
        getUserId();


    if (!userId) {

        return;

    }


    try {

        const data =
            await api(
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
            typeof bot ===
                "object"
        ) {

            state.bot = {

                ...state.bot,

                ...bot

            };

        }

    }

    catch (error) {

        console.warn(
            "Bot:",
            error.message
        );

    }

}


// =====================================
// ..M LOAD EXCHANGE RATE
// =====================================

async function loadExchangeRate() {

    try {

        const data =
            await api(
                "/api/currency/exchange-rate"
            );


        const rate =
            number(

                data?.rate ??

                data?.exchangeRate ??

                data?.usdToToman ??

                data?.data?.rate

            );


        if (
            rate > 0
        ) {

            state.exchangeRate =
                rate;

        }

    }

    catch {

        state.exchangeRate =
            DEFAULT_RATE;

    }

}


// =====================================
// ..M LOAD ALL
// =====================================

async function loadData() {

    await Promise.allSettled([

        loadWallet(),

        loadTrades(),

        loadBot(),

        loadExchangeRate()

    ]);

}


// =====================================
// ..M NAV
// =====================================

function goTo(
    page
) {

    state.currentPage =
        page;


    render();

}


// =====================================
// ..M NAV ITEM
// =====================================

function navItem(
    page,
    icon,
    title
) {

    const active =
        state.currentPage ===
        page
            ? "active"
            : "";


    return `

        <button
            class="nav-item ${active}"
            data-page="${page}"
            type="button"
        >

            <span class="nav-icon">
                ${icon}
            </span>

            <span>
                ${title}
            </span>

        </button>

    `;

}


// =====================================
// ..M BOTTOM NAV
// =====================================

function renderBottomNav() {

    return `

        <nav class="bottom-nav">

            ${navItem(
                "dashboard",
                "⌂",
                "داشبورد"
            )}

            ${navItem(
                "wallet",
                "◈",
                "کیف پول"
            )}

            ${navItem(
                "trades",
                "↕",
                "معاملات"
            )}

            ${navItem(
                "stats",
                "◔",
                "آمار"
            )}

            ${navItem(
                "profile",
                "◉",
                "پروفایل"
            )}

        </nav>

    `;

}


// =====================================
// ..M HEADER
// =====================================

function renderHeader() {

    const name =
        state.user?.firstName ||
        "کاربر";


    return `

        <header class="top-header">

            <div class="brand-area">

                <div class="brand-logo">
                    AI
                </div>

                <div class="brand-text">

                    <div class="brand-title">
                        AutoTrade AI
                    </div>

                    <div class="brand-subtitle">
                        سلام ${escapeHTML(name)}
                    </div>

                </div>

            </div>

            <button
                class="header-button"
                id="refreshButton"
                type="button"
            >
                ↻
            </button>

        </header>

    `;

}


// =====================================
// ..M ESCAPE
// =====================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


// =====================================
// ..M DASHBOARD
// =====================================

function renderDashboard() {

    const balance =
        number(
            state.wallet.balance
        );

    const profit =
        number(
            state.wallet.totalProfit
        );

    const withdrawable =
        number(
            state.wallet.withdrawable
        );


    const botActive =
        String(
            state.bot.status ||
            ""
        ).toUpperCase() ===
        "ACTIVE";


    return `

        <div class="page">

            ${renderHeader()}


            <section class="glass balance-card">

                <div class="balance-top">

                    <span class="balance-label">
                        موجودی کل
                    </span>

                    <span class="currency-badge">
                        USDT
                    </span>

                </div>


                <div class="balance-value">
                    ${formatUSD(balance)}
                </div>


                <div class="balance-toman">
                    ${formatToman(
                        usdToToman(balance)
                    )}
                </div>


                <div class="balance-actions">

                    <button
                        class="action-button action-secondary"
                        id="depositButton"
                        type="button"
                    >
                        واریز
                    </button>

                    <button
                        class="action-button action-primary"
                        id="withdrawButton"
                        type="button"
                    >
                        برداشت تومان
                    </button>

                </div>

            </section>


            <section class="section">

                <div class="section-title">

                    <h2>
                        وضعیت حساب
                    </h2>

                </div>


                <div class="stats-grid">

                    <div class="glass stat-card">

                        <div class="stat-label">
                            سود کل
                        </div>

                        <div class="stat-value">
                            ${formatUSD(profit)}
                        </div>

                        <div class="stat-small">
                            ${formatToman(
                                usdToToman(profit)
                            )}
                        </div>

                    </div>


                    <div class="glass stat-card">

                        <div class="stat-label">
                            معاملات
                        </div>

                        <div class="stat-value">
                            ${number(
                                state.wallet.totalTrades
                            ).toLocaleString(
                                "fa-IR"
                            )}
                        </div>

                        <div class="stat-small">
                            مجموع معاملات
                        </div>

                    </div>


                    <div class="glass stat-card">

                        <div class="stat-label">
                            قابل برداشت
                        </div>

                        <div class="stat-value">
                            ${formatUSD(
                                withdrawable
                            )}
                        </div>

                        <div class="stat-small">
                            ${formatToman(
                                usdToToman(
                                    withdrawable
                                )
                            )}
                        </div>

                    </div>


                    <div class="glass stat-card">

                        <div class="stat-label">
                            نرخ دلار
                        </div>

                        <div class="stat-value">
                            ${number(
                                state.exchangeRate
                            ).toLocaleString(
                                "fa-IR"
                            )}
                        </div>

                        <div class="stat-small">
                            تومان
                        </div>

                    </div>

                </div>

            </section>


            <section class="section">

                <div class="glass ai-card">

                    <div class="ai-header">

                        <div class="ai-title">

                            <div class="ai-icon">
                                🤖
                            </div>

                            <div>

                                <div class="ai-name">
                                    موتور هوش مصنوعی
                                </div>

                                <div class="ai-description">
                                    مدیریت خودکار معاملات
                                </div>

                            </div>

                        </div>


                        <span class="status ${
                            botActive
                                ? "status-active"
                                : "status-stopped"
                        }">

                            ${
                                botActive
                                    ? "فعال"
                                    : "متوقف"
                            }

                        </span>

                    </div>


                    <div class="ai-info">

                        <div class="ai-info-box">

                            <div class="ai-info-label">
                                استراتژی
                            </div>

                            <div class="ai-info-value">
                                ${escapeHTML(
                                    state.bot.strategy ||
                                    "AI Scalping"
                                )}
                            </div>

                        </div>


                        <div class="ai-info-box">

                            <div class="ai-info-label">
                                دقت
                            </div>

                            <div class="ai-info-value">
                                ${number(
                                    state.bot.accuracy
                                ).toFixed(2)}%
                            </div>

                        </div>

                    </div>


                    <button
                        class="ai-start"
                        id="startBotButton"
                        type="button"
                    >

                        ${
                            botActive
                                ? "هوش مصنوعی فعال است"
                                : "شروع معامله با هوش مصنوعی"
                        }

                    </button>

                </div>

            </section>


            <section class="section">

                <div class="section-title">

                    <h2>
                        دسترسی سریع
                    </h2>

                </div>


                <div class="quick-grid">

                    <button
                        class="glass quick-card"
                        data-page="wallet"
                        type="button"
                    >

                        <div class="quick-icon">
                            ◈
                        </div>

                        <div class="quick-title">
                            کیف پول
                        </div>

                        <div class="quick-description">
                            موجودی و برداشت
                        </div>

                    </button>


                    <button
                        class="glass quick-card"
                        data-page="trades"
                        type="button"
                    >

                        <div class="quick-icon">
                            ↕
                        </div>

                        <div class="quick-title">
                            معاملات
                        </div>

                        <div class="quick-description">
                            مشاهده معاملات
                        </div>

                    </button>


                    <button
                        class="glass quick-card"
                        data-page="stats"
                        type="button"
                    >

                        <div class="quick-icon">
                            ◔
                        </div>

                        <div class="quick-title">
                            آمار
                        </div>

                        <div class="quick-description">
                            عملکرد حساب
                        </div>

                    </button>


                    <button
                        class="glass quick-card"
                        data-page="profile"
                        type="button"
                    >

                        <div class="quick-icon">
                            ◉
                        </div>

                        <div class="quick-title">
                            پشتیبانی
                        </div>

                        <div class="quick-description">
                            ارتباط با پشتیبانی
                        </div>

                    </button>

                </div>

            </section>


            <section class="section">

                <div class="section-title">

                    <h2>
                        آخرین معاملات
                    </h2>

                    <button
                        class="section-link"
                        id="viewTradesButton"
                        type="button"
                    >
                        مشاهده همه
                    </button>

                </div>


                ${
                    state.trades.length
                        ? renderRecentTrades()
                        : `
                            <div class="glass empty-card">

                                <div class="empty-icon">
                                    📊
                                </div>

                                <div class="empty-title">
                                    هنوز معامله‌ای وجود ندارد
                                </div>

                                <div class="empty-text">
                                    بعد از شروع فعالیت معاملات اینجا نمایش داده می‌شوند.
                                </div>

                            </div>
                        `
                }

            </section>


            ${renderBottomNav()}

        </div>

    `;

}


// =====================================
// ..M RECENT TRADES
// =====================================

function renderRecentTrades() {

    const items =
        state.trades.slice(
            0,
            3
        );


    return `

        <div class="glass empty-card">

            ${items.map(
                function (trade) {

                    return `

                        <div
                            style="
                                display:flex;
                                justify-content:space-between;
                                padding:10px 0;
                                border-bottom:1px solid rgba(255,255,255,.06);
                            "
                        >

                            <span>
                                ${escapeHTML(
                                    trade.symbol ||
                                    "Trade"
                                )}
                            </span>

                            <span>
                                ${formatUSD(
                                    trade.profit || 0
                                )}
                            </span>

                        </div>

                    `;

                }
            ).join("")}

        </div>

    `;

}


// =====================================
// ..M WALLET
// =====================================

function renderWallet() {

    const balance =
        number(
            state.wallet.balance
        );

    const withdrawable =
        number(
            state.wallet.withdrawable
        );


    return `

        <div class="page">

            <div class="page-header">

                <h1>
                    کیف پول
                </h1>

            </div>


            <div class="glass balance-card">

                <div class="balance-top">

                    <span class="balance-label">
                        موجودی کل
                    </span>

                    <span class="currency-badge">
                        USDT
                    </span>

                </div>


                <div class="balance-value">
                    ${formatUSD(balance)}
                </div>


                <div class="balance-toman">
                    ${formatToman(
                        usdToToman(balance)
                    )}
                </div>


                <div class="balance-actions">

                    <button
                        class="action-button action-secondary"
                        id="depositButton"
                        type="button"
                    >
                        واریز
                    </button>

                    <button
                        class="action-button action-primary"
                        id="withdrawButton"
                        type="button"
                    >
                        برداشت تومان
                    </button>

                </div>

            </div>


            <section class="section">

                <div class="section-title">

                    <h2>
                        خلاصه کیف پول
                    </h2>

                </div>


                <div class="stats-grid">

                    <div class="glass stat-card">

                        <div class="stat-label">
                            موجودی قابل برداشت
                        </div>

                        <div class="stat-value">
                            ${formatUSD(
                                withdrawable
                            )}
                        </div>

                        <div class="stat-small">
                            ${formatToman(
                                usdToToman(
                                    withdrawable
                                )
                            )}
                        </div>

                    </div>


                    <div class="glass stat-card">

                        <div class="stat-label">
                            سود کل
                        </div>

                        <div class="stat-value">
                            ${formatUSD(
                                state.wallet.totalProfit
                            )}
                        </div>

                        <div class="stat-small">
                            ${formatToman(
                                usdToToman(
                                    state.wallet.totalProfit
                                )
                            )}
                        </div>

                    </div>

                </div>

            </section>


            <section class="section">

                <div class="section-title">

                    <h2>
                        عملیات کیف پول
                    </h2>

                </div>


                <div class="quick-grid">

                    <button
                        class="glass quick-card"
                        id="depositButton2"
                        type="button"
                    >

                        <div class="quick-icon">
                            ↓
                        </div>

                        <div class="quick-title">
                            واریز
                        </div>

                        <div class="quick-description">
                            افزایش موجودی
                        </div>

                    </button>


                    <button
                        class="glass quick-card"
                        id="withdrawButton2"
                        type="button"
                    >

                        <div class="quick-icon">
                            ↑
                        </div>

                        <div class="quick-title">
                            برداشت تومان
                        </div>

                        <div class="quick-description">
                            دریافت وجه
                        </div>

                    </button>

                </div>

            </section>


            ${renderBottomNav()}

        </div>

    `;

}


// =====================================
// ..M TRADES
// =====================================

function renderTrades() {

    return `

        <div class="page">

            <div class="page-header">

                <h1>
                    معاملات
                </h1>

            </div>


            ${
                state.trades.length
                    ? `
                        <div class="section">

                            ${state.trades.map(
                                function (trade) {

                                    const profit =
                                        number(
                                            trade.profit
                                        );

                                    return `

                                        <div
                                            class="glass"
                                            style="
                                                padding:16px;
                                                border-radius:20px;
                                                margin-bottom:10px;
                                            "
                                        >

                                            <div
                                                style="
                                                    display:flex;
                                                    justify-content:space-between;
                                                "
                                            >

                                                <strong>
                                                    ${escapeHTML(
                                                        trade.symbol ||
                                                        "Unknown"
                                                    )}
                                                </strong>

                                                <span>
                                                    ${
                                                        String(
                                                            trade.type ||
                                                            ""
                                                        ).toUpperCase()
                                                    }
                                                </span>

                                            </div>


                                            <div
                                                style="
                                                    margin-top:12px;
                                                    color:#89a0b7;
                                                    font-size:11px;
                                                "
                                            >

                                                وضعیت:
                                                ${escapeHTML(
                                                    trade.status ||
                                                    "UNKNOWN"
                                                )}

                                            </div>


                                            <div
                                                style="
                                                    margin-top:7px;
                                                    color:#73ceff;
                                                    font-weight:900;
                                                "
                                            >

                                                سود:
                                                ${formatUSD(
                                                    profit
                                                )}

                                            </div>

                                        </div>

                                    `;

                                }
                            ).join("")}

                        </div>
                    `
                    : `
                        <div class="glass empty-card">

                            <div class="empty-icon">
                                ↕
                            </div>

                            <div class="empty-title">
                                معامله‌ای وجود ندارد
                            </div>

                            <div class="empty-text">
                                معاملات شما بعد از شروع فعالیت اینجا نمایش داده می‌شوند.
                            </div>

                        </div>
                    `
            }


            ${renderBottomNav()}

        </div>

    `;

}


// =====================================
// ..M STATS
// =====================================

function renderStats() {

    const trades =
        state.trades;


    const closed =
        trades.filter(
            t =>
                String(
                    t.status ||
                    ""
                ).toUpperCase() ===
                "CLOSED"
        );


    const wins =
        closed.filter(
            t =>
                number(
                    t.profit
                ) > 0
        );


    const winRate =
        closed.length
            ? (
                wins.length /
                closed.length *
                100
            )
            : 0;


    return `

        <div class="page">

            <div class="page-header">

                <h1>
                    آمار عملکرد
                </h1>

            </div>


            <div class="stats-grid">

                <div class="glass stat-card">

                    <div class="stat-label">
                        سود کل
                    </div>

                    <div class="stat-value">
                        ${formatUSD(
                            state.wallet.totalProfit
                        )}
                    </div>

                </div>


                <div class="glass stat-card">

                    <div class="stat-label">
                        نرخ موفقیت
                    </div>

                    <div class="stat-value">
                        ${winRate.toFixed(2)}%
                    </div>

                </div>


                <div class="glass stat-card">

                    <div class="stat-label">
                        کل معاملات
                    </div>

                    <div class="stat-value">
                        ${trades.length.toLocaleString(
                            "fa-IR"
                        )}
                    </div>

                </div>


                <div class="glass stat-card">

                    <div class="stat-label">
                        معاملات موفق
                    </div>

                    <div class="stat-value">
                        ${wins.length.toLocaleString(
                            "fa-IR"
                        )}
                    </div>

                </div>

            </div>


            <section class="section">

                <div class="glass ai-card">

                    <div class="ai-header">

                        <div class="ai-title">

                            <div class="ai-icon">
                                🤖
                            </div>

                            <div>

                                <div class="ai-name">
                                    وضعیت هوش مصنوعی
                                </div>

                                <div class="ai-description">
                                    ${escapeHTML(
                                        state.bot.strategy
                                    )}
                                </div>

                            </div>

                        </div>


                        <span class="status ${
                            String(
                                state.bot.status
                            ).toUpperCase() ===
                            "ACTIVE"
                                ? "status-active"
                                : "status-stopped"
                        }">

                            ${
                                String(
                                    state.bot.status
                                ).toUpperCase() ===
                                "ACTIVE"
                                    ? "فعال"
                                    : "متوقف"
                            }

                        </span>

                    </div>

                </div>

            </section>


            ${renderBottomNav()}

        </div>

    `;

}


// =====================================
// ..M PROFILE
// فقط پشتیبانی
// =====================================

function renderProfile() {

    const name =
        state.user?.firstName ||
        "کاربر";

    const username =
        state.user?.username
            ? "@" +
              String(
                  state.user.username
              ).replace(
                  "@",
                  ""
              )
            : "کاربر تلگرام";


    return `

        <div class="page">

            <div class="page-header">

                <h1>
                    پروفایل
                </h1>

            </div>


            <div class="glass profile-card">

                <div class="profile-avatar">
                    ${escapeHTML(
                        String(name)
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>


                <div class="profile-name">
                    ${escapeHTML(name)}
                </div>


                <div class="profile-username">
                    ${escapeHTML(username)}
                </div>


                <div class="glass support-box">

                    <div class="support-title">
                        پشتیبانی AutoTrade AI
                    </div>

                    <div class="support-id">
                        ${SUPPORT_USERNAME}
                    </div>


                    <button
                        class="support-button"
                        id="supportButton"
                        type="button"
                    >
                        ارتباط با پشتیبانی
                    </button>

                </div>

            </div>


            ${renderBottomNav()}

        </div>

    `;

}


// =====================================
// ..M WITHDRAW PAGE
// برداشت کاملاً تومان محور
// =====================================

function renderWithdraw() {

    const available =
        number(
            state.wallet.withdrawable
        );


    return `

        <div class="page">

            <div class="page-header">

                <button
                    class="page-back"
                    id="backWalletButton"
                    type="button"
                >
                    ←
                </button>

                <h1>
                    برداشت تومان
                </h1>

            </div>


            <div class="glass balance-card">

                <div class="balance-top">

                    <span class="balance-label">
                        موجودی قابل برداشت
                    </span>

                    <span class="currency-badge">
                        USDT
                    </span>

                </div>


                <div class="balance-value">
                    ${formatUSD(
                        available
                    )}
                </div>


                <div class="balance-toman">
                    ${formatToman(
                        usdToToman(
                            available
                        )
                    )}
                </div>

            </div>


            <div class="glass form-card">

                <div class="form-group">

                    <label class="form-label">
                        مبلغ برداشت به دلار
                    </label>

                    <input
                        id="withdrawAmount"
                        class="form-input"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="مثلاً 10"
                    >

                </div>


                <div
                    id="withdrawTomanPreview"
                    class="toman-box"
                >

                    <div class="toman-label">
                        مبلغ قابل دریافت به تومان
                    </div>

                    <div
                        id="withdrawTomanValue"
                        class="toman-value"
                    >
                        ۰ تومان
                    </div>

                </div>


                <div class="form-group">

                    <label class="form-label">
                        شماره حساب یا شبا
                    </label>

                    <input
                        id="bankAccount"
                        class="form-input"
                        type="text"
                        inputmode="numeric"
                        placeholder="شماره شبا یا حساب"
                    >

                </div>


                <div class="form-group">

                    <label class="form-label">
                        نام صاحب حساب
                    </label>

                    <input
                        id="accountHolderName"
                        class="form-input"
                        type="text"
                        placeholder="نام و نام خانوادگی"
                    >

                </div>


                <button
                    id="withdrawSubmit"
                    class="submit-button"
                    type="button"
                >
                    ثبت درخواست برداشت
                </button>

            </div>


        </div>

    `;

}


// =====================================
// ..M DEPOSIT
// =====================================

function showDeposit() {

    showToast(
        "بخش واریز از طریق سرویس واریز فعال می‌شود"
    );

}


// =====================================
// ..M START BOT
// =====================================

async function startBot() {

    const userId =
        getUserId();


    if (!userId) {

        showToast(
            "شناسه کاربر در دسترس نیست"
        );

        return;

    }


    try {

        await api(

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


        showToast(
            "هوش مصنوعی فعال شد"
        );


        await loadBot();

        render();

    }

    catch (error) {

        showToast(
            error.message
        );

    }

}


// =====================================
// ..M OPEN SUPPORT
// =====================================

function openSupport() {

    const username =
        SUPPORT_USERNAME
            .replace(
                "@",
                ""
            );


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
// ..M SUBMIT WITHDRAW
// =====================================

async function submitWithdraw() {

    const amountInput =
        document.getElementById(
            "withdrawAmount"
        );

    const bankInput =
        document.getElementById(
            "bankAccount"
        );

    const holderInput =
        document.getElementById(
            "accountHolderName"
        );


    const amountUSD =
        number(
            amountInput?.value
        );


    if (
        amountUSD <= 0
    ) {

        showToast(
            "مبلغ برداشت را وارد کنید"
        );

        return;

    }


    if (
        amountUSD >
        number(
            state.wallet.withdrawable
        )
    ) {

        showToast(
            "مبلغ بیشتر از موجودی قابل برداشت است"
        );

        return;

    }


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
        !bankAccount
    ) {

        showToast(
            "شماره حساب یا شبا را وارد کنید"
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


    const userId =
        getUserId();


    if (!userId) {

        showToast(
            "شناسه کاربر موجود نیست"
        );

        return;

    }


    try {

        const result =
            await api(
                "/api/withdraw",
                {

                    method:
                        "POST",

                    body:
                        JSON.stringify({

                            userId,

                            amountUSD,

                            withdrawAll:
                                false,

                            method:
                                "BANK",

                            bankAccount,

                            accountHolderName

                        })

                }
            );


        const toman =
            number(
                result?.amountToman
            );


        showToast(

            toman > 0

                ? "درخواست برداشت با موفقیت ثبت شد"

                : "درخواست برداشت ثبت شد"

        );


        await loadWallet();

        goTo(
            "wallet"
        );

    }

    catch (error) {

        showToast(
            error.message
        );

    }

}


// =====================================
// ..M WITHDRAW PREVIEW
// =====================================

function updateWithdrawPreview() {

    const input =
        document.getElementById(
            "withdrawAmount"
        );

    const output =
        document.getElementById(
            "withdrawTomanValue"
        );


    if (
        !input ||
        !output
    ) {

        return;

    }


    const usd =
        number(
            input.value
        );


    output.textContent =
        formatToman(
            usdToToman(
                usd
            )
        );

}


// =====================================
// ..M EVENTS
// =====================================

function bindEvents() {

    const app =
        getApp();


    if (!app) {

        return;

    }


    // -------------------------------------
    // Bottom navigation
    // -------------------------------------

    app
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(

            function (element) {

                element.addEventListener(
                    "click",
                    function () {

                        goTo(
                            element.dataset.page
                        );

                    }
                );

            }

        );


    // -------------------------------------
    // Refresh
    // -------------------------------------

    const refresh =
        document.getElementById(
            "refreshButton"
        );


    if (refresh) {

        refresh.onclick =
            async function () {

                refresh.disabled =
                    true;

                await loadData();

                refresh.disabled =
                    false;

                render();

                showToast(
                    "اطلاعات به‌روزرسانی شد"
                );

            };

    }


    // -------------------------------------
    // Deposit
    // -------------------------------------

    app
        .querySelectorAll(
            "#depositButton, #depositButton2"
        )
        .forEach(
            function (button) {

                button.onclick =
                    showDeposit;

            }
        );


    // -------------------------------------
    // Withdraw
    // -------------------------------------

    app
        .querySelectorAll(
            "#withdrawButton, #withdrawButton2"
        )
        .forEach(
            function (button) {

                button.onclick =
                    function () {

                        state.currentPage =
                            "withdraw";

                        render();

                    };

            }
        );


    // -------------------------------------
    // View trades
    // -------------------------------------

    const viewTrades =
        document.getElementById(
            "viewTradesButton"
        );


    if (viewTrades) {

        viewTrades.onclick =
            function () {

                goTo(
                    "trades"
                );

            };

    }


    // -------------------------------------
    // Start bot
    // -------------------------------------

    const startBotButton =
        document.getElementById(
            "startBotButton"
        );


    if (startBotButton) {

        startBotButton.onclick =
            startBot;

    }


    // -------------------------------------
    // Support
    // -------------------------------------

    const supportButton =
        document.getElementById(
            "supportButton"
        );


    if (supportButton) {

        supportButton.onclick =
            openSupport;

    }


    // -------------------------------------
    // Back wallet
    // -------------------------------------

    const backWallet =
        document.getElementById(
            "backWalletButton"
        );


    if (backWallet) {

        backWallet.onclick =
            function () {

                goTo(
                    "wallet"
                );

            };

    }


    // -------------------------------------
    // Withdraw amount
    // -------------------------------------

    const withdrawAmount =
        document.getElementById(
            "withdrawAmount"
        );


    if (withdrawAmount) {

        withdrawAmount.addEventListener(
            "input",
            updateWithdrawPreview
        );

    }


    // -------------------------------------
    // Withdraw submit
    // -------------------------------------

    const withdrawSubmit =
        document.getElementById(
            "withdrawSubmit"
        );


    if (withdrawSubmit) {

        withdrawSubmit.onclick =
            submitWithdraw;

    }

}


// =====================================
// ..M RENDER
// =====================================

function render() {

    const app =
        getApp();


    if (!app) {

        return;

    }


    let content = "";


    switch (
        state.currentPage
    ) {

        case "wallet":

            content =
                renderWallet();

            break;


        case "trades":

            content =
                renderTrades();

            break;


        case "stats":

            content =
                renderStats();

            break;


        case "profile":

            content =
                renderProfile();

            break;


        case "withdraw":

            content =
                renderWithdraw();

            break;


        case "dashboard":

        default:

            content =
                renderDashboard();

            break;

    }


    app.innerHTML =
        content;


    bindEvents();

}


// =====================================
// ..M HIDE LOADING
// =====================================

function hideLoadingScreen() {

    const loading =
        document.getElementById(
            "loading-screen"
        );


    if (!loading) {

        return;

    }


    loading.classList.add(
        "hidden"
    );


    setTimeout(
        function () {

            loading.style.display =
                "none";

        },
        400
    );

}


// =====================================
// ..M INITIALIZE
// =====================================

async function initializeApp() {

    try {

        await authenticateTelegram();

        await loadData();

        render();

    }

    catch (error) {

        console.error(
            "Initialize:",
            error
        );

        render();

    }

    finally {

        hideLoadingScreen();

    }

}


// =====================================
// ..M START
// =====================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeApp();

    }
);