// =====================================
// AutoTrade AI Mini App :: M
// File: MiniApp/app.js
// Dashboard + Telegram Auth + API
// =====================================


// =====================================
// Telegram WebApp
// =====================================

const tg =
    window.Telegram?.WebApp;


// =====================================
// Telegram Ready
// =====================================

tg?.ready();
tg?.expand();


// =====================================
// Backend URL
// =====================================

const BACKEND_URL =
    "https://autotrade-backend-02cc.onrender.com";


// =====================================
// Telegram InitData
// =====================================

const telegramInitData =
    tg?.initData || "";


// =====================================
// Application State
// =====================================

const appState = {

    user: null,

    wallet: null,

    trades: [],

    bot: null,

    exchangeRate: 0,

    authenticated: false

};


// =====================================
// Current Page
// =====================================

let currentPage =
    "dashboard";


// =====================================
// Loading Screen
// =====================================

function showLoadingScreen() {

    const loadingScreen =
        document.getElementById(
            "loading-screen"
        );

    if (!loadingScreen) {
        return;
    }

    loadingScreen.classList.remove(
        "hidden"
    );

    loadingScreen.style.display =
        "flex";
}


function hideLoadingScreen() {

    const loadingScreen =
        document.getElementById(
            "loading-screen"
        );

    if (!loadingScreen) {
        return;
    }

    loadingScreen.classList.add(
        "hidden"
    );

    loadingScreen.style.display =
        "none";
}


// =====================================
// Safe Number
// =====================================

function safeNumber(
    value,
    fallback = 0
) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;
}


// =====================================
// Format USD
// =====================================

function formatUSD(
    value
) {

    const number =
        safeNumber(value);

    return number.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


// =====================================
// Format Integer
// =====================================

function formatInteger(
    value
) {

    const number =
        safeNumber(value);

    return number.toLocaleString(
        "en-US"
    );

}


// =====================================
// Format Toman
// =====================================

function formatTomanValue(
    value
) {

    const number =
        safeNumber(value);

    return number.toLocaleString(
        "fa-IR",
        {
            maximumFractionDigits: 0
        }
    );

}


// =====================================
// USD To Toman
// =====================================

function usdToToman(
    usd
) {

    const rate =
        safeNumber(
            appState.exchangeRate
        );

    if (
        rate <= 0
    ) {

        return 0;

    }

    return (
        safeNumber(usd) *
        rate
    );

}


// =====================================
// API Fetch
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


    let data;


    try {

        data =
            await response.json();

    }

    catch (error) {

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

            "Telegram authentication data is missing. " +
            "Please open the Mini App inside Telegram."

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


    console.log(
        "✅ Telegram authentication successful",
        result.user
    );


    appState.user =
        result.user;

    appState.authenticated =
        true;


    return result.user;

}


// =====================================
// Get User ID
// =====================================

function getUserId(
    user
) {

    if (!user) {
        return null;
    }


    return (

        user._id ||
        user.id ||
        user.userId ||
        user.telegramId

    );

}


// =====================================
// PAGE NAVIGATION
// =====================================

function showPage(
    pageName
) {

    if (!pageName) {
        return;
    }


    console.log(
        "📄 Opening page:",
        pageName
    );


    const targetPage =
        document.getElementById(
            `page-${pageName}`
        );


    if (!targetPage) {

        console.warn(
            `Page not found: page-${pageName}`
        );

        return;

    }


    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(
        page => {

            page.classList.remove(
                "active"
            );

            page.style.display =
                "none";

        }
    );


    targetPage.classList.add(
        "active"
    );

    targetPage.style.display =
        "block";


    const navItems =
        document.querySelectorAll(
            ".nav-item[data-page]"
        );


    navItems.forEach(
        item => {

            if (
                item.dataset.page ===
                pageName
            ) {

                item.classList.add(
                    "active"
                );

            }

            else {

                item.classList.remove(
                    "active"
                );

            }

        }
    );


    const pageTitle =
        document.getElementById(
            "page-title"
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


    if (pageTitle) {

        pageTitle.textContent =
            titles[pageName] ||
            "AutoTrade AI";

    }


    currentPage =
        pageName;


    const mainContent =
        document.getElementById(
            "main-content"
        );


    if (mainContent) {

        mainContent.scrollTop =
            0;

    }


    window.scrollTo(
        0,
        0
    );

}


// =====================================
// Navigation
// =====================================

function initializeNavigation() {

    console.log(
        "🧭 Initializing navigation..."
    );


    const navItems =
        document.querySelectorAll(
            ".nav-item[data-page]"
        );


    navItems.forEach(
        button => {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();
                    event.stopPropagation();


                    const page =
                        this.dataset.page;


                    if (page) {

                        showPage(
                            page
                        );

                    }

                }
            );

        }
    );


    const pageButtons =
        document.querySelectorAll(
            "[data-page]:not(.nav-item)"
        );


    pageButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    const page =
                        this.dataset.page;


                    if (page) {

                        showPage(
                            page
                        );

                    }

                }
            );

        }
    );


    showPage(
        currentPage
    );


    console.log(
        "✅ Navigation initialized"
    );

}


// =====================================
// Header Back Button
// =====================================

function initializeBackButton() {

    const backButton =
        document.getElementById(
            "header-back"
        );


    if (!backButton) {
        return;
    }


    backButton.addEventListener(
        "click",
        () => {

            showPage(
                "dashboard"
            );

        }
    );

}


// =====================================
// Notification Button
// =====================================

function initializeNotificationButton() {

    const button =
        document.getElementById(
            "notification-button"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            showPage(
                "notifications"
            );

        }
    );

}


// =====================================
// Dashboard Actions
// =====================================

function initializeActions() {

    const actionButtons =
        document.querySelectorAll(
            "[data-action]"
        );


    actionButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    const action =
                        this.dataset.action;


                    console.log(
                        "Action:",
                        action
                    );


                    switch (action) {

                        case "deposit":

                            showToast(
                                "صفحه افزایش موجودی به‌زودی آماده می‌شود."
                            );

                            break;


                        case "withdraw":

                            showPage(
                                "withdraw"
                            );

                            break;


                        case "transfer":

                            showToast(
                                "صفحه انتقال به‌زودی آماده می‌شود."
                            );

                            break;


                        default:

                            console.log(
                                "Unknown action:",
                                action
                            );

                    }

                }
            );

        }
    );

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

    const toastMessage =
        document.getElementById(
            "toast-message"
        );


    if (
        !toast ||
        !toastMessage
    ) {

        return;

    }


    toastMessage.textContent =
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
// Load Wallet
// =====================================

async function loadWallet(
    userId
) {

    if (!userId) {

        console.warn(
            "⚠️ User ID unavailable for wallet."
        );

        return null;

    }


    try {

        const data =
            await apiFetch(
                `/api/wallet/${encodeURIComponent(userId)}`
            );


        console.log(
            "💰 Wallet:",
            data
        );


        const wallet =
            data?.wallet ||
            data?.data ||
            data;


        appState.wallet =
            wallet || null;


        return wallet;

    }

    catch (error) {

        console.error(
            "❌ Wallet loading failed:",
            error
        );


        return null;

    }

}


// =====================================
// Load Trades
// =====================================

async function loadTrades(
    userId
) {

    if (!userId) {

        return [];

    }


    try {

        const data =
            await apiFetch(
                `/api/trades/${encodeURIComponent(userId)}`
            );


        console.log(
            "📊 Trades:",
            data
        );


        let trades =
            data?.trades ||
            data?.data ||
            data;


        if (!Array.isArray(trades)) {

            trades = [];

        }


        appState.trades =
            trades;


        return trades;

    }

    catch (error) {

        console.error(
            "❌ Trades loading failed:",
            error
        );


        appState.trades =
            [];


        return [];

    }

}


// =====================================
// Load Bot
// =====================================

async function loadBot(
    userId
) {

    if (!userId) {

        return null;

    }


    try {

        const data =
            await apiFetch(
                `/api/bot/${encodeURIComponent(userId)}`
            );


        console.log(
            "🤖 Bot:",
            data
        );


        const bot =
            data?.bot ||
            data?.data ||
            data;


        appState.bot =
            bot || null;


        return bot;

    }

    catch (error) {

        console.error(
            "❌ Bot loading failed:",
            error
        );


        return null;

    }

}


// =====================================
// Load Exchange Rate
// =====================================

async function loadExchangeRate() {

    try {

        const data =
            await apiFetch(
                "/api/currency/exchange-rate"
            );


        console.log(
            "💱 Exchange rate:",
            data
        );


        const rate =
            data?.rate ||
            data?.exchangeRate ||
            data?.usdToToman ||
            data?.usdToIrr ||
            data?.data?.rate ||
            data?.data?.exchangeRate;


        const numericRate =
            safeNumber(
                rate
            );


        if (
            numericRate > 0
        ) {

            appState.exchangeRate =
                numericRate;

        }


        return appState.exchangeRate;

    }

    catch (error) {

        console.warn(
            "⚠️ Exchange rate unavailable:",
            error
        );


        appState.exchangeRate =
            0;


        return 0;

    }

}


// =====================================
// Get Wallet Balance
// =====================================

function getWalletBalance(
    wallet
) {

    if (!wallet) {
        return 0;
    }


    return safeNumber(

        wallet.balance ??
        wallet.balanceUSDT ??
        wallet.usdtBalance ??
        wallet.amount ??
        0

    );

}


// =====================================
// Get Wallet Profit
// =====================================

function getWalletProfit(
    wallet
) {

    if (!wallet) {
        return 0;
    }


    return safeNumber(

        wallet.totalProfit ??
        wallet.profit ??
        wallet.total_profit ??
        0

    );

}


// =====================================
// Get Available Balance
// =====================================

function getAvailableBalance(
    wallet
) {

    if (!wallet) {
        return 0;
    }


    return safeNumber(

        wallet.withdrawable ??
        wallet.available ??
        wallet.availableBalance ??
        wallet.balance ??
        0

    );

}


// =====================================
// Calculate Trade Profit
// =====================================

function getTradeProfit(
    trade
) {

    if (!trade) {
        return 0;
    }


    return safeNumber(

        trade.profit ??
        trade.pnl ??
        trade.profitLoss ??
        0

    );

}


// =====================================
// Calculate Total Profit
// =====================================

function calculateTotalProfit(
    trades
) {

    if (
        !Array.isArray(trades)
    ) {

        return 0;

    }


    return trades.reduce(
        (
            total,
            trade
        ) => {

            return (
                total +
                getTradeProfit(
                    trade
                )
            );

        },
        0
    );

}


// =====================================
// Calculate Today Profit
// =====================================

function calculateTodayProfit(
    trades
) {

    if (
        !Array.isArray(trades)
    ) {

        return 0;

    }


    const now =
        new Date();


    const year =
        now.getFullYear();

    const month =
        now.getMonth();

    const day =
        now.getDate();


    return trades.reduce(
        (
            total,
            trade
        ) => {

            const dateValue =

                trade.closedAt ||
                trade.updatedAt ||
                trade.createdAt ||
                trade.date;


            if (!dateValue) {

                return total;

            }


            const date =
                new Date(
                    dateValue
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return total;

            }


            if (
                date.getFullYear() ===
                year &&
                date.getMonth() ===
                month &&
                date.getDate() ===
                day
            ) {

                return (
                    total +
                    getTradeProfit(
                        trade
                    )
                );

            }


            return total;

        },
        0
    );

}


// =====================================
// Calculate Success Rate
// =====================================

function calculateSuccessRate(
    trades
) {

    if (
        !Array.isArray(trades) ||
        trades.length === 0
    ) {

        return 0;

    }


    const closedTrades =
        trades.filter(
            trade => {

                return (
                    String(
                        trade.status ||
                        ""
                    ).toUpperCase() ===
                    "CLOSED"
                );

            }
        );


    if (
        closedTrades.length === 0
    ) {

        return 0;

    }


    const successfulTrades =
        closedTrades.filter(
            trade => {

                return (
                    getTradeProfit(
                        trade
                    ) > 0
                );

            }
        );


    return (
        successfulTrades.length /
        closedTrades.length *
        100
    );

}


// =====================================
// Update Dashboard
// =====================================

function updateDashboard() {

    const wallet =
        appState.wallet || {};

    const trades =
        appState.trades || [];

    const bot =
        appState.bot || {};


    // ---------------------------------
    // Wallet
    // ---------------------------------

    const balance =
        getWalletBalance(
            wallet
        );


    const walletProfit =
        getWalletProfit(
            wallet
        );


    const totalProfit =
        walletProfit !== 0
            ? walletProfit
            : calculateTotalProfit(
                trades
            );


    const todayProfit =
        calculateTodayProfit(
            trades
        );


    const availableBalance =
        getAvailableBalance(
            wallet
        );


    // ---------------------------------
    // Success Rate
    // ---------------------------------

    const successRate =
        calculateSuccessRate(
            trades
        );


    // ---------------------------------
    // Dashboard Balance
    // ---------------------------------

    const dashboardBalanceUSD =
        document.getElementById(
            "dashboard-balance-usd"
        );


    if (dashboardBalanceUSD) {

        dashboardBalanceUSD.textContent =
            formatUSD(
                balance
            );

    }


    const dashboardBalanceIRR =
        document.getElementById(
            "dashboard-balance-irr"
        );


    if (dashboardBalanceIRR) {

        const toman =
            usdToToman(
                balance
            );


        dashboardBalanceIRR.textContent =

            appState.exchangeRate > 0

                ? `معادل تومان: ${formatTomanValue(toman)}`

                : "معادل تومان: —";

    }


    // ---------------------------------
    // Today Profit
    // ---------------------------------

    const todayProfitUSD =
        document.getElementById(
            "today-profit-usd"
        );


    if (todayProfitUSD) {

        todayProfitUSD.textContent =
            `$${formatUSD(todayProfit)}`;

    }


    const todayProfitIRR =
        document.getElementById(
            "today-profit-irr"
        );


    if (todayProfitIRR) {

        const toman =
            usdToToman(
                todayProfit
            );


        todayProfitIRR.textContent =

            appState.exchangeRate > 0

                ? `معادل تومان: ${formatTomanValue(toman)}`

                : "معادل تومان: —";

    }


    // ---------------------------------
    // Total Profit
    // ---------------------------------

    const totalProfitUSD =
        document.getElementById(
            "total-profit-usd"
        );


    if (totalProfitUSD) {

        totalProfitUSD.textContent =
            `$${formatUSD(totalProfit)}`;

    }


    const totalProfitIRR =
        document.getElementById(
            "total-profit-irr"
        );


    if (totalProfitIRR) {

        const toman =
            usdToToman(
                totalProfit
            );


        totalProfitIRR.textContent =

            appState.exchangeRate > 0

                ? `معادل تومان: ${formatTomanValue(toman)}`

                : "معادل تومان: —";

    }


    // ---------------------------------
    // Success Rate
    // ---------------------------------

    const successRateElement =
        document.getElementById(
            "success-rate"
        );


    if (successRateElement) {

        successRateElement.textContent =
            `${successRate.toFixed(1)}%`;

    }


    // ---------------------------------
    // Total Trades
    // ---------------------------------

    const totalTradesElement =
        document.getElementById(
            "total-trades"
        );


    if (totalTradesElement) {

        totalTradesElement.textContent =
            formatInteger(
                trades.length
            );

    }


    // ---------------------------------
    // AI Strategy
    // ---------------------------------

    const strategy =
        bot.strategy ||
        "AI Scalping";


    const aiStrategy =
        document.getElementById(
            "ai-strategy"
        );


    if (aiStrategy) {

        aiStrategy.textContent =
            strategy;

    }


    // ---------------------------------
    // AI Accuracy
    // ---------------------------------

    const accuracy =
        safeNumber(
            bot.accuracy ??
            bot.confidence ??
            0
        );


    const aiAccuracy =
        document.getElementById(
            "ai-accuracy"
        );


    if (aiAccuracy) {

        aiAccuracy.textContent =

            accuracy > 0
                ? `${accuracy}%`
                : "—";

    }


    // ---------------------------------
    // AI Status
    // ---------------------------------

    const botStatus =
        String(
            bot.status ||
            "STOPPED"
        ).toUpperCase();


    const aiStatus =
        document.getElementById(
            "ai-status"
        );


    const aiMode =
        document.getElementById(
            "ai-mode"
        );


    if (
        botStatus ===
        "ACTIVE"
    ) {

        if (aiStatus) {

            aiStatus.textContent =
                "فعال";

        }


        if (aiMode) {

            aiMode.textContent =
                "در حال معامله";

        }

    }

    else {

        if (aiStatus) {

            aiStatus.textContent =
                "متوقف";

        }


        if (aiMode) {

            aiMode.textContent =
                "متوقف";

        }

    }


    // ---------------------------------
    // Wallet Page
    // ---------------------------------

    const walletBalanceUSD =
        document.getElementById(
            "wallet-balance-usd"
        );


    if (walletBalanceUSD) {

        walletBalanceUSD.textContent =
            formatUSD(
                balance
            );

    }


    const walletBalanceIRR =
        document.getElementById(
            "wallet-balance-irr"
        );


    if (walletBalanceIRR) {

        walletBalanceIRR.textContent =

            appState.exchangeRate > 0

                ? `معادل تومان: ${formatTomanValue(usdToToman(balance))}`

                : "معادل تومان: —";

    }


    const walletAvailableUSD =
        document.getElementById(
            "wallet-available-usd"
        );


    if (walletAvailableUSD) {

        walletAvailableUSD.textContent =
            formatUSD(
                availableBalance
            );

    }


    const walletAvailableIRR =
        document.getElementById(
            "wallet-available-irr"
        );


    if (walletAvailableIRR) {

        walletAvailableIRR.textContent =

            appState.exchangeRate > 0

                ? `معادل تومان: ${formatTomanValue(usdToToman(availableBalance))}`

                : "معادل تومان: —";

    }


    // ---------------------------------
    // Wallet Summary
    // ---------------------------------

    const summaryBalance =
        document.getElementById(
            "wallet-summary-balance"
        );


    if (summaryBalance) {

        summaryBalance.textContent =
            `$${formatUSD(balance)}`;

    }


    const summaryProfit =
        document.getElementById(
            "wallet-summary-profit"
        );


    if (summaryProfit) {

        summaryProfit.textContent =
            `$${formatUSD(totalProfit)}`;

    }


    const summaryTotal =
        document.getElementById(
            "wallet-summary-total"
        );


    if (summaryTotal) {

        summaryTotal.textContent =
            `$${formatUSD(balance + totalProfit)}`;

    }


    // ---------------------------------
    // Withdraw
    // ---------------------------------

    const withdrawAvailable =
        document.getElementById(
            "withdraw-available-usd"
        );


    if (withdrawAvailable) {

        withdrawAvailable.textContent =
            formatUSD(
                availableBalance
            );

    }


    const withdrawAvailableIRR =
        document.getElementById(
            "withdraw-available-irr"
        );


    if (withdrawAvailableIRR) {

        withdrawAvailableIRR.textContent =

            appState.exchangeRate > 0

                ? `معادل تومان: ${formatTomanValue(usdToToman(availableBalance))}`

                : "معادل تومان: —";

    }


    // ---------------------------------
    // Profile
    // ---------------------------------

    updateProfile();

}


// =====================================
// Update Profile
// =====================================

function updateProfile() {

    const user =
        appState.user;


    if (!user) {
        return;
    }


    const firstName =
        user.firstName ||
        user.first_name ||
        "";


    const lastName =
        user.lastName ||
        user.last_name ||
        "";


    const username =
        user.username ||
        "";


    const fullName =
        `${firstName} ${lastName}`
            .trim() ||
        username ||
        "کاربر";


    const profileName =
        document.getElementById(
            "profile-name"
        );


    if (profileName) {

        profileName.textContent =
            fullName;

    }


    const profileUsername =
        document.getElementById(
            "profile-username"
        );


    if (profileUsername) {

        profileUsername.textContent =
            username
                ? `@${username}`
                : "Telegram User";

    }


    const avatar =
        document.getElementById(
            "profile-avatar"
        );


    if (avatar) {

        avatar.textContent =
            (
                firstName ||
                username ||
                "U"
            )
                .charAt(0)
                .toUpperCase();

    }


    const profileStatus =
        document.getElementById(
            "profile-status"
        );


    if (profileStatus) {

        profileStatus.textContent =
            user.status ||
            (
                user.accessEnabled
                    ? "فعال"
                    : "تأیید شده"
            );

    }

}


// =====================================
// Update Recent Trades
// =====================================

function updateRecentTrades() {

    const container =
        document.getElementById(
            "dashboard-trades"
        );


    if (!container) {
        return;
    }


    const trades =
        Array.isArray(
            appState.trades
        )
            ? appState.trades
            : [];


    if (
        trades.length === 0
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


    const recentTrades =
        trades.slice(
            0,
            5
        );


    container.classList.remove(
        "empty-state"
    );


    container.innerHTML =
        recentTrades
            .map(
                trade => {

                    const symbol =
                        trade.symbol ||
                        "UNKNOWN";


                    const type =
                        String(
                            trade.type ||
                            "WAIT"
                        ).toUpperCase();


                    const profit =
                        getTradeProfit(
                            trade
                        );


                    const status =
                        String(
                            trade.status ||
                            ""
                        ).toUpperCase();


                    return `

                        <div class="trade-row">

                            <div>

                                <strong>
                                    ${symbol}
                                </strong>

                                <small>
                                    ${type}
                                    ${status ? ` • ${status}` : ""}
                                </small>

                            </div>

                            <strong>
                                ${profit >= 0 ? "+" : ""}
                                $${formatUSD(profit)}
                            </strong>

                        </div>

                    `;

                }
            )
            .join("");

}


// =====================================
// Initialize Dashboard
// =====================================

async function initializeDashboard(
    user
) {

    console.log(
        "📊 Loading Dashboard..."
    );


    const userId =
        getUserId(
            user
        );


    console.log(
        "👤 Dashboard User ID:",
        userId
    );


    if (!userId) {

        console.warn(
            "⚠️ User ID not found."
        );

        return;

    }


    // ---------------------------------
    // Load All Data
    // ---------------------------------

    await Promise.allSettled([

        loadWallet(
            userId
        ),

        loadTrades(
            userId
        ),

        loadBot(
            userId
        ),

        loadExchangeRate()

    ]);


    // ---------------------------------
    // Update UI
    // ---------------------------------

    updateDashboard();

    updateRecentTrades();


    console.log(
        "✅ Dashboard loaded successfully."
    );


    console.log(
        "📦 Application State:",
        appState
    );

}


// =====================================
// AI Trading Button
// =====================================

function initializeAITradingButton() {

    const button =
        document.getElementById(
            "ai-trading-button"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async () => {

            const userId =
                getUserId(
                    appState.user
                );


            if (!userId) {

                showToast(
                    "کاربر احراز هویت نشده است."
                );

                return;

            }


            button.disabled =
                true;


            const originalText =
                button.textContent;


            button.textContent =
                "در حال فعال‌سازی...";


            try {

                const result =
                    await apiFetch(
                        `/api/bot/start/${encodeURIComponent(userId)}`,
                        {
                            method: "POST"
                        }
                    );


                console.log(
                    "🤖 Bot started:",
                    result
                );


                appState.bot =
                    result?.bot ||
                    result?.data ||
                    result;


                updateDashboard();


                showToast(
                    "معاملات AI فعال شد ✅"
                );

            }

            catch (error) {

                console.error(
                    "❌ Failed to start AI trading:",
                    error
                );


                showToast(
                    error?.message ||
                    "فعال‌سازی معاملات AI انجام نشد."
                );

            }

            finally {

                button.disabled =
                    false;

                button.textContent =
                    originalText;

            }

        }
    );

}


// =====================================
// Initialize Withdraw
// =====================================

function initializeWithdraw() {

    const form =
        document.getElementById(
            "withdraw-form"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const amountInput =
                document.getElementById(
                    "withdraw-amount"
                );


            const networkInput =
                document.getElementById(
                    "withdraw-network"
                );


            const addressInput =
                document.getElementById(
                    "withdraw-address"
                );


            const amount =
                safeNumber(
                    amountInput?.value
                );


            const network =
                networkInput?.value ||
                "";


            const address =
                addressInput?.value?.trim() ||
                "";


            if (
                amount <= 0
            ) {

                showToast(
                    "مبلغ برداشت را وارد کنید."
                );

                return;

            }


            if (!network) {

                showToast(
                    "شبکه برداشت را انتخاب کنید."
                );

                return;

            }


            if (!address) {

                showToast(
                    "آدرس کیف پول را وارد کنید."
                );

                return;

            }


            showToast(
                "درخواست برداشت در حال ارسال است..."
            );


            try {

                const userId =
                    getUserId(
                        appState.user
                    );


                const result =
                    await apiFetch(
                        "/api/withdraw",
                        {

                            method: "POST",

                            body:
                                JSON.stringify({

                                    userId,

                                    amount,

                                    network,

                                    address

                                })

                        }
                    );


                console.log(
                    "💸 Withdraw:",
                    result
                );


                showToast(
                    result?.message ||
                    "درخواست برداشت ثبت شد."
                );

            }

            catch (error) {

                console.error(
                    "❌ Withdraw error:",
                    error
                );


                showToast(
                    error?.message ||
                    "ثبت درخواست برداشت ناموفق بود."
                );

            }

        }
    );

}


// =====================================
// Initialize App
// =====================================

async function initializeApp() {

    try {

        console.log(
            "====================================="
        );

        console.log(
            "🚀 AutoTrade AI Mini App"
        );

        console.log(
            "====================================="
        );


        // ---------------------------------
        // Initialize UI
        // ---------------------------------

        initializeNavigation();

        initializeBackButton();

        initializeNotificationButton();

        initializeActions();

        initializeAITradingButton();

        initializeWithdraw();


        // ---------------------------------
        // Show Loading
        // ---------------------------------

        showLoadingScreen();


        // ---------------------------------
        // Telegram Authentication
        // ---------------------------------

        const user =
            await authenticateTelegram();


        window.currentUser =
            user;


        console.log(
            "👤 Current user:",
            user
        );


        // ---------------------------------
        // Authentication Event
        // ---------------------------------

        window.dispatchEvent(

            new CustomEvent(
                "autotrade:authenticated",
                {

                    detail:
                        user

                }
            )

        );


        // ---------------------------------
        // Dashboard
        // ---------------------------------

        await initializeDashboard(
            user
        );


        // ---------------------------------
        // Hide Loading
        // ---------------------------------

        hideLoadingScreen();


        // ---------------------------------
        // Dashboard
        // ---------------------------------

        showPage(
            "dashboard"
        );


        console.log(
            "====================================="
        );

        console.log(
            "🚀 AutoTrade AI initialized successfully."
        );

        console.log(
            "====================================="
        );

    }

    catch (error) {

        console.error(
            "❌ Application initialization failed:",
            error
        );


        window.currentUser =
            null;


        appState.authenticated =
            false;


        hideLoadingScreen();


        window.dispatchEvent(

            new CustomEvent(
                "autotrade:auth-error",
                {

                    detail: {

                        message:
                            error?.message ||
                            "Authentication failed."

                    }

                }
            )

        );


        if (tg) {

            try {

                tg.showAlert(

                    "Authentication failed.\n\n" +
                    (
                        error?.message ||
                        "Unknown error"
                    )

                );

            }

            catch (alertError) {

                console.error(
                    "Telegram alert error:",
                    alertError
                );

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

    initializeDashboard,

    showPage,

    showToast,

    updateDashboard,

    appState

};


// =====================================
// Global Dashboard Hook
// =====================================

window.initializeDashboard =
    initializeDashboard;


// =====================================
// Start Application
// =====================================

initializeApp();