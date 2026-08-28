// =====================================
// ..M AutoTrade AI Mini App
// File: MiniApp/app.js
// =====================================


// =====================================
// Telegram WebApp
// =====================================

const tg =
    window.Telegram?.WebApp;

tg?.ready();
tg?.expand();


// =====================================
// Backend
// =====================================

const BACKEND_URL =
    "https://autotrade-backend-02cc.onrender.com";


// =====================================
// Support
// =====================================

const SUPPORT_USERNAME =
    "mehdi2410l";


// =====================================
// Telegram Init Data
// =====================================

const telegramInitData =
    tg?.initData || "";


// =====================================
// Global State
// =====================================

let currentPage =
    "dashboard";

let currentUser =
    null;

let currentWallet =
    null;

let currentBot =
    null;

let currentTrades =
    [];

let currentExchangeRate =
    Number(
        localStorage.getItem(
            "autotrade_usd_irr"
        )
    ) || 100000;


// =====================================
// Helpers
// =====================================

function getUserId() {

    return (
        currentUser?._id ||
        currentUser?.id ||
        currentUser?.userId ||
        currentUser?.telegramId ||
        tg?.initDataUnsafe?.user?.id ||
        null
    );

}


function firstValue(
    object,
    keys,
    fallback = null
) {

    if (!object) {
        return fallback;
    }

    for (const key of keys) {

        if (
            object[key] !== undefined &&
            object[key] !== null
        ) {

            return object[key];

        }

    }

    return fallback;

}


function numberValue(
    value,
    fallback = 0
) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


function formatNumber(
    value,
    decimals = 2
) {

    const number =
        numberValue(value);

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


function formatUSD(
    value
) {

    return `$${formatNumber(value)}`;

}


function usdToToman(
    usd
) {

    return (
        numberValue(usd) *
        numberValue(
            currentExchangeRate,
            100000
        )
    );

}


function formatToman(
    usd
) {

    return (
        `معادل تومان: ${formatNumber(
            usdToToman(usd),
            0
        )}`
    );

}


function setText(
    id,
    value,
    fallback = "—"
) {

    const element =
        document.getElementById(id);

    if (!element) {
        return;
    }

    element.textContent =
        value === undefined ||
        value === null ||
        value === ""
            ? fallback
            : value;

}


// =====================================
// Loading
// =====================================

function showLoadingScreen() {

    const element =
        document.getElementById(
            "loading-screen"
        );

    if (!element) {
        return;
    }

    element.classList.remove(
        "hidden"
    );

    element.style.display =
        "flex";

}


function hideLoadingScreen() {

    const element =
        document.getElementById(
            "loading-screen"
        );

    if (!element) {
        return;
    }

    element.classList.add(
        "hidden"
    );

    element.style.display =
        "none";

}


// =====================================
// API
// =====================================

async function apiFetch(
    endpoint,
    options = {}
) {

    const headers = {

        ...(options.headers || {}),

        "Content-Type":
            "application/json",

        "X-Telegram-Init-Data":
            telegramInitData

    };


    const response =
        await fetch(
            `${BACKEND_URL}${endpoint}`,
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

        throw new Error(
            "Backend returned an invalid response."
        );

    }


    if (!response.ok) {

        throw new Error(

            data?.message ||
            `API request failed (${response.status})`

        );

    }


    return data;

}


// =====================================
// Telegram Authentication
// =====================================

async function authenticateTelegram() {

    if (!tg) {

        throw new Error(
            "Telegram WebApp is not available."
        );

    }


    if (!telegramInitData) {

        throw new Error(
            "لطفاً Mini App را داخل Telegram باز کنید."
        );

    }


    console.log(
        "🔐 Authenticating Telegram..."
    );


    const result =
        await apiFetch(
            "/api/auth/telegram",
            {
                method: "POST"
            }
        );


    if (
        !result ||
        !result.success ||
        !result.authenticated ||
        !result.user
    ) {

        throw new Error(

            result?.message ||
            "Telegram authentication failed."

        );

    }


    currentUser =
        result.user;


    window.currentUser =
        currentUser;


    console.log(
        "✅ Telegram authenticated:",
        currentUser
    );


    return currentUser;

}


// =====================================
// Navigation
// =====================================

function showPage(
    pageName
) {

    if (!pageName) {
        return;
    }


    const target =
        document.getElementById(
            `page-${pageName}`
        );


    if (!target) {

        console.warn(
            `Page not found: ${pageName}`
        );

        return;

    }


    document
        .querySelectorAll(".page")
        .forEach(
            page => {

                page.classList.remove(
                    "active"
                );

                page.style.display =
                    "none";

            }
        );


    target.classList.add(
        "active"
    );

    target.style.display =
        "block";


    document
        .querySelectorAll(
            ".nav-item[data-page]"
        )
        .forEach(
            item => {

                item.classList.toggle(
                    "active",
                    item.dataset.page ===
                    pageName
                );

            }
        );


    const titles = {

        dashboard:
            "داشبورد",

        wallet:
            "کیف پول",

        trades:
            "معاملات",

        analytics:
            "تحلیل‌ها",

        notifications:
            "اعلان‌ها",

        profile:
            "پروفایل",

        withdraw:
            "برداشت"

    };


    setText(
        "page-title",
        titles[pageName] ||
        "AutoTrade AI"
    );


    currentPage =
        pageName;


    const back =
        document.getElementById(
            "header-back"
        );


    if (back) {

        back.classList.toggle(
            "hidden",
            pageName === "dashboard"
        );

    }


    const main =
        document.getElementById(
            "main-content"
        );


    if (main) {

        main.scrollTop =
            0;

    }


    window.scrollTo(
        0,
        0
    );


    // Load page data

    if (pageName === "wallet") {

        loadWallet();

    }


    if (pageName === "trades") {

        loadTrades();

    }


    if (pageName === "profile") {

        loadProfile();

    }

}


// =====================================
// Dashboard
// =====================================

async function loadDashboard() {

    try {

        await Promise.allSettled([

            loadWallet(),

            loadBot(),

            loadTrades(),

            loadExchangeRate()

        ]);


        renderDashboard();

    }

    catch (error) {

        console.error(
            "Dashboard load error:",
            error
        );

    }

}


// =====================================
// Wallet
// =====================================

async function loadWallet() {

    const userId =
        getUserId();

    if (!userId) {
        return null;
    }


    try {

        const data =
            await apiFetch(
                `/api/wallet/${encodeURIComponent(
                    userId
                )}`
            );


        currentWallet =
            data?.wallet ||
            data?.data ||
            data;


        renderWallet();


        return currentWallet;

    }

    catch (error) {

        console.error(
            "Wallet load error:",
            error
        );

        return null;

    }

}


// =====================================
// Bot
// =====================================

async function loadBot() {

    const userId =
        getUserId();

    if (!userId) {
        return null;
    }


    try {

        const data =
            await apiFetch(
                `/api/bot/${encodeURIComponent(
                    userId
                )}`
            );


        currentBot =
            data?.bot ||
            data?.data ||
            data;


        renderBot();


        return currentBot;

    }

    catch (error) {

        console.error(
            "Bot load error:",
            error
        );

        return null;

    }

}


// =====================================
// Trades
// =====================================

async function loadTrades() {

    const userId =
        getUserId();

    if (!userId) {
        return [];
    }


    try {

        const data =
            await apiFetch(
                `/api/trades/${encodeURIComponent(
                    userId
                )}`
            );


        currentTrades =
            Array.isArray(data)
                ? data
                : (
                    data?.trades ||
                    data?.data ||
                    []
                );


        renderTrades(
            "open"
        );

        renderRecentTrades();


        return currentTrades;

    }

    catch (error) {

        console.error(
            "Trades load error:",
            error
        );

        currentTrades =
            [];

        renderTrades(
            "open"
        );

        return [];

    }

}


// =====================================
// Currency
// =====================================

async function loadExchangeRate() {

    const endpoints = [

        "/api/currency/exchange-rate",

        "/api/currency/rate",

        "/api/currency"

    ];


    for (const endpoint of endpoints) {

        try {

            const data =
                await apiFetch(
                    endpoint
                );


            const rate =
                firstValue(
                    data,
                    [
                        "rate",
                        "usdToIrr",
                        "usdToToman",
                        "exchangeRate"
                    ],
                    null
                );


            if (rate) {

                currentExchangeRate =
                    numberValue(
                        rate,
                        currentExchangeRate
                    );


                localStorage.setItem(
                    "autotrade_usd_irr",
                    String(
                        currentExchangeRate
                    )
                );


                return currentExchangeRate;

            }

        }

        catch {

            // Try next endpoint

        }

    }


    return currentExchangeRate;

}


// =====================================
// Render Dashboard
// =====================================

function renderDashboard() {

    renderWallet();

    renderBot();

    renderRecentTrades();

}


// =====================================
// Render Wallet
// =====================================

function renderWallet() {

    if (!currentWallet) {
        return;
    }


    const balance =
        numberValue(
            firstValue(
                currentWallet,
                [
                    "balance",
                    "totalBalance",
                    "amount"
                ],
                0
            )
        );


    const profit =
        numberValue(
            firstValue(
                currentWallet,
                [
                    "totalProfit",
                    "profit"
                ],
                0
            )
        );


    const available =
        numberValue(
            firstValue(
                currentWallet,
                [
                    "withdrawable",
                    "available",
                    "availableBalance"
                ],
                balance
            )
        );


    const totalTrades =
        numberValue(
            firstValue(
                currentWallet,
                [
                    "totalTrades",
                    "tradesCount"
                ],
                currentTrades.length
            )
        );


    const successfulTrades =
        currentTrades.filter(
            trade => {

                const tradeProfit =
                    numberValue(
                        firstValue(
                            trade,
                            [
                                "profit",
                                "pnl"
                            ],
                            0
                        )
                    );

                return tradeProfit > 0;

            }
        ).length;


    const successRate =
        totalTrades > 0
            ? (
                successfulTrades /
                totalTrades *
                100
            )
            : 0;


    // Dashboard

    setText(
        "dashboard-balance-usd",
        formatNumber(balance)
    );

    setText(
        "dashboard-balance-irr",
        formatToman(balance)
    );


    setText(
        "total-profit-usd",
        formatUSD(profit)
    );

    setText(
        "total-profit-irr",
        formatToman(profit)
    );


    setText(
        "total-trades",
        formatNumber(
            totalTrades,
            0
        )
    );


    setText(
        "success-rate",
        `${formatNumber(
            successRate,
            1
        )}%`
    );


    // Wallet

    setText(
        "wallet-balance-usd",
        formatNumber(balance)
    );

    setText(
        "wallet-balance-irr",
        formatToman(balance)
    );


    setText(
        "wallet-available-usd",
        formatNumber(available)
    );

    setText(
        "wallet-available-irr",
        formatToman(available)
    );


    setText(
        "wallet-summary-balance",
        formatUSD(balance)
    );

    setText(
        "wallet-summary-profit",
        formatUSD(profit)
    );

    setText(
        "wallet-summary-total",
        formatUSD(balance)
    );


    // Withdraw

    setText(
        "withdraw-available-usd",
        formatNumber(available)
    );

    setText(
        "withdraw-available-irr",
        formatToman(available)
    );

}


// =====================================
// Today's Profit
// =====================================

function calculateTodayProfit() {

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    return currentTrades
        .filter(
            trade => {

                const dateValue =
                    firstValue(
                        trade,
                        [
                            "createdAt",
                            "closedAt",
                            "updatedAt"
                        ],
                        null
                    );


                if (!dateValue) {
                    return false;
                }


                const date =
                    new Date(
                        dateValue
                    );


                return (
                    date >= today
                );

            }
        )
        .reduce(
            (
                total,
                trade
            ) => {

                return (
                    total +
                    numberValue(
                        firstValue(
                            trade,
                            [
                                "profit",
                                "pnl"
                            ],
                            0
                        )
                    )
                );

            },
            0
        );

}


// =====================================
// Render Bot
// =====================================

function renderBot() {

    if (!currentBot) {
        return;
    }


    const status =
        firstValue(
            currentBot,
            [
                "status",
                "botStatus"
            ],
            "STOPPED"
        );


    const strategy =
        firstValue(
            currentBot,
            [
                "strategy",
                "strategyName"
            ],
            "AI Scalping"
        );


    const accuracy =
        numberValue(
            firstValue(
                currentBot,
                [
                    "accuracy",
                    "successRate"
                ],
                0
            )
        );


    const active =
        String(status)
            .toUpperCase() ===
        "ACTIVE";


    setText(
        "ai-status",
        active
            ? "فعال"
            : "متوقف"
    );


    setText(
        "ai-strategy",
        strategy
    );


    setText(
        "ai-accuracy",
        accuracy
            ? `${formatNumber(
                accuracy,
                1
            )}%`
            : "—"
    );


    setText(
        "ai-mode",
        active
            ? "در حال فعالیت"
            : "متوقف"
    );


    const button =
        document.getElementById(
            "ai-trading-button"
        );


    if (button) {

        button.textContent =
            active
                ? "توقف معاملات AI"
                : "شروع معاملات AI";

    }

}


// =====================================
// Start / Stop Bot
// =====================================

async function toggleAITrading() {

    const userId =
        getUserId();

    if (!userId) {
        return;
    }


    const isActive =
        String(
            currentBot?.status
        ).toUpperCase() ===
        "ACTIVE";


    try {

        if (!isActive) {

            await apiFetch(
                `/api/bot/start/${encodeURIComponent(
                    userId
                )}`,
                {
                    method: "POST"
                }
            );


            showToast(
                "معاملات AI فعال شد."
            );

        }

        else {

            showToast(
                "برای توقف امن، وضعیت ربات از Backend مدیریت می‌شود."
            );

        }


        await loadBot();

    }

    catch (error) {

        showToast(
            error?.message ||
            "خطا در تغییر وضعیت ربات"
        );

    }

}


// =====================================
// Render Trades
// =====================================

function getTradeStatus(
    trade
) {

    const status =
        String(
            firstValue(
                trade,
                [
                    "status"
                ],
                ""
            )
        ).toUpperCase();


    if (
        status === "OPEN" ||
        status === "ACTIVE"
    ) {

        return "open";

    }


    return "closed";

}


function renderTrades(
    filter = "open"
) {

    const container =
        document.getElementById(
            "trades-list"
        );


    if (!container) {
        return;
    }


    const filtered =
        currentTrades.filter(
            trade =>
                getTradeStatus(
                    trade
                ) === filter
        );


    if (!filtered.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    —
                </div>

                <p>
                    ${
                        filter === "open"
                            ? "معامله بازی وجود ندارد."
                            : "معامله بسته‌ای وجود ندارد."
                    }
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        filtered
            .map(
                trade => {

                    const symbol =
                        firstValue(
                            trade,
                            [
                                "symbol",
                                "pair"
                            ],
                            "نامشخص"
                        );


                    const type =
                        String(
                            firstValue(
                                trade,
                                [
                                    "type",
                                    "side"
                                ],
                                "—"
                            )
                        ).toUpperCase();


                    const entry =
                        numberValue(
                            firstValue(
                                trade,
                                [
                                    "entryPrice",
                                    "price"
                                ],
                                0
                            )
                        );


                    const exit =
                        numberValue(
                            firstValue(
                                trade,
                                [
                                    "exitPrice"
                                ],
                                0
                            )
                        );


                    const amount =
                        numberValue(
                            firstValue(
                                trade,
                                [
                                    "amount",
                                    "quantity"
                                ],
                                0
                            )
                        );


                    const profit =
                        numberValue(
                            firstValue(
                                trade,
                                [
                                    "profit",
                                    "pnl"
                                ],
                                0
                            )
                        );


                    return `

                        <div class="trade-item">

                            <div class="trade-main">

                                <strong>
                                    ${symbol}
                                </strong>

                                <span>
                                    ${type}
                                </span>

                            </div>

                            <div class="trade-details">

                                <span>
                                    ورود:
                                    ${formatNumber(entry)}
                                </span>

                                ${
                                    exit
                                        ? `
                                            <span>
                                                خروج:
                                                ${formatNumber(exit)}
                                            </span>
                                        `
                                        : ""
                                }

                                <span>
                                    مقدار:
                                    ${formatNumber(amount)}
                                </span>

                                <strong>
                                    سود:
                                    ${formatUSD(profit)}
                                </strong>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


// =====================================
// Recent Trades
// =====================================

function renderRecentTrades() {

    const container =
        document.getElementById(
            "dashboard-trades"
        );


    if (!container) {
        return;
    }


    const recent =
        currentTrades
            .slice(0, 5);


    if (!recent.length) {

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


    container.innerHTML =
        recent
            .map(
                trade => {

                    const symbol =
                        firstValue(
                            trade,
                            [
                                "symbol",
                                "pair"
                            ],
                            "نامشخص"
                        );


                    const profit =
                        numberValue(
                            firstValue(
                                trade,
                                [
                                    "profit",
                                    "pnl"
                                ],
                                0
                            )
                        );


                    return `

                        <div class="trade-item">

                            <div class="trade-main">

                                <strong>
                                    ${symbol}
                                </strong>

                                <span>
                                    ${
                                        getTradeStatus(
                                            trade
                                        ) === "open"
                                            ? "باز"
                                            : "بسته"
                                    }
                                </span>

                            </div>

                            <strong>
                                ${formatUSD(profit)}
                            </strong>

                        </div>

                    `;

                }
            )
            .join("");

}


// =====================================
// Profile
// =====================================

function renderProfile() {

    if (!currentUser) {
        return;
    }


    const telegramUser =
        tg?.initDataUnsafe?.user ||
        {};


    const firstName =
        firstValue(
            currentUser,
            [
                "firstName",
                "first_name"
            ],
            firstValue(
                telegramUser,
                [
                    "first_name"
                ],
                "کاربر"
            )
        );


    const lastName =
        firstValue(
            currentUser,
            [
                "lastName",
                "last_name"
            ],
            firstValue(
                telegramUser,
                [
                    "last_name"
                ],
                ""
            )
        );


    const username =
        firstValue(
            currentUser,
            [
                "username"
            ],
            firstValue(
                telegramUser,
                [
                    "username"
                ],
                ""
            )
        );


    const telegramId =
        firstValue(
            currentUser,
            [
                "telegramId",
                "telegram_id"
            ],
            firstValue(
                telegramUser,
                [
                    "id"
                ],
                "—"
            )
        );


    const status =
        firstValue(
            currentUser,
            [
                "status"
            ],
            "ACTIVE"
        );


    const fullName =
        `${firstName} ${lastName}`.trim();


    setText(
        "profile-name",
        fullName || "کاربر"
    );


    setText(
        "profile-username",
        username
            ? `@${String(username).replace(
                /^@/,
                ""
            )}`
            : "بدون نام کاربری"
    );


    setText(
        "profile-status",
        status
    );


    setText(
        "account-name",
        fullName || "کاربر"
    );


    setText(
        "account-username",
        username
            ? `@${String(username).replace(
                /^@/,
                ""
            )}`
            : "—"
    );


    setText(
        "account-telegram-id",
        String(telegramId)
    );


    setText(
        "account-status",
        status
    );


    const avatar =
        document.getElementById(
            "profile-avatar"
        );


    if (avatar) {

        avatar.textContent =
            (
                firstName ||
                "A"
            )
                .charAt(0)
                .toUpperCase();

    }

}


// =====================================
// Profile Panels
// =====================================

function hideProfilePanels() {

    document
        .querySelectorAll(
            ".profile-subpanel"
        )
        .forEach(
            panel => {

                panel.classList.add(
                    "hidden"
                );

                panel.style.display =
                    "none";

            }
        );

}


function openProfilePanel(
    type
) {

    hideProfilePanels();


    const panel =
        document.getElementById(
            `profile-${type}-panel`
        );


    if (!panel) {
        return;
    }


    panel.classList.remove(
        "hidden"
    );

    panel.style.display =
        "block";


    panel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    if (type === "account") {

        renderProfile();

    }

}


// =====================================
// Support
// =====================================

function openSupport() {

    const url =
        `https://t.me/${SUPPORT_USERNAME}`;


    if (tg?.openTelegramLink) {

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
// Navigation Events
// =====================================

function initializeNavigation() {

    document
        .querySelectorAll(
            ".nav-item[data-page]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        showPage(
                            button.dataset.page
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            "[data-page]:not(.nav-item)"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        showPage(
                            button.dataset.page
                        );

                    }
                );

            }
        );

}


// =====================================
// Profile Events
// =====================================

function initializeProfileActions() {

    document
        .querySelectorAll(
            "[data-profile-action]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        const action =
                            button.dataset
                                .profileAction;


                        if (
                            action ===
                            "account"
                        ) {

                            openProfilePanel(
                                "account"
                            );

                        }


                        if (
                            action ===
                            "security"
                        ) {

                            openProfilePanel(
                                "security"
                            );

                        }


                        if (
                            action ===
                            "support"
                        ) {

                            openProfilePanel(
                                "support"
                            );

                        }

                    }
                );

            }
        );


    const supportButton =
        document.getElementById(
            "support-button"
        );


    if (supportButton) {

        supportButton.addEventListener(
            "click",
            openSupport
        );

    }

}


// =====================================
// Trade Tabs
// =====================================

function initializeTradeTabs() {

    document
        .querySelectorAll(
            "[data-trade-status]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();


                        document
                            .querySelectorAll(
                                "[data-trade-status]"
                            )
                            .forEach(
                                tab => {

                                    tab.classList.toggle(
                                        "active",
                                        tab === button
                                    );

                                }
                            );


                        renderTrades(
                            button.dataset
                                .tradeStatus
                        );

                    }
                );

            }
        );

}


// =====================================
// Back Button
// =====================================

function initializeBackButton() {

    const button =
        document.getElementById(
            "header-back"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            showPage(
                "dashboard"
            );

        }
    );

}


// =====================================
// Notification
// =====================================

function initializeNotifications() {

    const button =
        document.getElementById(
            "notification-button"
        );


    if (button) {

        button.addEventListener(
            "click",
            () => {

                showPage(
                    "notifications"
                );

            }
        );

    }


    const markRead =
        document.getElementById(
            "mark-notifications-read"
        );


    if (markRead) {

        markRead.addEventListener(
            "click",
            () => {

                const badge =
                    document.getElementById(
                        "notification-badge"
                    );


                if (badge) {

                    badge.classList.add(
                        "hidden"
                    );

                }


                showToast(
                    "همه اعلان‌ها خوانده شدند."
                );

            }
        );

    }

}


// =====================================
// Dashboard Actions
// =====================================

function initializeActions() {

    document
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const action =
                            button.dataset
                                .action;


                        if (
                            action ===
                            "withdraw"
                        ) {

                            showPage(
                                "withdraw"
                            );

                            return;

                        }


                        if (
                            action ===
                            "deposit"
                        ) {

                            showToast(
                                "بخش افزایش موجودی در حال اتصال به سیستم واریز است."
                            );

                            return;

                        }


                        if (
                            action ===
                            "transfer"
                        ) {

                            showToast(
                                "بخش انتقال در حال آماده‌سازی است."
                            );

                        }

                    }
                );

            }
        );


    const aiButton =
        document.getElementById(
            "ai-trading-button"
        );


    if (aiButton) {

        aiButton.addEventListener(
            "click",
            toggleAITrading
        );

    }

}


// =====================================
// Toast
// =====================================

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );

    const messageElement =
        document.getElementById(
            "toast-message"
        );


    if (
        !toast ||
        !messageElement
    ) {

        return;

    }


    messageElement.textContent =
        message;


    toast.classList.add(
        "show"
    );


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
// Logout
// =====================================

function initializeLogout() {

    const button =
        document.getElementById(
            "logout-button"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            currentUser =
                null;

            currentWallet =
                null;

            currentBot =
                null;

            currentTrades =
                [];


            window.currentUser =
                null;


            showToast(
                "نشست فعلی پاک شد."
            );

        }
    );

}


// =====================================
// Application
// =====================================

async function initializeApp() {

    try {

        console.log(
            "====================================="
        );

        console.log(
            "🚀 AutoTrade AI"
        );

        console.log(
            "====================================="
        );


        initializeNavigation();

        initializeProfileActions();

        initializeTradeTabs();

        initializeBackButton();

        initializeNotifications();

        initializeActions();

        initializeLogout();


        showLoadingScreen();


        await authenticateTelegram();


        renderProfile();


        await loadDashboard();


        hideLoadingScreen();


        showPage(
            "dashboard"
        );


        console.log(
            "✅ AutoTrade AI initialized successfully."
        );

    }

    catch (error) {

        console.error(
            "❌ Initialization failed:",
            error
        );


        currentUser =
            null;


        hideLoadingScreen();


        if (tg) {

            try {

                tg.showAlert(

                    "خطا در اتصال به حساب Telegram\n\n" +
                    (
                        error?.message ||
                        "خطای نامشخص"
                    )

                );

            }

            catch {

                // Ignore Telegram alert errors

            }

        }

    }

}


// =====================================
// Global API
// =====================================

window.autoTradeAPI = {

    apiFetch,

    authenticateTelegram,

    initializeApp,

    showPage,

    showToast,

    loadDashboard,

    loadWallet,

    loadBot,

    loadTrades

};


// =====================================
// Start
// =====================================

initializeApp();