// =====================================
// AutoTrade AI Mini App:: M
// File: app.js
// نسخه تکمیلی
// اعداد صفر، بدون خط فاصله، دکمه‌های فعال
// پشتیبانی: @mehdi2510l
// =====================================


const BACKEND_URL =
    "https://autotrade-backend-02cc.onrender.com";


const SUPPORT_USERNAME =
    "@mehdi2510l";


const tg =
    window.Telegram?.WebApp;


if (tg) {

    tg.ready();

    tg.expand();

    try {

        tg.setHeaderColor(
            "#050816"
        );

        tg.setBackgroundColor(
            "#050816"
        );

    }

    catch (_) {}

}


// =====================================
// STATE
// =====================================

const state = {

    page:
        "dashboard",

    user:
        null,

    backendUser:
        null,

    wallet: {

        balance:
            0,

        totalProfit:
            0,

        totalTrades:
            0,

        withdrawable:
            0,

        currency:
            "USDT"

    },

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

    exchangeRate:
        0

};


// =====================================
// HELPERS
// =====================================

function $(id) {

    return document.getElementById(id);

}


function money(
    value,
    digits = 2
) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return (
            0
        ).toFixed(
            digits
        );

    }


    return number.toLocaleString(
        "en-US",
        {
            minimumFractionDigits:
                digits,

            maximumFractionDigits:
                digits
        }
    );

}


function percent(value) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "0.00%";

    }


    return (
        number.toFixed(2)
        +
        "%"
    );

}


function toman(value) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return "0 تومان";

    }


    return (
        number.toLocaleString(
            "fa-IR"
        )
        +
        " تومان"
    );

}


function esc(value) {

    return String(
        value ?? ""
    ).replace(
        /[&<>"']/g,
        character => ({

            "&":
                "&amp;",

            "<":
                "&lt;",

            ">":
                "&gt;",

            '"':
                "&quot;",

            "'":
                "&#039;"

        }[character])
    );

}


function apiUrl(path) {

    return (
        BACKEND_URL
        +
        path
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


    const initData =
        tg?.initData || "";


    if (initData) {

        headers[
            "X-Telegram-Init-Data"
        ] =
            initData;

    }


    const response =
        await fetch(
            apiUrl(path),
            {
                ...options,

                headers: {

                    ...headers,

                    ...(options.headers || {})

                }

            }
        );


    let data =
        {};


    try {

        data =
            await response.json();

    }

    catch (_) {}


    if (!response.ok) {

        throw new Error(

            data.message
            ||
            "ارتباط با سرور ناموفق بود"

        );

    }


    return data;

}


// =====================================
// TOAST
// =====================================

function toast(message) {

    const element =
        $("toast");


    element.textContent =
        message;


    element.classList.add(
        "show"
    );


    setTimeout(
        () => {

            element.classList.remove(
                "show"
            );

        },
        2600
    );

}


// =====================================
// TELEGRAM USER
// =====================================

function telegramUser() {

    const user =
        tg?.initDataUnsafe?.user;


    if (!user) {

        return {

            telegramId:
                "",

            username:
                "",

            firstName:
                "کاربر",

            lastName:
                ""

        };

    }


    return {

        telegramId:
            String(user.id),

        username:
            user.username || "",

        firstName:
            user.first_name || "کاربر",

        lastName:
            user.last_name || ""

    };

}


// =====================================
// AUTH
// =====================================

async function authenticate() {

    state.user =
        telegramUser();


    if (
        !state.user.telegramId
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


        state.backendUser =
            data.user
            ||
            data;

    }

    catch (error) {

        console.warn(
            "Telegram Auth:",
            error.message
        );

    }

}


// =====================================
// EXCHANGE RATE
// =====================================

async function loadExchangeRate() {

    try {

        const data =
            await api(
                "/api/currency/exchange-rate"
            );


        state.exchangeRate =

            Number(
                data.rate
                ??
                data.exchangeRate
                ??
                data.usdToToman
                ??
                data.usdToIrr
                ??
                0
            )
            ||
            0;

    }

    catch (_) {

        state.exchangeRate =
            0;

    }

}


// =====================================
// WALLET
// =====================================

async function loadWallet() {

    const userId =

        state.backendUser?._id
        ||
        state.backendUser?.id;


    if (!userId) {

        return;

    }


    try {

        const data =
            await api(
                "/api/wallet/"
                +
                encodeURIComponent(
                    userId
                )
            );


        const wallet =
            data.wallet
            ||
            data;


        state.wallet = {

            balance:
                Number(
                    wallet.balance
                    ??
                    0
                )
                ||
                0,

            totalProfit:
                Number(
                    wallet.totalProfit
                    ??
                    0
                )
                ||
                0,

            totalTrades:
                Number(
                    wallet.totalTrades
                    ??
                    0
                )
                ||
                0,

            withdrawable:
                Number(
                    wallet.withdrawable
                    ??
                    wallet.balance
                    ??
                    0
                )
                ||
                0,

            currency:
                wallet.currency
                ||
                "USDT"

        };

    }

    catch (_) {

        state.wallet = {

            balance:
                0,

            totalProfit:
                0,

            totalTrades:
                0,

            withdrawable:
                0,

            currency:
                "USDT"

        };

    }

}


// =====================================
// BOT
// =====================================

async function loadBot() {

    const userId =

        state.backendUser?._id
        ||
        state.backendUser?.id;


    if (!userId) {

        return;

    }


    try {

        const data =
            await api(
                "/api/bot/"
                +
                encodeURIComponent(
                    userId
                )
            );


        const bot =
            data.bot
            ||
            data;


        state.bot = {

            status:
                bot.status
                ||
                "STOPPED",

            strategy:
                bot.strategy
                ||
                "AI Scalping",

            accuracy:
                Number(
                    bot.accuracy
                    ??
                    0
                )
                ||
                0,

            confidence:
                Number(
                    bot.confidence
                    ??
                    0
                )
                ||
                0,

            lastSignal:
                bot.lastSignal
                ||
                "WAIT"

        };

    }

    catch (_) {}

}


// =====================================
// TRADES
// =====================================

async function loadTrades() {

    const userId =

        state.backendUser?._id
        ||
        state.backendUser?.id;


    if (!userId) {

        return;

    }


    try {

        const data =
            await api(
                "/api/trades/"
                +
                encodeURIComponent(
                    userId
                )
            );


        state.trades =

            Array.isArray(data)
            ?
            data
            :
            (
                data.trades
                ||
                []
            );

    }

    catch (_) {

        state.trades =
            [];

    }

}


// =====================================
// DEPOSITS
// =====================================

async function loadDeposits() {

    const userId =

        state.backendUser?._id
        ||
        state.backendUser?.id;


    if (!userId) {

        return;

    }


    try {

        const data =
            await api(
                "/api/deposit/user/"
                +
                encodeURIComponent(
                    userId
                )
            );


        state.deposits =
            data.deposits
            ||
            [];

    }

    catch (_) {

        state.deposits =
            [];

    }

}


// =====================================
// NAVIGATION
// =====================================

function nav(page) {

    state.page =
        page;


    document
        .querySelectorAll(
            ".page"
        )
        .forEach(
            element =>
                element.classList.remove(
                    "active"
                )
        );


    const pageElement =
        $("page-" + page);


    if (pageElement) {

        pageElement.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(
            ".bottom-nav button"
        )
        .forEach(
            button => {

                button.classList.toggle(

                    "active",

                    button.dataset.nav
                    ===
                    page

                );

            }
        );


    $("bottom-nav").style.display =

        (
            page === "deposit"
            ||
            page === "withdraw"
        )

        ?

        "none"

        :

        "grid";


    renderPage(
        page
    );


    window.scrollTo(
        {
            top:
                0,

            behavior:
                "smooth"
        }
    );

}


// =====================================
// HEADER
// =====================================

function header(
    title,
    subtitle = ""
) {

    return `

        <div class="header">

            <div>

                <h1>
                    ${esc(title)}
                </h1>

                ${
                    subtitle
                    ?
                    `
                    <p>
                        ${esc(subtitle)}
                    </p>
                    `
                    :
                    ""
                }

            </div>


            <button
                class="icon-btn"
                data-action="refresh"
            >
                ↻
            </button>

        </div>

    `;

}


// =====================================
// DASHBOARD
// =====================================

function dashboard() {

    const wallet =
        state.wallet;


    const bot =
        state.bot;


    const botActive =
        bot.status
        ===
        "ACTIVE";


    return `

        ${header(
            "AutoTrade AI",
            "مدیریت هوشمند سرمایه و معاملات"
        )}


        <div class="card balance-card">

            <div class="balance-top">

                <span class="label">
                    موجودی کل
                </span>

                <span class="badge">
                    USDT
                </span>

            </div>


            <div class="balance">

                $${money(
                    wallet.balance
                )}

            </div>


            <div class="sub-balance">

                ${
                    state.exchangeRate > 0

                    ?

                    toman(
                        wallet.balance
                        *
                        state.exchangeRate
                    )

                    :

                    "0 تومان"

                }

            </div>


            <div class="actions">

                <button
                    class="btn primary"
                    data-action="deposit"
                >
                    واریز
                </button>


                <button
                    class="btn"
                    data-action="withdraw"
                >
                    برداشت
                </button>

            </div>

        </div>


        <div class="grid">

            <div class="stat">

                <span class="label">
                    سود امروز
                </span>

                <div class="value">
                    $${money(0)}
                </div>

                <div class="change">
                    0.00%
                </div>

            </div>


            <div class="stat">

                <span class="label">
                    سود کل
                </span>

                <div class="value">
                    $${money(
                        wallet.totalProfit
                    )}
                </div>

                <div class="change">
                    0.00%
                </div>

            </div>


            <div class="stat">

                <span class="label">
                    نرخ موفقیت
                </span>

                <div class="value">
                    0.00%
                </div>

                <div class="change">
                    معاملات ثبت‌شده
                </div>

            </div>


            <div class="stat">

                <span class="label">
                    تعداد معاملات
                </span>

                <div class="value">
                    ${money(
                        wallet.totalTrades,
                        0
                    )}
                </div>

                <div class="change">
                    معاملات ثبت‌شده
                </div>

            </div>

        </div>


        <div class="section-title">

            <h2>
                ربات معامله‌گر هوش مصنوعی
            </h2>

            <span
                class="status ${
                    botActive
                    ?
                    "on"
                    :
                    "stop"
                }"
            >

                ${
                    botActive
                    ?
                    "فعال"
                    :
                    "متوقف"
                }

            </span>

        </div>


        <div class="card">

            <div class="info-row row">

                <span class="label">
                    استراتژی
                </span>

                <b>
                    ${esc(
                        bot.strategy
                    )}
                </b>

            </div>


            <div class="info-row row">

                <span class="label">
                    دقت تحلیل
                </span>

                <b>
                    ${percent(
                        bot.accuracy
                    )}
                </b>

            </div>


            <div class="progress">

                <i
                    style="
                        width:
                        ${
                            Math.max(
                                0,
                                Math.min(
                                    100,
                                    bot.accuracy
                                )
                            )
                        }%
                    "
                ></i>

            </div>


            <div class="info-row row">

                <span class="label">
                    آخرین سیگنال
                </span>

                <b>

                    ${
                        bot.lastSignal
                        ===
                        "BUY"

                        ?

                        "خرید"

                        :

                        bot.lastSignal
                        ===
                        "SELL"

                        ?

                        "فروش"

                        :

                        "انتظار"

                    }

                </b>

            </div>


            <button
                class="btn ${
                    botActive
                    ?
                    "danger"
                    :
                    "primary"
                }"
                style="width:100%;margin-top:12px"
                data-action="toggleBot"
            >

                ${
                    botActive

                    ?

                    "توقف معامله‌گری هوش مصنوعی"

                    :

                    "شروع معامله‌گری هوش مصنوعی"

                }

            </button>

        </div>


        <div class="section-title">

            <h2>
                آخرین معاملات
            </h2>

            <button
                class="link"
                data-action="trades"
            >
                مشاهده همه
            </button>

        </div>


        <div class="card">

            ${tradeList(3)}

        </div>

    `;

}


// =====================================
// WALLET
// =====================================

function wallet() {

    const w =
        state.wallet;


    return `

        ${header(
            "کیف پول",
            "موجودی و تراکنش‌های حساب"
        )}


        <div class="card balance-card">

            <div class="balance-top">

                <span class="label">
                    موجودی کل
                </span>

                <span class="badge">
                    USDT
                </span>

            </div>


            <div class="balance">
                $${money(w.balance)}
            </div>


            <div class="sub-balance">

                موجودی قابل استفاده:
                $${money(
                    w.withdrawable
                )}

            </div>

        </div>


        <div class="actions">

            <button
                class="btn primary"
                data-action="deposit"
            >
                واریز
            </button>


            <button
                class="btn"
                data-action="withdraw"
            >
                برداشت
            </button>

        </div>


        <div class="section-title">

            <h2>
                خلاصه کیف پول
            </h2>

        </div>


        <div class="card">

            <div class="info-row row">

                <span class="label">
                    موجودی معاملاتی
                </span>

                <b>
                    $${money(
                        w.balance
                    )}
                </b>

            </div>


            <div class="info-row row">

                <span class="label">
                    موجودی پاداش
                </span>

                <b>
                    $0.00
                </b>

            </div>


            <div class="info-row row">

                <span class="label">
                    ارزش کل
                </span>

                <b>
                    $${money(
                        w.balance
                    )}
                </b>

            </div>


            <div class="info-row row">

                <span class="label">
                    سود کل
                </span>

                <b>
                    $${money(
                        w.totalProfit
                    )}
                </b>

            </div>

        </div>


        <div class="section-title">

            <h2>
                آخرین واریزها
            </h2>

        </div>


        <div class="card">

            ${depositList()}

        </div>

    `;

}


// =====================================
// DEPOSIT LIST
// =====================================

function depositList() {

    if (
        !state.deposits.length
    ) {

        return `

            <div class="empty">

                <strong>
                    هنوز واریزی ثبت نشده است
                </strong>

                <span>
                    مبلغ واریز فعلی شما:
                    0 تومان
                </span>

            </div>

        `;

    }


    return state.deposits
        .slice(0, 6)
        .map(
            deposit => `

                <div class="info-row row">

                    <span>

                        ${toman(
                            deposit.amountToman
                            ??
                            0
                        )}

                    </span>


                    <b>

                        ${
                            deposit.status
                            ===
                            "CONFIRMED"

                            ?

                            "تأیید شده"

                            :

                            deposit.status
                            ===
                            "FAILED"

                            ?

                            "ناموفق"

                            :

                            "در انتظار"

                        }

                    </b>

                </div>

            `
        )
        .join("");

}


// =====================================
// TRADE LIST
// =====================================

function tradeList(
    limit = 50
) {

    if (
        !state.trades.length
    ) {

        return `

            <div class="empty">

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
            trade => `

                <div class="trade">

                    <div class="row">

                        <b
                            class="${
                                trade.type
                                ===
                                "BUY"
                                ?
                                "buy"
                                :
                                "sell"
                            }"
                        >

                            ${
                                trade.type
                                ===
                                "BUY"
                                ?
                                "خرید"
                                :
                                "فروش"
                            }

                            ${esc(
                                trade.symbol
                                ||
                                ""
                            )}

                        </b>


                        <span>

                            ${
                                trade.status
                                ===
                                "OPEN"
                                ?
                                "باز"
                                :
                                "بسته"
                            }

                        </span>

                    </div>


                    <div
                        class="row"
                        style="margin-top:8px"
                    >

                        <span class="label">

                            قیمت ورود:
                            $${money(
                                trade.entryPrice
                            )}

                        </span>


                        <span class="label">

                            سود:
                            $${money(
                                trade.profit
                            )}

                        </span>

                    </div>

                </div>

            `
        )
        .join("");

}


// =====================================
// TRADES PAGE
// =====================================

function trades() {

    return `

        ${header(
            "معاملات",
            "فهرست معاملات ثبت‌شده"
        )}


        <div class="card">

            ${tradeList()}

        </div>

    `;

}


// =====================================
// ANALYTICS
// =====================================

function analytics() {

    const w =
        state.wallet;


    return `

        ${header(
            "آمار",
            "نمایش ساده و قابل فهم عملکرد"
        )}


        <div class="grid">

            <div class="stat">

                <span class="label">
                    سرمایه فعلی
                </span>

                <div class="value">
                    $${money(
                        w.balance
                    )}
                </div>

            </div>


            <div class="stat">

                <span class="label">
                    سود کل
                </span>

                <div class="value">
                    $${money(
                        w.totalProfit
                    )}
                </div>

            </div>


            <div class="stat">

                <span class="label">
                    تعداد معاملات
                </span>

                <div class="value">
                    ${money(
                        w.totalTrades,
                        0
                    )}
                </div>

            </div>


            <div class="stat">

                <span class="label">
                    نرخ موفقیت
                </span>

                <div class="value">
                    0.00%
                </div>

            </div>

        </div>


        <div class="section-title">

            <h2>
                سرمایه معاملاتی
            </h2>

        </div>


        <div class="card">

            <p class="note">

                ربات حجم معامله را بر اساس
                موجودی فعلی حساب محاسبه می‌کند.

                سرمایه فعلی:

                $${money(
                    w.balance
                )}

            </p>

        </div>

    `;

}


// =====================================
// PROFILE
// =====================================

function profile() {

    const user =
        state.user
        ||
        telegramUser();


    const name =

        [
            user.firstName,
            user.lastName
        ]
        .filter(Boolean)
        .join(" ")
        ||
        "کاربر";


    return `

        ${header(
            "پروفایل",
            "اطلاعات حساب کاربری"
        )}


        <div class="card profile-head">

            <div class="avatar">
                👤
            </div>


            <div>

                <b>
                    ${esc(name)}
                </b>


                <div class="label">

                    ${
                        user.username

                        ?

                        "@"
                        +
                        esc(
                            user.username
                        )

                        :

                        "کاربر تلگرام"

                    }

                </div>

            </div>

        </div>


        <div class="card menu">

            <button
                data-action="support"
            >

                💬
                پشتیبانی

            </button>


            <button
                data-action="refreshAll"
            >

                ↻
                به‌روزرسانی اطلاعات

            </button>


            <button
                data-action="about"
            >

                ℹ️
                درباره AutoTrade AI

            </button>

        </div>


        <div class="card">

            <div class="info-row row">

                <span class="label">
                    شناسه تلگرام
                </span>

                <b>

                    ${
                        user.telegramId
                        ?
                        esc(
                            user.telegramId
                        )
                        :
                        "0"
                    }

                </b>

            </div>


            <div class="info-row row">

                <span class="label">
                    پشتیبانی
                </span>

                <b>
                    ${SUPPORT_USERNAME}
                </b>

            </div>

        </div>

    `;

}


// =====================================
// DEPOSIT PAGE
// =====================================

function depositPage() {

    return `

        ${header(
            "واریز",
            "ایجاد درخواست واریز"
        )}


        <div class="card">

            <div class="form-group">

                <label>
                    مبلغ واریز به تومان
                </label>


                <input
                    id="deposit-amount"
                    class="input"
                    type="number"
                    min="1000"
                    placeholder="0"
                >

            </div>


            <div class="info-row row">

                <span class="label">
                    نرخ دلار
                </span>

                <b>

                    ${
                        state.exchangeRate > 0

                        ?

                        money(
                            state.exchangeRate,
                            0
                        )
                        +
                        " تومان"

                        :

                        "0 تومان"

                    }

                </b>

            </div>


            <div class="info-row row">

                <span class="label">
                    معادل تقریبی
                </span>

                <b id="deposit-usd">
                    $0.00
                </b>

            </div>


            <p class="note">

                پس از ایجاد درخواست،
                پرداخت باید از مسیر رسمی
                درگاه انجام شود.

                شارژ کیف پول فقط بعد از
                تأیید واقعی پرداخت توسط
                سرور انجام می‌شود.

            </p>


            <button
                class="btn primary"
                style="width:100%"
                data-action="createDeposit"
            >

                ایجاد درخواست واریز

            </button>

        </div>

    `;

}


// =====================================
// WITHDRAW PAGE
// =====================================

function withdrawPage() {

    return `

        ${header(
            "برداشت",
            "ثبت درخواست برداشت"
        )}


        <div class="card">

            <div class="row">

                <span class="label">
                    موجودی قابل برداشت
                </span>

                <b>
                    $${money(
                        state.wallet.withdrawable
                    )}
                </b>

            </div>


            <div
                class="form-group"
                style="margin-top:16px"
            >

                <label>
                    مبلغ برداشت USDT
                </label>


                <input
                    id="withdraw-amount"
                    class="input"
                    type="number"
                    min="0"
                    step="0.01"
                    value="0"
                >

            </div>


            <div class="form-group">

                <label>
                    شبکه انتقال
                </label>


                <select
                    id="withdraw-network"
                    class="input"
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

            </div>


            <div class="form-group">

                <label>
                    آدرس کیف پول
                </label>


                <input
                    id="withdraw-address"
                    class="input"
                    type="text"
                    placeholder="آدرس کیف پول"
                >

            </div>


            <div class="info-row row">

                <span class="label">
                    کارمزد شبکه
                </span>

                <b>
                    $0.00
                </b>

            </div>


            <div class="info-row row">

                <span class="label">
                    دریافتی شما
                </span>

                <b id="withdraw-receive">
                    $0.00
                </b>

            </div>


            <p class="note">

                تا زمانی که مسیر برداشت
                در Backend فعال نشده باشد،
                هیچ موجودی از کیف پول کم
                نمی‌شود.

            </p>


            <button
                class="btn primary"
                style="width:100%"
                data-action="withdrawSubmit"
            >

                ثبت درخواست برداشت

            </button>

        </div>

    `;

}


// =====================================
// RENDER
// =====================================

function renderPage(page) {

    const pages = {

        dashboard,

        wallet,

        trades,

        analytics,

        profile,

        deposit:
            depositPage,

        withdraw:
            withdrawPage

    };


    const renderFunction =
        pages[page]
        ||
        dashboard;


    const element =
        $("page-" + page);


    if (!element) {

        return;

    }


    element.innerHTML =
        renderFunction();


    if (
        page ===
        "deposit"
    ) {

        const input =
            $("deposit-amount");


        if (input) {

            input.addEventListener(
                "input",
                () => {

                    const amount =
                        Number(
                            input.value
                        )
                        ||
                        0;


                    const usd =

                        state.exchangeRate > 0

                        ?

                        amount
                        /
                        state.exchangeRate

                        :

                        0;


                    const output =
                        $("deposit-usd");


                    if (output) {

                        output.textContent =
                            "$"
                            +
                            money(usd);

                    }

                }
            );

        }

    }


    if (
        page ===
        "withdraw"
    ) {

        const input =
            $("withdraw-amount");


        if (input) {

            input.addEventListener(
                "input",
                () => {

                    const amount =
                        Number(
                            input.value
                        )
                        ||
                        0;


                    const output =
                        $("withdraw-receive");


                    if (output) {

                        output.textContent =
                            "$"
                            +
                            money(
                                Math.max(
                                    0,
                                    amount
                                )
                            );

                    }

                }
            );

        }

    }

}


// =====================================
// BOT
// =====================================

async function toggleBot() {

    const userId =

        state.backendUser?._id
        ||
        state.backendUser?.id;


    if (!userId) {

        toast(
            "کاربر هنوز احراز هویت نشده است"
        );

        return;

    }


    try {

        if (
            state.bot.status
            ===
            "ACTIVE"
        ) {

            toast(
                "برای توقف امن، مسیر توقف ربات باید در Backend فعال باشد."
            );

            return;

        }


        await api(

            "/api/bot/start/"
            +
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


        renderPage(
            state.page
        );


        toast(
            "ربات هوش مصنوعی فعال شد"
        );

    }

    catch (error) {

        toast(
            error.message
        );

    }

}


// =====================================
// CREATE DEPOSIT
// =====================================

async function createDeposit() {

    const amount =
        Number(
            $("deposit-amount")?.value
        )
        ||
        0;


    const userId =

        state.backendUser?._id
        ||
        state.backendUser?.id;


    if (!userId) {

        toast(
            "کاربر احراز هویت نشده است"
        );

        return;

    }


    if (
        amount <= 0
    ) {

        toast(
            "مبلغ واریز باید بیشتر از صفر باشد"
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

                            userId,

                            amountToman:
                                amount,

                            exchangeRate:
                                state.exchangeRate
                                ||
                                0,

                            method:
                                "GATEWAY",

                            gateway:
                                "ZARINPAL"

                        })

                }
            );


        toast(

            data.message
            ||
            "درخواست واریز ایجاد شد"

        );


        await loadDeposits();


        nav(
            "wallet"
        );

    }

    catch (error) {

        toast(
            error.message
        );

    }

}


// =====================================
// WITHDRAW
// =====================================

async function withdrawSubmit() {

    const userId =

        state.backendUser?._id
        ||
        state.backendUser?.id;


    const amount =
        Number(
            $("withdraw-amount")?.value
        )
        ||
        0;


    const network =
        $("withdraw-network")
        ?.value
        ||
        "";


    const address =
        $("withdraw-address")
        ?.value
        ?.trim()
        ||
        "";


    if (!userId) {

        toast(
            "کاربر احراز هویت نشده است"
        );

        return;

    }


    if (
        amount <= 0
    ) {

        toast(
            "مبلغ برداشت باید بیشتر از صفر باشد"
        );

        return;

    }


    if (
        amount >
        state.wallet.withdrawable
    ) {

        toast(
            "موجودی کافی نیست"
        );

        return;

    }


    if (
        !network
        ||
        !address
    ) {

        toast(
            "شبکه و آدرس کیف پول را وارد کنید"
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

                        userId,

                        amount,

                        network,

                        address

                    })

            }
        );


        toast(
            "درخواست برداشت ثبت شد"
        );


        await loadWallet();


        nav(
            "wallet"
        );

    }

    catch (error) {

        toast(
            error.message
        );

    }

}


// =====================================
// REFRESH
// =====================================

async function refreshAll() {

    await Promise.all([

        loadExchangeRate(),

        loadWallet(),

        loadBot(),

        loadTrades(),

        loadDeposits()

    ]);


    renderPage(
        state.page
    );

}


// =====================================
// CLICK HANDLER
// =====================================

document.addEventListener(
    "click",
    async event => {

        const button =
            event.target.closest(
                "[data-nav],[data-action]"
            );


        if (!button) {

            return;

        }


        const navigation =
            button.dataset.nav;


        const action =
            button.dataset.action;


        if (navigation) {

            nav(
                navigation
            );

            return;

        }


        if (
            action ===
            "deposit"
        ) {

            nav(
                "deposit"
            );

        }


        else if (
            action ===
            "withdraw"
        ) {

            nav(
                "withdraw"
            );

        }


        else if (
            action ===
            "trades"
        ) {

            nav(
                "trades"
            );

        }


        else if (
            action ===
            "toggleBot"
        ) {

            await toggleBot();

        }


        else if (
            action ===
            "createDeposit"
        ) {

            await createDeposit();

        }


        else if (
            action ===
            "withdrawSubmit"
        ) {

            await withdrawSubmit();

        }


        else if (
            action ===
            "refresh"
        ) {

            await refreshAll();

            toast(
                "اطلاعات به‌روزرسانی شد"
            );

        }


        else if (
            action ===
            "refreshAll"
        ) {

            await refreshAll();

            toast(
                "اطلاعات به‌روزرسانی شد"
            );

        }


        else if (
            action ===
            "support"
        ) {

            const url =
                "https://t.me/"
                +
                SUPPORT_USERNAME
                    .replace(
                        "@",
                        ""
                    );


            if (
                tg?.openTelegramLink
            ) {

                tg.openTelegramLink(
                    url
                );

            }

            else {

                window.open(
                    url,
                    "_blank"
                );

            }

        }


        else if (
            action ===
            "about"
        ) {

            toast(
                "AutoTrade AI — سامانه مدیریت و معامله‌گری خودکار"
            );

        }

    }
);


// =====================================
// INIT
// =====================================

async function init() {

    renderPage(
        "dashboard"
    );


    await authenticate();


    await refreshAll();


    renderPage(
        "dashboard"
    );

}


// =====================================
// START
// =====================================

init();