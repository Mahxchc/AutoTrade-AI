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
// Telegram Init Data
// =====================================

const telegramInitData =
    tg?.initData || "";


// =====================================
// Application State
// =====================================

let currentPage = "dashboard";

let currentUser = null;

let currentWallet = null;

let currentBot = null;

let currentTrades = [];

let usdToTomanRate = 0;


// =====================================
// DOM Helper
// =====================================

function $(id) {

    return document.getElementById(id);

}


// =====================================
// Safe Number
// =====================================

function numberValue(value, fallback = 0) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


// =====================================
// Format USD
// =====================================

function formatUSD(value) {

    const number =
        numberValue(value);

    return number.toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


// =====================================
// Format Number
// =====================================

function formatNumber(value) {

    return numberValue(value)
        .toLocaleString("en-US");

}


// =====================================
// Format Toman
// =====================================

function formatToman(value) {

    return numberValue(value)
        .toLocaleString(
            "fa-IR"
        ) + " تومان";

}


// =====================================
// Loading Screen
// =====================================

function showLoadingScreen() {

    const element =
        $("loading-screen");

    if (!element) return;

    element.classList.remove(
        "hidden"
    );

    element.style.display =
        "flex";

}


function hideLoadingScreen() {

    const element =
        $("loading-screen");

    if (!element) return;

    element.classList.add(
        "hidden"
    );

    element.style.display =
        "none";

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
            `API error ${response.status}`
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
            "Telegram authentication data is missing."
        );

    }


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
        !result.user
    ) {

        throw new Error(
            result?.message ||
            "Telegram authentication failed."
        );

    }


    return result.user;

}


// =====================================
// Currency
// =====================================

async function loadCurrencyRate() {

    try {

        const result =
            await apiFetch(
                "/api/currency/usd-toman"
            );


        usdToTomanRate =
            numberValue(
                result?.currency?.usdToTomanRate
            );


        console.log(
            "💱 USD/Toman:",
            usdToTomanRate
        );

    }

    catch (error) {

        console.error(
            "Currency error:",
            error
        );

        usdToTomanRate = 0;

    }

}


// =====================================
// USD → Toman
// =====================================

function usdToToman(
    usd
) {

    if (
        !usdToTomanRate
    ) {

        return 0;

    }


    return (
        numberValue(usd) *
        usdToTomanRate
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
            "Wallet skipped: userId missing"
        );

        return null;

    }


    try {

        const result =
            await apiFetch(
                `/api/wallet/${encodeURIComponent(userId)}`
            );


        if (
            result?.success &&
            result?.wallet
        ) {

            currentWallet =
                result.wallet;

            console.log(
                "💰 Wallet:",
                currentWallet
            );

            updateWalletUI(
                currentWallet
            );

            return currentWallet;

        }

    }

    catch (error) {

        console.error(
            "Wallet error:",
            error
        );

    }


    return null;

}


// =====================================
// Update Wallet UI
// =====================================

function updateWalletUI(
    wallet
) {

    if (!wallet) return;


    const balance =
        numberValue(
            wallet.balanceUSD
        );


    const profit =
        numberValue(
            wallet.totalProfitUSD
        );


    const withdrawable =
        numberValue(
            wallet.withdrawableUSD
        );


    // ---------------------------------
    // Dashboard Balance
    // ---------------------------------

    if ($("dashboard-balance-usd")) {

        $("dashboard-balance-usd")
            .textContent =
            formatUSD(balance);

    }


    if ($("dashboard-balance-irr")) {

        const toman =
            wallet.balanceToman ??
            usdToToman(balance);

        $("dashboard-balance-irr")
            .textContent =
            `معادل تومان: ${formatToman(toman)}`;

    }


    // ---------------------------------
    // Wallet
    // ---------------------------------

    if ($("wallet-balance-usd")) {

        $("wallet-balance-usd")
            .textContent =
            formatUSD(balance);

    }


    if ($("wallet-balance-irr")) {

        const toman =
            wallet.balanceToman ??
            usdToToman(balance);

        $("wallet-balance-irr")
            .textContent =
            `معادل تومان: ${formatToman(toman)}`;

    }


    if ($("wallet-available-usd")) {

        $("wallet-available-usd")
            .textContent =
            formatUSD(withdrawable);

    }


    if ($("wallet-available-irr")) {

        const toman =
            wallet.withdrawableToman ??
            usdToToman(withdrawable);

        $("wallet-available-irr")
            .textContent =
            `معادل تومان: ${formatToman(toman)}`;

    }


    // ---------------------------------
    // Dashboard Profit
    // ---------------------------------

    if ($("total-profit-usd")) {

        $("total-profit-usd")
            .textContent =
            `$${formatUSD(profit)}`;

    }


    if ($("total-profit-irr")) {

        const toman =
            wallet.totalProfitToman ??
            usdToToman(profit);

        $("total-profit-irr")
            .textContent =
            `معادل تومان: ${formatToman(toman)}`;

    }


    // ---------------------------------
    // Trades Count
    // ---------------------------------

    if ($("total-trades")) {

        $("total-trades")
            .textContent =
            formatNumber(
                wallet.totalTrades
            );

    }


    // ---------------------------------
    // Wallet Summary
    // ---------------------------------

    if ($("wallet-summary-balance")) {

        $("wallet-summary-balance")
            .textContent =
            `$${formatUSD(balance)}`;

    }


    if ($("wallet-summary-profit")) {

        $("wallet-summary-profit")
            .textContent =
            `$${formatUSD(profit)}`;

    }


    if ($("wallet-summary-total")) {

        $("wallet-summary-total")
            .textContent =
            `$${formatUSD(balance + profit)}`;

    }


    // ---------------------------------
    // Withdraw
    // ---------------------------------

    if ($("withdraw-available-usd")) {

        $("withdraw-available-usd")
            .textContent =
            formatUSD(withdrawable);

    }


    if ($("withdraw-available-irr")) {

        $("withdraw-available-irr")
            .textContent =
            `معادل تومان: ${formatToman(
                usdToToman(withdrawable)
            )}`;

    }


}


// =====================================
// Load Bot
// =====================================

async function loadBot(
    userId
) {

    if (!userId) return null;


    try {

        const result =
            await apiFetch(
                `/api/bot/${encodeURIComponent(userId)}`
            );


        if (
            result?.success &&
            result?.bot
        ) {

            currentBot =
                result.bot;

            console.log(
                "🤖 Bot:",
                currentBot
            );

            updateBotUI(
                currentBot
            );

            return currentBot;

        }

    }

    catch (error) {

        console.error(
            "Bot error:",
            error
        );

    }


    return null;

}


// =====================================
// Update Bot UI
// =====================================

function updateBotUI(
    bot
) {

    if (!bot) return;


    const strategy =
        bot.strategy ||
        "AI Scalping";


    const status =
        bot.status ||
        "STOPPED";


    const accuracy =
        numberValue(
            bot.accuracy
        );


    // ---------------------------------
    // Strategy
    // ---------------------------------

    if ($("ai-strategy")) {

        $("ai-strategy")
            .textContent =
            strategy;

    }


    // ---------------------------------
    // Accuracy
    // ---------------------------------

    if ($("ai-accuracy")) {

        $("ai-accuracy")
            .textContent =
            `${formatNumber(accuracy)}%`;

    }


    // ---------------------------------
    // Status
    // ---------------------------------

    if ($("ai-status")) {

        $("ai-status")
            .textContent =
            status === "ACTIVE"
                ? "فعال"
                : status === "PAUSED"
                    ? "متوقف موقت"
                    : "متوقف";

    }


    if ($("ai-mode")) {

        $("ai-mode")
            .textContent =
            status === "ACTIVE"
                ? "در حال معامله"
                : "آماده";

    }


    // ---------------------------------
    // Trading Button
    // ---------------------------------

    const button =
        $("ai-trading-button");


    if (!button) return;


    if (
        status === "ACTIVE"
    ) {

        button.textContent =
            "توقف معاملات AI";

        button.dataset.botState =
            "active";

    }

    else {

        button.textContent =
            "شروع معاملات AI";

        button.dataset.botState =
            "stopped";

    }

}


// =====================================
// Start / Stop Bot
// =====================================

async function toggleBot() {

    if (!currentUser) {

        showToast(
            "کاربر احراز هویت نشده است."
        );

        return;

    }


    const userId =
        currentUser._id ||
        currentUser.id;


    if (!userId) {

        showToast(
            "شناسه کاربر پیدا نشد."
        );

        return;

    }


    const button =
        $("ai-trading-button");


    if (button) {

        button.disabled =
            true;

    }


    try {

        const active =
            currentBot?.status ===
            "ACTIVE";


        const endpoint =
            active
                ? `/api/bot/stop/${encodeURIComponent(userId)}`
                : `/api/bot/start/${encodeURIComponent(userId)}`;


        const result =
            await apiFetch(
                endpoint,
                {
                    method: "POST"
                }
            );


        if (
            result?.success
        ) {

            currentBot =
                result.bot ||
                currentBot;

            updateBotUI(
                currentBot
            );


            showToast(
                active
                    ? "معاملات AI متوقف شد."
                    : "معاملات AI شروع شد."
            );

        }

    }

    catch (error) {

        console.error(
            "Bot toggle error:",
            error
        );


        showToast(
            error.message ||
            "عملیات ربات انجام نشد."
        );

    }

    finally {

        if (button) {

            button.disabled =
                false;

        }

    }

}


// =====================================
// Load Trades
// =====================================

async function loadTrades(
    userId
) {

    if (!userId) return;


    try {

        const result =
            await apiFetch(
                `/api/trades/${encodeURIComponent(userId)}`
            );


        const trades =
            Array.isArray(result)
                ? result
                : Array.isArray(result?.trades)
                    ? result.trades
                    : [];


        currentTrades =
            trades;


        renderDashboardTrades(
            trades
        );


        renderTrades(
            trades
        );


        calculateSuccessRate(
            trades
        );

    }

    catch (error) {

        console.error(
            "Trades error:",
            error
        );

    }

}


// =====================================
// Success Rate
// =====================================

function calculateSuccessRate(
    trades
) {

    const element =
        $("success-rate");


    if (!element) return;


    const closed =
        trades.filter(
            trade =>
                String(
                    trade.status || ""
                ).toUpperCase() ===
                "CLOSED"
        );


    if (!closed.length) {

        element.textContent =
            "0%";

        return;

    }


    const wins =
        closed.filter(
            trade =>
                numberValue(
                    trade.profit
                ) > 0
        );


    const rate =
        (
            wins.length /
            closed.length
        ) * 100;


    element.textContent =
        `${rate.toFixed(0)}%`;

}


// =====================================
// Dashboard Trades
// =====================================

function renderDashboardTrades(
    trades
) {

    const container =
        $("dashboard-trades");


    if (!container) return;


    if (!trades.length) {

        container.innerHTML = `
            <div class="empty-icon">—</div>
            <p>هنوز اطلاعات معاملاتی دریافت نشده است.</p>
        `;

        return;

    }


    const recent =
        trades.slice(
            0,
            3
        );


    container.classList.remove(
        "empty-state"
    );


    container.innerHTML =
        recent.map(
            trade => {

                const symbol =
                    trade.symbol ||
                    "نامشخص";


                const type =
                    trade.type ||
                    "WAIT";


                const profit =
                    numberValue(
                        trade.profit
                    );


                return `
                    <div class="trade-row">
                        <strong>${symbol}</strong>
                        <span>${type}</span>
                        <strong>
                            ${profit >= 0 ? "+" : ""}
                            $${formatUSD(profit)}
                        </strong>
                    </div>
                `;

            }
        ).join("");

}


// =====================================
// Trades Page
// =====================================

function renderTrades(
    trades
) {

    const container =
        $("trades-list");


    if (!container) return;


    if (!trades.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">—</div>
                <p>معامله‌ای برای نمایش وجود ندارد.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        trades.map(
            trade => {

                const symbol =
                    trade.symbol ||
                    "نامشخص";


                const type =
                    trade.type ||
                    "—";


                const status =
                    trade.status ||
                    "—";


                const profit =
                    numberValue(
                        trade.profit
                    );


                return `
                    <div class="trade-row">
                        <strong>${symbol}</strong>
                        <span>${type}</span>
                        <span>${status}</span>
                        <strong>
                            ${profit >= 0 ? "+" : ""}
                            $${formatUSD(profit)}
                        </strong>
                    </div>
                `;

            }
        ).join("");

}


// =====================================
// Profile UI
// =====================================

function updateProfileUI(
    user
) {

    if (!user) return;


    const firstName =
        user.firstName ||
        user.first_name ||
        "کاربر";


    const lastName =
        user.lastName ||
        user.last_name ||
        "";


    const fullName =
        `${firstName} ${lastName}`
            .trim();


    const username =
        user.username
            ? `@${String(
                user.username
            ).replace(
                /^@/,
                ""
            )}`
            : "بدون نام کاربری";


    // ---------------------------------
    // Name
    // ---------------------------------

    if ($("profile-name")) {

        $("profile-name")
            .textContent =
            fullName;

    }


    // ---------------------------------
    // Username
    // ---------------------------------

    if ($("profile-username")) {

        $("profile-username")
            .textContent =
            username;

    }


    // ---------------------------------
    // Avatar
    // ---------------------------------

    if ($("profile-avatar")) {

        $("profile-avatar")
            .textContent =
            firstName
                .charAt(0)
                .toUpperCase();

    }


    // ---------------------------------
    // Status
    // ---------------------------------

    if ($("profile-status")) {

        const active =
            user.status ===
            "ACTIVE";


        $("profile-status")
            .textContent =
            active
                ? "فعال"
                : "در انتظار تأیید";

    }

}


// =====================================
// Navigation
// =====================================

function showPage(
    pageName
) {

    const target =
        $(`page-${pageName}`);


    if (!target) return;


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

        dashboard: "داشبورد",
        wallet: "کیف پول",
        trades: "معاملات",
        analytics: "تحلیل‌ها",
        notifications: "اعلان‌ها",
        profile: "پروفایل",
        withdraw: "برداشت"

    };


    if ($("page-title")) {

        $("page-title")
            .textContent =
            titles[pageName] ||
            "AutoTrade AI";

    }


    currentPage =
        pageName;


    window.scrollTo(
        0,
        0
    );

}


// =====================================
// Navigation Events
// =====================================

function initializeNavigation() {

    document
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(
            element => {

                element.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        event.stopPropagation();


                        const page =
                            element.dataset.page;


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

}


// =====================================
// Profile Buttons
// =====================================

function initializeProfileButtons() {

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
                            button.dataset.profileAction;


                        const messages = {

                            account:
                                "اطلاعات حساب کاربری در حال آماده‌سازی است.",

                            security:
                                "تنظیمات امنیتی در حال آماده‌سازی است.",

                            referral:
                                "برنامه معرفی دوستان در حال آماده‌سازی است.",

                            support:
                                "بخش پشتیبانی در حال آماده‌سازی است.",

                            about:
                                "AutoTrade AI — پلتفرم معاملات هوشمند."

                        };


                        showToast(
                            messages[action] ||
                            "این بخش به‌زودی آماده می‌شود."
                        );

                    }
                );

            }
        );

}


// =====================================
// Header Back
// =====================================

function initializeBackButton() {

    const button =
        $("header-back");


    if (!button) return;


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
// Notifications
// =====================================

function initializeNotifications() {

    const button =
        $("notification-button");


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
        $("mark-notifications-read");


    if (markRead) {

        markRead.addEventListener(
            "click",
            () => {

                const badge =
                    $("notification-badge");


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
// Actions
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
                            button.dataset.action;


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
                                "بخش واریز به‌زودی فعال می‌شود."
                            );

                            return;

                        }


                        if (
                            action ===
                            "transfer"
                        ) {

                            showToast(
                                "بخش انتقال به‌زودی فعال می‌شود."
                            );

                        }

                    }
                );

            }
        );


    const botButton =
        $("ai-trading-button");


    if (botButton) {

        botButton.addEventListener(
            "click",
            toggleBot
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
        $("toast");


    const text =
        $("toast-message");


    if (!toast || !text) {

        return;

    }


    text.textContent =
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
// Dashboard Loader
// =====================================

async function initializeDashboard(
    user
) {

    console.log(
        "📊 Loading dashboard..."
    );


    const userId =
        user?._id ||
        user?.id;


    if (!userId) {

        console.error(
            "User ID missing:",
            user
        );

        return;

    }


    updateProfileUI(
        user
    );


    await Promise.allSettled([

        loadCurrencyRate(),

        loadWallet(
            userId
        ),

        loadBot(
            userId
        ),

        loadTrades(
            userId
        )

    ]);


    // Update wallet again
    // after currency rate is ready

    if (currentWallet) {

        updateWalletUI(
            currentWallet
        );

    }


    console.log(
        "✅ Dashboard loaded"
    );

}


// =====================================
// Logout
// =====================================

function initializeLogout() {

    const button =
        $("logout-button");


    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            currentUser = null;

            currentWallet = null;

            currentBot = null;

            currentTrades = [];


            window.currentUser =
                null;


            showToast(
                "از حساب خارج شدید."
            );

        }
    );

}


// =====================================
// Main Initialization
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

        initializeProfileButtons();

        initializeBackButton();

        initializeNotifications();

        initializeActions();

        initializeLogout();


        showLoadingScreen();


        // ---------------------------------
        // Authenticate
        // ---------------------------------

        const user =
            await authenticateTelegram();


        currentUser =
            user;


        window.currentUser =
            user;


        console.log(
            "👤 Authenticated user:",
            user
        );


        // ---------------------------------
        // Dashboard
        // ---------------------------------

        await initializeDashboard(
            user
        );


        // ---------------------------------
        // Global Event
        // ---------------------------------

        window.dispatchEvent(

            new CustomEvent(
                "autotrade:authenticated",
                {
                    detail: user
                }
            )

        );


        hideLoadingScreen();


        showPage(
            "dashboard"
        );


        console.log(
            "🚀 AutoTrade AI initialized successfully."
        );

    }

    catch (error) {

        console.error(
            "❌ Application initialization failed:",
            error
        );


        currentUser =
            null;


        window.currentUser =
            null;


        hideLoadingScreen();


        if (tg) {

            try {

                tg.showAlert(
                    "خطا در اتصال به حساب کاربری\n\n" +
                    (
                        error?.message ||
                        "خطای نامشخص"
                    )
                );

            }

            catch {}

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

    loadWallet,

    loadBot,

    loadTrades,

    showPage,

    showToast

};


// =====================================
// Start
// =====================================

initializeApp();