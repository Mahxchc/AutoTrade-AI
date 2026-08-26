// =====================================
// Telegram Authentication :: M
// AutoTrade AI
// File: MiniApp/app.js
// =====================================


// =====================================
// Telegram WebApp
// =====================================

const tg =
    window.Telegram?.WebApp;


// =====================================
// Check Telegram
// =====================================

if (!tg) {

    console.error(
        "Telegram WebApp is not available"
    );

}


// =====================================
// Telegram Ready
// =====================================

tg?.ready();

tg?.expand();


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


// =====================================
// Hide Loading Screen
// =====================================

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

    console.log(
        "✅ Loading screen hidden"
    );

}


// =====================================
// Secure Telegram InitData
// =====================================
//
// IMPORTANT:
// initData is the signed Telegram data.
// Do NOT use initDataUnsafe for authentication.
//
// =====================================

const telegramInitData =
    tg?.initData || "";


// =====================================
// Backend URL
// =====================================

const BACKEND_URL =
    "https://autotrade-backend-02cc.onrender.com";


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

    // ---------------------------------
    // Check Telegram WebApp
    // ---------------------------------

    if (!tg) {

        throw new Error(
            "Telegram WebApp is not available."
        );

    }


    // ---------------------------------
    // Check Telegram InitData
    // ---------------------------------

    if (!telegramInitData) {

        throw new Error(

            "Telegram authentication data is missing. " +
            "Please open the Mini App inside Telegram."

        );

    }


    console.log(
        "🔐 Telegram initData received"
    );


    console.log(
        "📡 Sending authentication request..."
    );


    // ---------------------------------
    // Authenticate with Backend
    // ---------------------------------

    const result =
        await apiFetch(
            "/api/auth/telegram",
            {
                method: "POST"
            }
        );


    // ---------------------------------
    // Validate Response
    // ---------------------------------

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
        "✅ Telegram authentication successful"
    );


    console.log(
        "👤 User:",
        result.user
    );


    return result.user;

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
            "🔐 Starting Telegram authentication..."
        );

        console.log(
            "====================================="
        );


        // ---------------------------------
        // Show Loading
        // ---------------------------------

        showLoadingScreen();


        // ---------------------------------
        // Authenticate Telegram
        // ---------------------------------

        const user =
            await authenticateTelegram();


        // ---------------------------------
        // Store Current User
        // ---------------------------------

        window.currentUser =
            user;


        // ---------------------------------
        // Authentication Success
        // ---------------------------------

        console.log(
            "✅ User authenticated:",
            user
        );


        // ---------------------------------
        // Dispatch Authentication Event
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
        // Dashboard Initialization
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
                    "Dashboard initialization error:",
                    dashboardError
                );

            }

        }


        // ---------------------------------
        // Hide Loading
        // ---------------------------------

        hideLoadingScreen();


        console.log(
            "🚀 AutoTrade AI initialized successfully."
        );

    }

    catch (error) {

        console.error(
            "❌ Telegram authentication failed:",
            error
        );


        // ---------------------------------
        // Clear Current User
        // ---------------------------------

        window.currentUser =
            null;


        // ---------------------------------
        // Hide Loading
        // ---------------------------------

        hideLoadingScreen();


        // ---------------------------------
        // Dispatch Authentication Error
        // ---------------------------------

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


        // ---------------------------------
        // Show Error
        // ---------------------------------

        const errorMessage =
            error?.message ||
            "Authentication failed.";


        console.error(
            "AutoTrade AI:",
            errorMessage
        );


        // ---------------------------------
        // Telegram Alert
        // ---------------------------------

        if (tg) {

            try {

                tg.showAlert(

                    "Authentication failed.\n\n" +
                    errorMessage

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
//
// Other Mini App files can use:
//
// window.autoTradeAPI.apiFetch(...)
//
// =====================================

window.autoTradeAPI = {

    apiFetch,

    authenticateTelegram,

    initializeApp

};


// =====================================
// Start Application
// =====================================
//
// IMPORTANT:
// initializeApp() must be called AFTER
// all event listeners and functions are ready.
//
// =====================================

initializeApp();