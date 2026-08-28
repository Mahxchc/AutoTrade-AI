// =====================================
// AutoTrade AI Mini App :: M
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
// Current User
// =====================================

let currentUser = null;


// =====================================
// Current Page
// =====================================

let currentPage =
    "dashboard";


// =====================================
// Current Trade Filter
// =====================================

let currentTradeStatus =
    "open";


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

function formatNumber(
    value
) {

    return safeNumber(value)
        .toLocaleString(
            "en-US"
        );
}


// =====================================
// Format Percent
// =====================================

function formatPercent(
    value
) {

    const number =
        safeNumber(value);

    return `${number.toFixed(1)}%`;
}


// =====================================
// Format Toman
// =====================================

function formatToman(
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
            "Telegram authentication data is missing."
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
        result.user;


    console.log(
        "✅ Telegram authenticated:",
        result.user
    );


    return result.user;
}


// =====================================
// Get User ID
// =====================================

function getTelegramUserId() {

    return (

        currentUser?.telegramId ||

        currentUser?.telegram_id ||

        tg?.initDataUnsafe?.user?.id ||

        null

    );

}


// =====================================
// Get User Name
// =====================================

function getUserName() {

    return (

        currentUser?.firstName ||

        currentUser?.first_name ||

        currentUser?.username ||

        tg?.initDataUnsafe?.user?.first_name ||

        "کاربر"

    );

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


    targetPage.classList.add(
        "active"
    );

    targetPage.style.display =
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


    const pageTitle =
        document.getElementById(
            "page-title"
        );


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


    // ---------------------------------
    // Load page data
    // ---------------------------------

    if (pageName === "dashboard") {

        loadDashboard();

    }

    else if (pageName === "wallet") {

        loadWallet();

    }

    else if (pageName === "trades") {

        loadTrades(
            currentTradeStatus
        );

    }

    else if (pageName === "profile") {

        loadProfile();

    }

    else if (pageName === "withdraw") {

        loadWithdrawData();

    }

}


// =====================================
// Navigation Initialization
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

}


// =====================================
// Header Back Button
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
// Dashboard
// =====================================

async function loadDashboard() {

    const userId =
        getTelegramUserId();


    if (!userId) {

        console.warn(
            "Telegram user ID not available."
        );

        return;
    }


    try {

        const [
            wallet,
            bot,
            trades
        ] = await Promise.all([

            apiFetch(
                `/api/wallet/${userId}`
            ),

            apiFetch(
                `/api/bot/${userId}`
            ),

            apiFetch(
                `/api/trades/${userId}`
            )

        ]);


        updateDashboardWallet(
            wallet
        );


        updateDashboardBot(
            bot
        );


        updateDashboardTrades(
            trades
        );


        console.log(
            "✅ Dashboard loaded"
        );

    }

    catch (error) {

        console.error(
            "Dashboard loading error:",
            error
        );

    }

}


// =====================================
// Extract Wallet
// =====================================

function extractWallet(
    response
) {

    return (
        response?.wallet ||
        response?.data ||
        response ||
        {}
    );

}


// =====================================
// Update Dashboard Wallet
// =====================================

function updateDashboardWallet(
    response
) {

    const wallet =
        extractWallet(
            response
        );


    const balance =
        safeNumber(
            wallet.balance
        );


    const totalProfit =
        safeNumber(
            wallet.totalProfit ??
            wallet.profit
        );


    const totalTrades =
        safeNumber(
            wallet.totalTrades
        );


    const withdrawable =
        safeNumber(
            wallet.withdrawable ??
            wallet.available
        );


    setText(
        "dashboard-balance-usd",
        formatUSD(balance)
    );


    setText(
        "today-profit-usd",
        `$${formatUSD(
            safeNumber(
                wallet.todayProfit ??
                wallet.dailyProfit
            )
        )}`
    );


    setText(
        "total-profit-usd",
        `$${formatUSD(
            totalProfit
        )}`
    );


    setText(
        "total-trades",
        formatNumber(
            totalTrades
        )
    );


    const successRate =
        safeNumber(
            wallet.successRate
        );


    setText(
        "success-rate",
        formatPercent(
            successRate
        )
    );


    const rate =
        safeNumber(
            wallet.usdToToman ??
            wallet.exchangeRate ??
            window.exchangeRate ??
            100000
        );


    setText(
        "dashboard-balance-irr",
        `معادل تومان: ${formatToman(
            balance * rate
        )}`
    );


    setText(
        "today-profit-irr",
        `معادل تومان: ${formatToman(
            safeNumber(
                wallet.todayProfit ??
                wallet.dailyProfit
            ) * rate
        )}`
    );


    setText(
        "total-profit-irr",
        `معادل تومان: ${formatToman(
            totalProfit * rate
        )}`
    );


    window.currentWallet =
        {
            balance,
            totalProfit,
            totalTrades,
            withdrawable,
            rate
        };

}


// =====================================
// Dashboard Bot
// =====================================

function updateDashboardBot(
    response
) {

    const bot =
        response?.bot ||
        response?.data ||
        response ||
        {};


    const status =
        bot.status ||
        "STOPPED";


    const strategy =
        bot.strategy ||
        "AI Scalping";


    const accuracy =
        safeNumber(
            bot.accuracy
        );


    setText(
        "ai-strategy",
        strategy
    );


    setText(
        "ai-accuracy",
        accuracy
            ? formatPercent(
                accuracy
            )
            : "—"
    );


    setText(
        "ai-mode",
        status === "ACTIVE"
            ? "فعال"
            : "متوقف"
    );


    setText(
        "ai-status",
        status === "ACTIVE"
            ? "فعال"
            : "متوقف"
    );


    window.currentBot =
        bot;

}


// =====================================
// Dashboard Trades
// =====================================

function updateDashboardTrades(
    response
) {

    const container =
        document.getElementById(
            "dashboard-trades"
        );


    if (!container) {
        return;
    }


    const trades =
        extractTrades(
            response
        );


    if (!trades.length) {

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


    container.classList.remove(
        "empty-state"
    );


    container.innerHTML =
        trades
            .slice(0, 5)
            .map(
                trade =>
                    renderTradeCard(
                        trade
                    )
            )
            .join("");

}


// =====================================
// Extract Trades
// =====================================

function extractTrades(
    response
) {

    if (Array.isArray(response)) {

        return response;

    }


    if (
        Array.isArray(
            response?.trades
        )
    ) {

        return response.trades;

    }


    if (
        Array.isArray(
            response?.data
        )
    ) {

        return response.data;

    }


    return [];

}


// =====================================
// Trade Card
// =====================================

function renderTradeCard(
    trade
) {

    const symbol =
        trade.symbol ||
        "Unknown";


    const type =
        trade.type ||
        "WAIT";


    const profit =
        safeNumber(
            trade.profit
        );


    const status =
        trade.status ||
        "OPEN";


    return `

        <div class="trade-item">

            <div>

                <strong>
                    ${escapeHTML(symbol)}
                </strong>

                <small>
                    ${type} · ${status}
                </small>

            </div>

            <strong>
                ${profit >= 0 ? "+" : ""}
                $${formatUSD(profit)}
            </strong>

        </div>

    `;

}


// =====================================
// Wallet
// =====================================

async function loadWallet() {

    const userId =
        getTelegramUserId();


    if (!userId) {
        return;
    }


    try {

        const response =
            await apiFetch(
                `/api/wallet/${userId}`
            );


        const wallet =
            extractWallet(
                response
            );


        const balance =
            safeNumber(
                wallet.balance
            );


        const available =
            safeNumber(
                wallet.withdrawable ??
                wallet.available ??
                balance
            );


        const profit =
            safeNumber(
                wallet.totalProfit ??
                wallet.profit
            );


        const rate =
            safeNumber(
                wallet.usdToToman ??
                wallet.exchangeRate ??
                window.exchangeRate ??
                100000
            );


        setText(
            "wallet-balance-usd",
            formatUSD(balance)
        );


        setText(
            "wallet-available-usd",
            formatUSD(available)
        );


        setText(
            "wallet-balance-irr",
            `معادل تومان: ${formatToman(
                balance * rate
            )}`
        );


        setText(
            "wallet-available-irr",
            `معادل تومان: ${formatToman(
                available * rate
            )}`
        );


        setText(
            "wallet-summary-balance",
            `$${formatUSD(balance)}`
        );


        setText(
            "wallet-summary-profit",
            `$${formatUSD(profit)}`
        );


        setText(
            "wallet-summary-total",
            `$${formatUSD(
                balance + profit
            )}`
        );


    }

    catch (error) {

        console.error(
            "Wallet loading error:",
            error
        );

    }

}


// =====================================
// Trades
// =====================================

async function loadTrades(
    status = "open"
) {

    const userId =
        getTelegramUserId();


    const container =
        document.getElementById(
            "trades-list"
        );


    if (!container) {
        return;
    }


    if (!userId) {

        renderEmptyTrades(
            container
        );

        return;
    }


    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                …
            </div>

            <p>
                در حال دریافت معاملات...
            </p>

        </div>

    `;


    try {

        const response =
            await apiFetch(
                `/api/trades/${userId}`
            );


        let trades =
            extractTrades(
                response
            );


        const normalizedStatus =
            status.toUpperCase();


        trades =
            trades.filter(
                trade => {

                    const tradeStatus =
                        String(
                            trade.status ||
                            ""
                        ).toUpperCase();


                    if (
                        normalizedStatus ===
                        "OPEN"
                    ) {

                        return (
                            tradeStatus ===
                            "OPEN"
                        );

                    }


                    return (
                        tradeStatus ===
                        "CLOSED"
                    );

                }
            );


        if (!trades.length) {

            renderEmptyTrades(
                container,
                status
            );

            return;
        }


        container.innerHTML =
            trades
                .map(
                    trade =>
                        renderTradeCard(
                            trade
                        )
                )
                .join("");


    }

    catch (error) {

        console.error(
            "Trades loading error:",
            error
        );


        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    !
                </div>

                <p>
                    دریافت معاملات با مشکل مواجه شد.
                </p>

            </div>

        `;

    }

}


// =====================================
// Empty Trades
// =====================================

function renderEmptyTrades(
    container,
    status = "open"
) {

    const title =
        status === "open"
            ? "معامله باز"
            : "معامله بسته";


    container.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                —
            </div>

            <p>
                ${title}ی برای نمایش وجود ندارد.
            </p>

        </div>

    `;

}


// =====================================
// Trade Tabs
// =====================================

function initializeTradeTabs() {

    const tabs =
        document.querySelectorAll(
            "[data-trade-status]"
        );


    tabs.forEach(
        tab => {

            tab.addEventListener(
                "click",
                async event => {

                    event.preventDefault();
                    event.stopPropagation();


                    tabs.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    tab.classList.add(
                        "active"
                    );


                    currentTradeStatus =
                        tab.dataset.tradeStatus ||
                        "open";


                    await loadTrades(
                        currentTradeStatus
                    );

                }
            );

        }
    );

}


// =====================================
// Withdraw Data
// =====================================

async function loadWithdrawData() {

    const userId =
        getTelegramUserId();


    if (!userId) {
        return;
    }


    try {

        const response =
            await apiFetch(
                `/api/wallet/${userId}`
            );


        const wallet =
            extractWallet(
                response
            );


        const available =
            safeNumber(
                wallet.withdrawable ??
                wallet.available ??
                wallet.balance
            );


        const rate =
            safeNumber(
                wallet.usdToToman ??
                wallet.exchangeRate ??
                window.exchangeRate ??
                100000
            );


        setText(
            "withdraw-available-usd",
            formatUSD(
                available
            )
        );


        setText(
            "withdraw-available-irr",
            `معادل تومان: ${formatToman(
                available * rate
            )}`
        );


    }

    catch (error) {

        console.error(
            "Withdraw data error:",
            error
        );

    }

}


// =====================================
// Profile
// =====================================

function loadProfile() {

    const user =
        currentUser ||
        window.currentUser ||
        {};


    const telegramUser =
        tg?.initDataUnsafe?.user ||
        {};


    const firstName =
        user.firstName ||
        user.first_name ||
        telegramUser.first_name ||
        "کاربر";


    const lastName =
        user.lastName ||
        user.last_name ||
        telegramUser.last_name ||
        "";


    const username =
        user.username ||
        telegramUser.username ||
        "";


    const fullName =
        `${firstName} ${lastName}`
            .trim();


    setText(
        "profile-name",
        fullName || "کاربر"
    );


    setText(
        "profile-username",
        username
            ? `@${username}`
            : "شناسه تلگرام"
    );


    const avatar =
        document.getElementById(
            "profile-avatar"
        );


    if (avatar) {

        avatar.textContent =
            (
                firstName ||
                "ک"
            ).charAt(0);

    }


    const status =
        user.status ||
        (
            user.accessEnabled
                ? "ACTIVE"
                : "PENDING"
        );


    setText(
        "profile-status",
        status === "ACTIVE"
            ? "فعال"
            : "در انتظار"
    );

}


// =====================================
// Profile Buttons
// =====================================

function initializeProfileButtons() {

    const accountButton =
        document.querySelector(
            '[data-profile-action="account"]'
        );


    if (accountButton) {

        accountButton.addEventListener(
            "click",
            () => {

                const user =
                    currentUser ||
                    {};


                const username =
                    user.username ||
                    tg?.initDataUnsafe?.user?.username ||
                    "ثبت نشده";


                showToast(
                    `حساب کاربری\n@${username}`
                );

            }
        );

    }


    const supportButton =
        document.querySelector(
            '[data-profile-action="support"]'
        );


    if (supportButton) {

        supportButton.addEventListener(
            "click",
            () => {

                const supportId =
                    "@mehdi2410l";


                if (
                    tg &&
                    typeof tg.openTelegramLink ===
                    "function"
                ) {

                    tg.openTelegramLink(
                        `https://t.me/${supportId.substring(1)}`
                    );

                }

                else {

                    window.open(
                        `https://t.me/${supportId.substring(1)}`,
                        "_blank"
                    );

                }

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
                            button.dataset.action;


                        switch (action) {

                            case "deposit":

                                showToast(
                                    "بخش افزایش موجودی در حال آماده‌سازی است."
                                );

                                break;


                            case "withdraw":

                                showPage(
                                    "withdraw"
                                );

                                break;


                            case "transfer":

                                showToast(
                                    "بخش انتقال در حال آماده‌سازی است."
                                );

                                break;

                        }

                    }
                );

            }
        );

}


// =====================================
// AI Trading Button
// =====================================

function initializeAIButton() {

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
                getTelegramUserId();


            if (!userId) {

                showToast(
                    "کاربر تلگرام شناسایی نشد."
                );

                return;

            }


            try {

                button.disabled =
                    true;


                button.textContent =
                    "در حال فعال‌سازی...";


                const response =
                    await apiFetch(
                        `/api/bot/start/${userId}`,
                        {
                            method: "POST"
                        }
                    );


                if (
                    response?.success !==
                    false
                ) {

                    showToast(
                        "ربات هوش مصنوعی فعال شد."
                    );

                    await loadDashboard();

                }


            }

            catch (error) {

                console.error(
                    "AI start error:",
                    error
                );


                showToast(
                    error?.message ||
                    "فعال‌سازی ربات انجام نشد."
                );

            }

            finally {

                button.disabled =
                    false;


                button.textContent =
                    "شروع معاملات AI";

            }

        }
    );

}


// =====================================
// Set Text
// =====================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {
        return;
    }


    element.textContent =
        value;

}


// =====================================
// Escape HTML
// =====================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
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


// =====================================
// Profile Cleanup
// =====================================

function cleanupRemovedProfileButtons() {

    const removedActions = [

        "security",

        "referral",

        "about"

    ];


    removedActions.forEach(
        action => {

            document
                .querySelectorAll(
                    `[data-profile-action="${action}"]`
                )
                .forEach(
                    element => {

                        element.remove();

                    }
                );

        }
    );


    const logoutButton =
        document.getElementById(
            "logout-button"
        );


    if (logoutButton) {

        logoutButton.remove();

    }

}


// =====================================
// Initialize Application
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
            "=====================================");


        showLoadingScreen();


        initializeNavigation();

        initializeBackButton();

        initializeNotificationButton();

        initializeActions();

        initializeTradeTabs();

        initializeProfileButtons();

        initializeAIButton();

        cleanupRemovedProfileButtons();


        // ---------------------------------
        // Telegram Authentication
        // ---------------------------------

        const user =
            await authenticateTelegram();


        currentUser =
            user;

        window.currentUser =
            user;


        // ---------------------------------
        // Auth Event
        // ---------------------------------

        window.dispatchEvent(

            new CustomEvent(
                "autotrade:authenticated",
                {
                    detail: user
                }
            )

        );


        // ---------------------------------
        // Dashboard
        // ---------------------------------

        await loadDashboard();


        // ---------------------------------
        // Existing Dashboard Hook
        // ---------------------------------

        if (
            typeof window.initializeDashboard ===
            "function"
        ) {

            try {

                await window.initializeDashboard(
                    user
                );

            }

            catch (error) {

                console.error(
                    "Dashboard hook error:",
                    error
                );

            }

        }


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
            "❌ Application initialization failed:",
            error
        );


        currentUser =
            null;

        window.currentUser =
            null;


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

                    "خطا در اتصال به حساب.\n\n" +
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

    showPage,

    showToast,

    loadDashboard,

    loadWallet,

    loadTrades,

    loadProfile

};


// =====================================
// Start
// =====================================

initializeApp();