/* =========================================================
   AutoTrade AI
   Main Application
   Real-data ready / No fake trading data
   ========================================================= */

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const BACKEND_URL =
    "https://autotrade-backend-02cc.onrender.com";

const API_TIMEOUT = 15000;


/* =========================================================
   TELEGRAM
========================================================= */

const tg =
    window.Telegram &&
    window.Telegram.WebApp
        ? window.Telegram.WebApp
        : null;


if (tg) {

    tg.ready();

    tg.expand();

    try {
        tg.setHeaderColor("#020817");
        tg.setBackgroundColor("#020817");
    } catch (error) {
        console.warn(
            "Telegram UI settings unavailable:",
            error
        );
    }

}


/* =========================================================
   USER
========================================================= */

const telegramUser =
    tg &&
    tg.initDataUnsafe &&
    tg.initDataUnsafe.user
        ? tg.initDataUnsafe.user
        : null;


const telegramId =
    telegramUser &&
    telegramUser.id
        ? String(telegramUser.id)
        : null;


const userFirstName =
    telegramUser &&
    telegramUser.first_name
        ? telegramUser.first_name
        : "کاربر";


const userUsername =
    telegramUser &&
    telegramUser.username
        ? telegramUser.username
        : "";


/* =========================================================
   APPLICATION STATE
========================================================= */

const state = {

    currentPage: "dashboard",

    user: null,

    wallet: null,

    bot: null,

    trades: [],

    notifications: [],

    exchangeRate: null,

    loading: true,

    lastUpdated: null,

    aiStarting: false

};


/* =========================================================
   DOM HELPERS
========================================================= */

function $(selector) {

    return document.querySelector(selector);

}


function $all(selector) {

    return document.querySelectorAll(selector);

}


/* =========================================================
   TEXT HELPERS
========================================================= */

function safeText(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    return String(value);

}


function formatUSD(value) {

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(Number(value))
    ) {
        return "—";
    }

    return Number(value).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === "" ||
        Number.isNaN(Number(value))
    ) {
        return "—";
    }

    return Number(value).toLocaleString(
        "fa-IR"
    );

}


/* =========================================================
   USD → TOMAN
========================================================= */

function usdToToman(
    usd
) {

    if (
        state.exchangeRate === null ||
        state.exchangeRate === undefined ||
        usd === null ||
        usd === undefined
    ) {
        return null;
    }


    const result =
        Number(usd) *
        Number(state.exchangeRate);


    if (
        Number.isNaN(result)
    ) {
        return null;
    }


    return result;

}


function formatToman(
    usd
) {

    const toman =
        usdToToman(usd);


    if (toman === null) {

        return "معادل تومان: —";

    }


    return (
        "معادل تومان: " +
        Number(toman).toLocaleString(
            "fa-IR"
        ) +
        " تومان"
    );

}


/* =========================================================
   USD DISPLAY
========================================================= */

function setMoney(
    element,
    value
) {

    if (!element) {
        return;
    }


    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        element.textContent = "—";

        return;

    }


    element.textContent =
        formatUSD(value);

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(
    message
) {

    const toast =
        $("#toast");

    const toastMessage =
        $("#toast-message");


    if (!toast || !toastMessage) {
        return;
    }


    toastMessage.textContent =
        safeText(message);


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2800
        );

}


/* =========================================================
   API REQUEST
========================================================= */

async function apiRequest(
    path,
    options = {}
) {

    const controller =
        new AbortController();


    const timeout =
        setTimeout(
            () => {
                controller.abort();
            },
            API_TIMEOUT
        );


    try {

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
            ] = tg.initData;

        }


        const response =
            await fetch(
                BACKEND_URL + path,
                {

                    method:
                        options.method ||
                        "GET",

                    headers: {
                        ...headers,
                        ...(options.headers || {})
                    },

                    body:
                        options.body
                            ? JSON.stringify(
                                options.body
                            )
                            : undefined,

                    signal:
                        controller.signal

                }
            );


        let data = null;


        try {

            data =
                await response.json();

        } catch {

            data = null;

        }


        if (!response.ok) {

            throw new Error(
                data &&
                data.message
                    ? data.message
                    : `HTTP ${response.status}`
            );

        }


        return data;

    } finally {

        clearTimeout(
            timeout
        );

    }

}


/* =========================================================
   USER API
========================================================= */

async function loadUser() {

    if (!telegramId) {

        console.warn(
            "Telegram user ID is unavailable."
        );

        return null;

    }


    try {

        const data =
            await apiRequest(
                `/user/${encodeURIComponent(
                    telegramId
                )}`
            );


        return (
            data &&
            data.user
                ? data.user
                : data
        );

    } catch (error) {

        console.error(
            "User API error:",
            error
        );

        return null;

    }

}


/* =========================================================
   WALLET API
========================================================= */

async function loadWallet() {

    if (!telegramId) {
        return null;
    }


    try {

        const data =
            await apiRequest(
                `/wallet/${encodeURIComponent(
                    telegramId
                )}`
            );


        return (
            data &&
            data.wallet
                ? data.wallet
                : data
        );

    } catch (error) {

        console.error(
            "Wallet API error:",
            error
        );

        return null;

    }

}


/* =========================================================
   BOT API
========================================================= */

async function loadBot() {

    if (!telegramId) {
        return null;
    }


    try {

        const data =
            await apiRequest(
                `/bot/${encodeURIComponent(
                    telegramId
                )}`
            );


        return (
            data &&
            data.bot
                ? data.bot
                : data
        );

    } catch (error) {

        console.error(
            "Bot API error:",
            error
        );

        return null;

    }

}


/* =========================================================
   TRADES API
========================================================= */

async function loadTrades() {

    if (!telegramId) {
        return [];
    }


    try {

        const data =
            await apiRequest(
                `/trades/${encodeURIComponent(
                    telegramId
                )}`
            );


        if (
            Array.isArray(data)
        ) {

            return data;

        }


        if (
            data &&
            Array.isArray(
                data.trades
            )
        ) {

            return data.trades;

        }


        return [];

    } catch (error) {

        console.error(
            "Trades API error:",
            error
        );

        return [];

    }

}


/* =========================================================
   EXCHANGE RATE
========================================================= */

async function loadExchangeRate() {

    try {

        const data =
            await apiRequest(
                "/exchange-rate"
            );


        const rate =
            data &&
            (
                data.usd_toman ??
                data.usd_irr ??
                data.rate
            );


        if (
            rate !== null &&
            rate !== undefined &&
            !Number.isNaN(
                Number(rate)
            )
        ) {

            state.exchangeRate =
                Number(rate);

            return;

        }


        state.exchangeRate =
            null;

    } catch (error) {

        console.warn(
            "Exchange rate unavailable:",
            error
        );

        state.exchangeRate =
            null;

    }

}


/* =========================================================
   LOAD ALL DATA
========================================================= */

async function loadApplicationData() {

    state.loading = true;


    try {

        const results =
            await Promise.all([
                loadUser(),
                loadWallet(),
                loadBot(),
                loadTrades(),
                loadExchangeRate()
            ]);


        state.user =
            results[0];

        state.wallet =
            results[1];

        state.bot =
            results[2];

        state.trades =
            results[3];


        state.lastUpdated =
            new Date();


        renderAll();

    } catch (error) {

        console.error(
            "Application data error:",
            error
        );

        showToast(
            "دریافت اطلاعات از سرور انجام نشد."
        );

    } finally {

        state.loading = false;

        hideLoading();

    }

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    renderHeader();

    renderDashboard();

    renderWallet();

    renderWithdraw();

    renderTrades();

    renderProfile();

    renderAI();

}


/* =========================================================
   HEADER
========================================================= */

function renderHeader() {

    const title =
        $("#page-title");


    if (!title) {
        return;
    }


    const titles = {

        dashboard:
            "داشبورد",

        wallet:
            "کیف پول",

        withdraw:
            "برداشت",

        trades:
            "معاملات",

        analytics:
            "تحلیل‌ها",

        notifications:
            "اعلان‌ها",

        profile:
            "پروفایل"

    };


    title.textContent =
        titles[
            state.currentPage
        ] ||
        "داشبورد";

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const wallet =
        state.wallet;


    if (!wallet) {

        setMoney(
            $("#dashboard-balance-usd"),
            null
        );

        const balanceIR =
            $("#dashboard-balance-irr");

        if (balanceIR) {
            balanceIR.textContent =
                "معادل تومان: —";
        }

    } else {

        const balance =
            getWalletBalance(
                wallet
            );


        setMoney(
            $("#dashboard-balance-usd"),
            balance
        );


        const balanceIR =
            $("#dashboard-balance-irr");


        if (balanceIR) {

            balanceIR.textContent =
                formatToman(
                    balance
                );

        }

    }


    const todayProfit =
        getValue(
            state.wallet,
            [
                "todayProfit",
                "profitToday"
            ]
        );


    setMoney(
        $("#today-profit-usd"),
        todayProfit
    );


    const todayProfitIR =
        $("#today-profit-irr");


    if (todayProfitIR) {

        todayProfitIR.textContent =
            formatToman(
                todayProfit
            );

    }


    const totalProfit =
        getValue(
            state.wallet,
            [
                "totalProfit",
                "profit"
            ]
        );


    setMoney(
        $("#total-profit-usd"),
        totalProfit
    );


    const totalProfitIR =
        $("#total-profit-irr");


    if (totalProfitIR) {

        totalProfitIR.textContent =
            formatToman(
                totalProfit
            );

    }


    const totalTrades =
        getValue(
            state.wallet,
            [
                "totalTrades"
            ]
        );


    const totalTradesElement =
        $("#total-trades");


    if (totalTradesElement) {

        totalTradesElement.textContent =
            totalTrades === null
                ? "—"
                : formatNumber(
                    totalTrades
                );

    }


    const successRate =
        getValue(
            state.bot,
            [
                "accuracy",
                "successRate"
            ]
        );


    const successElement =
        $("#success-rate");


    if (successElement) {

        successElement.textContent =
            successRate === null
                ? "—"
                : `${formatNumber(
                    successRate
                )}%`;

    }


    renderDashboardTrades();

}


/* =========================================================
   DASHBOARD TRADES
========================================================= */

function renderDashboardTrades() {

    const container =
        $("#dashboard-trades");


    if (!container) {
        return;
    }


    if (
        !Array.isArray(
            state.trades
        ) ||
        state.trades.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-icon">
                —
            </div>

            <p>
                هنوز اطلاعات معاملاتی دریافت نشده است.
            </p>

        `;

        return;

    }


    const recent =
        state.trades
            .slice(0, 3);


    container.className =
        "trades-list";


    container.innerHTML =
        recent
            .map(
                createTradeHTML
            )
            .join("");

}


/* =========================================================
   WALLET
========================================================= */

function renderWallet() {

    const wallet =
        state.wallet;


    const balance =
        getWalletBalance(
            wallet
        );


    const available =
        getValue(
            wallet,
            [
                "withdrawable",
                "availableBalance",
                "available"
            ]
        );


    setMoney(
        $("#wallet-balance-usd"),
        balance
    );


    const balanceIR =
        $("#wallet-balance-irr");


    if (balanceIR) {

        balanceIR.textContent =
            formatToman(
                balance
            );

    }


    setMoney(
        $("#wallet-available-usd"),
        available
    );


    const availableIR =
        $("#wallet-available-irr");


    if (availableIR) {

        availableIR.textContent =
            formatToman(
                available
            );

    }


    setMoney(
        $("#wallet-summary-balance"),
        balance
    );


    setMoney(
        $("#wallet-summary-profit"),
        getValue(
            wallet,
            [
                "totalProfit",
                "profit"
            ]
        )
    );


    setMoney(
        $("#wallet-summary-total"),
        balance
    );

}


/* =========================================================
   WITHDRAW
========================================================= */

function renderWithdraw() {

    const available =
        getValue(
            state.wallet,
            [
                "withdrawable",
                "availableBalance",
                "available"
            ]
        );


    setMoney(
        $("#withdraw-available-usd"),
        available
    );


    const availableIR =
        $("#withdraw-available-irr");


    if (availableIR) {

        availableIR.textContent =
            formatToman(
                available
            );

    }

}


/* =========================================================
   AI
========================================================= */

function renderAI() {

    const bot =
        state.bot;


    const status =
        bot
            ? (
                bot.status ||
                (
                    bot.isActive
                        ? "ACTIVE"
                        : "STOPPED"
                )
            )
            : null;


    const statusElement =
        $("#ai-status");


    const modeElement =
        $("#ai-mode");


    const button =
        $("#ai-trading-button");


    if (!bot) {

        if (statusElement) {

            statusElement.textContent =
                "اطلاعات در دسترس نیست";

            statusElement.className =
                "status-badge";

        }


        if (modeElement) {

            modeElement.textContent =
                "نامشخص";

        }


        if (button) {

            button.textContent =
                "شروع معاملات AI";

        }


    } else {

        const active =
            String(
                status
            ).toUpperCase() ===
            "ACTIVE";


        if (statusElement) {

            statusElement.textContent =
                active
                    ? "فعال"
                    : "متوقف";

            statusElement.className =
                active
                    ? "status-badge active"
                    : "status-badge inactive";

        }


        if (modeElement) {

            modeElement.textContent =
                active
                    ? "فعال"
                    : "متوقف";

        }


        if (button) {

            button.textContent =
                active
                    ? "توقف معاملات AI"
                    : "شروع معاملات AI";

        }

    }


    const strategy =
        getValue(
            bot,
            [
                "strategy"
            ]
        );


    const accuracy =
        getValue(
            bot,
            [
                "accuracy"
            ]
        );


    const strategyElement =
        $("#ai-strategy");


    if (strategyElement) {

        strategyElement.textContent =
            strategy === null
                ? "—"
                : safeText(
                    strategy
                );

    }


    const accuracyElement =
        $("#ai-accuracy");


    if (accuracyElement) {

        accuracyElement.textContent =
            accuracy === null
                ? "—"
                : `${formatNumber(
                    accuracy
                )}%`;

    }

}


/* =========================================================
   TRADES
========================================================= */

function renderTrades() {

    const container =
        $("#trades-list");


    if (!container) {
        return;
    }


    if (
        !state.trades ||
        state.trades.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    —
                </div>

                <p>
                    معامله‌ای برای نمایش وجود ندارد.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        state.trades
            .map(
                createTradeHTML
            )
            .join("");

}


/* =========================================================
   TRADE HTML
========================================================= */

function createTradeHTML(
    trade
) {

    const symbol =
        trade.symbol ||
        "—";


    const type =
        trade.type ||
        "—";


    const profit =
        trade.profit;


    const status =
        trade.status ||
        "—";


    return `

        <div class="trade-item">

            <div class="trade-top">

                <div class="trade-symbol">
                    ${escapeHTML(symbol)}
                </div>

                <div class="trade-type">
                    ${escapeHTML(type)}
                </div>

            </div>


            <div class="trade-details">

                <div class="trade-detail">

                    <span>
                        وضعیت
                    </span>

                    <strong>
                        ${escapeHTML(
                            status
                        )}
                    </strong>

                </div>


                <div class="trade-detail">

                    <span>
                        سود / زیان
                    </span>

                    <strong>
                        ${
                            profit === null ||
                            profit === undefined
                                ? "—"
                                : "$" +
                                  formatUSD(
                                      profit
                                  )
                        }
                    </strong>

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   PROFILE
========================================================= */

function renderProfile() {

    const user =
        state.user;


    const name =
        user &&
        (
            user.firstName ||
            user.first_name ||
            user.name
        )
            ? (
                user.firstName ||
                user.first_name ||
                user.name
            )
            : userFirstName;


    const username =
        user &&
        (
            user.username
        )
            ? user.username
            : userUsername;


    const nameElement =
        $("#profile-name");


    if (nameElement) {

        nameElement.textContent =
            safeText(
                name
            );

    }


    const usernameElement =
        $("#profile-username");


    if (usernameElement) {

        usernameElement.textContent =
            username
                ? `@${username}`
                : "حساب تلگرام";

    }


    const avatar =
        $("#profile-avatar");


    if (avatar) {

        avatar.textContent =
            String(
                name ||
                "ک"
            )
                .trim()
                .charAt(0)
                .toUpperCase();

    }


    const profileStatus =
        $("#profile-status");


    if (profileStatus) {

        const accountStatus =
            user &&
            (
                user.status ||
                user.accessEnabled
                    ? "فعال"
                    : null
            );


        profileStatus.textContent =
            accountStatus ||
            "نامشخص";

    }

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function navigateToPage(
    page
) {

    if (!page) {
        return;
    }


    const pages =
        $all(".page");


    pages.forEach(
        element => {

            element.classList.toggle(
                "active",
                element.dataset.page ===
                page
            );

        }
    );


    const navItems =
        $all(".nav-item");


    navItems.forEach(
        item => {

            item.classList.toggle(
                "active",
                item.dataset.page ===
                page
            );

        }
    );


    state.currentPage =
        page;


    renderHeader();


    window.scrollTo(
        {
            top: 0,
            behavior: "smooth"
        }
    );

}


/* =========================================================
   START / STOP AI
========================================================= */

async function toggleAITrading() {

    if (state.aiStarting) {
        return;
    }


    if (!telegramId) {

        showToast(
            "این برنامه باید داخل Telegram Mini App اجرا شود."
        );

        return;

    }


    state.aiStarting =
        true;


    const button =
        $("#ai-trading-button");


    if (button) {

        button.disabled =
            true;

        button.textContent =
            "در حال بررسی...";

    }


    const currentStatus =
        state.bot &&
        state.bot.status
            ? String(
                state.bot.status
            ).toUpperCase()
            : "STOPPED";


    try {

        if (
            currentStatus ===
            "ACTIVE"
        ) {

            await apiRequest(
                `/bot/stop/${encodeURIComponent(
                    telegramId
                )}`,
                {
                    method: "POST"
                }
            );


            showToast(
                "درخواست توقف ربات ارسال شد."
            );

        } else {

            await apiRequest(
                `/bot/start/${encodeURIComponent(
                    telegramId
                )}`,
                {
                    method: "POST"
                }
            );


            showToast(
                "درخواست شروع ربات ارسال شد."
            );

        }


        await loadApplicationData();

    } catch (error) {

        console.error(
            "AI toggle error:",
            error
        );


        showToast(
            "عملیات انجام نشد. وضعیت سرور را بررسی کنید."
        );

    } finally {

        state.aiStarting =
            false;

        if (button) {

            button.disabled =
                false;

        }

    }

}


/* =========================================================
   WITHDRAW FORM
========================================================= */

function setupWithdrawForm() {

    const form =
        $("#withdraw-form");


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            if (!telegramId) {

                showToast(
                    "برای برداشت باید داخل Telegram وارد شده باشید."
                );

                return;

            }


            const amount =
                Number(
                    $("#withdraw-amount")
                        ?.value
                );


            const network =
                $("#withdraw-network")
                    ?.value;


            const address =
                $("#withdraw-address")
                    ?.value
                    .trim();


            if (
                !amount ||
                amount <= 0
            ) {

                showToast(
                    "مبلغ برداشت را وارد کنید."
                );

                return;

            }


            if (!network) {

                showToast(
                    "شبکه را انتخاب کنید."
                );

                return;

            }


            if (!address) {

                showToast(
                    "آدرس کیف پول را وارد کنید."
                );

                return;

            }


            try {

                await apiRequest(
                    "/wallet/withdraw",
                    {
                        method: "POST",

                        body: {

                            userId:
                                telegramId,

                            amount:
                                amount,

                            network:
                                network,

                            address:
                                address

                        }

                    }
                );


                showToast(
                    "درخواست برداشت با موفقیت برای بررسی سرور ارسال شد."
                );


                form.reset();


                await loadApplicationData();

            } catch (error) {

                console.error(
                    "Withdraw error:",
                    error
                );


                showToast(
                    "درخواست برداشت ارسال نشد."
                );

            }

        }
    );

}


/* =========================================================
   WITHDRAW PREVIEW
========================================================= */

function setupWithdrawPreview() {

    const amountInput =
        $("#withdraw-amount");


    if (!amountInput) {
        return;
    }


    amountInput.addEventListener(
        "input",
        () => {

            const amount =
                Number(
                    amountInput.value
                ) || 0;


            const receive =
                $("#withdraw-receive");


            const total =
                $("#withdraw-total");


            const fee =
                $("#withdraw-fee");


            /*
             * هیچ کارمزد ساختگی محاسبه نمی‌کنیم.
             * تا زمانی که سرور کارمزد واقعی را ندهد،
             * مقدار آن نامشخص است.
             */

            if (receive) {

                receive.textContent =
                    amount > 0
                        ? `${formatUSD(
                            amount
                        )} USDT`
                        : "0.00 USDT";

            }


            if (fee) {

                fee.textContent =
                    "—";

            }


            if (total) {

                total.textContent =
                    amount > 0
                        ? `${formatUSD(
                            amount
                        )} USDT`
                        : "0.00 USDT";

            }

        }
    );

}


/* =========================================================
   NAVIGATION EVENTS
========================================================= */

function setupNavigation() {

    $all(
        "[data-page]"
    ).forEach(
        element => {

            element.addEventListener(
                "click",
                () => {

                    const page =
                        element.dataset.page;


                    if (
                        page
                    ) {

                        navigateToPage(
                            page
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   ACTION BUTTONS
========================================================= */

function setupActions() {

    $all(
        "[data-action]"
    ).forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.action;


                    if (
                        action ===
                        "withdraw"
                    ) {

                        navigateToPage(
                            "withdraw"
                        );

                        return;

                    }


                    if (
                        action ===
                        "deposit"
                    ) {

                        showToast(
                            "اتصال درگاه واریز باید از سمت سرور انجام شود."
                        );

                        return;

                    }


                    if (
                        action ===
                        "transfer"
                    ) {

                        showToast(
                            "انتقال فقط پس از اتصال سرویس واقعی فعال می‌شود."
                        );

                    }

                }
            );

        }
    );


    const aiButton =
        $("#ai-trading-button");


    if (aiButton) {

        aiButton.addEventListener(
            "click",
            toggleAITrading
        );

    }


    const logoutButton =
        $("#logout-button");


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            () => {

                showToast(
                    "خروج از حساب باید توسط سیستم احراز هویت انجام شود."
                );

            }
        );

    }

}


/* =========================================================
   PROFILE ACTIONS
========================================================= */

function setupProfileActions() {

    $all(
        "[data-profile-action]"
    ).forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const action =
                        button.dataset.profileAction;


                    const messages = {

                        account:
                            "اطلاعات حساب از سرور دریافت می‌شود.",

                        security:
                            "تنظیمات امنیتی در نسخه متصل به سرور فعال می‌شود.",

                        referral:
                            "سیستم معرفی دوستان هنوز به API واقعی متصل نشده است.",

                        support:
                            "سیستم پشتیبانی باید به سرویس واقعی متصل شود.",

                        about:
                            "AutoTrade AI"

                    };


                    showToast(
                        messages[action] ||
                        "این بخش هنوز تنظیم نشده است."
                    );

                }
            );

        }
    );

}


/* =========================================================
   TRADES TABS
========================================================= */

function setupTradeTabs() {

    $all(
        ".tab"
    ).forEach(
        tab => {

            tab.addEventListener(
                "click",
                () => {

                    $all(
                        ".tab"
                    ).forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    tab.classList.add(
                        "active"
                    );


                    const status =
                        tab.dataset.tradeStatus;


                    filterTrades(
                        status
                    );

                }
            );

        }
    );

}


function filterTrades(
    status
) {

    const container =
        $("#trades-list");


    if (!container) {
        return;
    }


    const filtered =
        state.trades.filter(
            trade => {

                if (
                    status ===
                    "open"
                ) {

                    return String(
                        trade.status ||
                        ""
                    ).toUpperCase() ===
                    "OPEN";

                }


                if (
                    status ===
                    "closed"
                ) {

                    return String(
                        trade.status ||
                        ""
                    ).toUpperCase() ===
                    "CLOSED";

                }


                return true;

            }
        );


    if (
        filtered.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    —
                </div>

                <p>
                    معامله‌ای برای نمایش وجود ندارد.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        filtered
            .map(
                createTradeHTML
            )
            .join("");

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function setupNotifications() {

    const button =
        $("#notification-button");


    if (button) {

        button.addEventListener(
            "click",
            () => {

                navigateToPage(
                    "notifications"
                );

            }
        );

    }


    const markButton =
        $("#mark-notifications-read");


    if (markButton) {

        markButton.addEventListener(
            "click",
            () => {

                state.notifications =
                    state.notifications.map(
                        item => ({
                            ...item,
                            read: true
                        })
                    );


                renderNotifications();

                showToast(
                    "اعلان‌ها خوانده شدند."
                );

            }
        );

    }

}


function renderNotifications() {

    const container =
        $("#notifications-list");


    if (!container) {
        return;
    }


    if (
        state.notifications.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    —
                </div>

                <p>
                    اعلان جدیدی وجود ندارد.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        state.notifications
            .map(
                notification => `

                    <div class="
                        notification-item
                        ${notification.read
                            ? ""
                            : "unread"}
                    ">

                        <strong>
                            ${escapeHTML(
                                notification.title ||
                                "اعلان"
                            )}
                        </strong>

                        <p>
                            ${escapeHTML(
                                notification.message ||
                                ""
                            )}
                        </p>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   LOADING
========================================================= */

function hideLoading() {

    const screen =
        $("#loading-screen");


    if (!screen) {
        return;
    }


    screen.style.opacity =
        "0";


    screen.style.pointerEvents =
        "none";


    setTimeout(
        () => {

            screen.style.display =
                "none";

        },
        250
    );

}


/* =========================================================
   UTILITY
========================================================= */

function getValue(
    object,
    keys
) {

    if (!object) {
        return null;
    }


    for (
        const key of keys
    ) {

        if (
            object[key] !==
                null &&
            object[key] !==
                undefined &&
            object[key] !== ""
        ) {

            return object[key];

        }

    }


    return null;

}


function getWalletBalance(
    wallet
) {

    return getValue(
        wallet,
        [
            "balance",
            "totalBalance"
        ]
    );

}


function escapeHTML(
    value
) {

    return String(
        value ??
        ""
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


/* =========================================================
   INITIALIZATION
========================================================= */

async function initializeApp() {

    setupNavigation();

    setupActions();

    setupProfileActions();

    setupTradeTabs();

    setupWithdrawForm();

    setupWithdrawPreview();

    setupNotifications();


    renderAll();


    await loadApplicationData();

}


/* =========================================================
   AUTO REFRESH
========================================================= */

setInterval(
    async () => {

        if (
            document.visibilityState ===
            "visible"
        ) {

            await loadApplicationData();

        }

    },
    30000
);


/* =========================================================
   START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);
