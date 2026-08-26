// =====================================
// AutoTrade AI Mini App
// File: MiniApp/app.js
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


    return result.user;
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


    // ---------------------------------
    // Find requested page
    // ---------------------------------

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


    // ---------------------------------
    // Hide all pages
    // ---------------------------------

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


    // ---------------------------------
    // Show selected page
    // ---------------------------------

    targetPage.classList.add(
        "active"
    );

    targetPage.style.display =
        "block";


    // ---------------------------------
    // Update bottom navigation
    // ---------------------------------

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


    // ---------------------------------
    // Update page title
    // ---------------------------------

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


    // ---------------------------------
    // Save current page
    // ---------------------------------

    currentPage =
        pageName;


    // ---------------------------------
    // Scroll to top
    // ---------------------------------

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
// Initialize Navigation
// =====================================

function initializeNavigation() {

    console.log(
        "🧭 Initializing navigation..."
    );


    // ---------------------------------
    // Bottom navigation
    // ---------------------------------

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


                    if (!page) {
                        return;
                    }


                    showPage(
                        page
                    );

                }
            );

        }
    );


    // ---------------------------------
    // Any element with data-page
    // ---------------------------------
    //
    // This also handles buttons such as:
    //
    // مشاهده همه
    // اعلان‌ها
    //
    // ---------------------------------

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


    // ---------------------------------
    // Initial page
    // ---------------------------------

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
            "====================================="
        );


        // ---------------------------------
        // Initialize UI first
        // ---------------------------------

        initializeNavigation();

        initializeBackButton();

        initializeNotificationButton();

        initializeActions();


        // ---------------------------------
        // Show loading
        // ---------------------------------

        showLoadingScreen();


        // ---------------------------------
        // Authenticate
        // ---------------------------------

        const user =
            await authenticateTelegram();


        // ---------------------------------
        // Store user
        // ---------------------------------

        window.currentUser =
            user;


        console.log(
            "👤 Current user:",
            user
        );


        // ---------------------------------
        // Dispatch auth event
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
        // Dashboard hook
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

            catch (dashboardError) {

                console.error(
                    "Dashboard error:",
                    dashboardError
                );

            }

        }


        // ---------------------------------
        // Hide loading
        // ---------------------------------

        hideLoadingScreen();


        // ---------------------------------
        // Open dashboard
        // ---------------------------------

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

    showPage,

    showToast

};


// =====================================
// Start
// =====================================

initializeApp();