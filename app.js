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
    // Check Telegram InitData
    // ---------------------------------

    if (!telegramInitData) {

        throw new Error(

            "Telegram authentication data is missing. " +
            "Please open the Mini App inside Telegram."

        );

    }


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
        "Telegram authentication successful:",
        result.user
    );


    return result.user;

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
            "🔐 Starting Telegram authentication..."
        );

        console.log(
            "====================================="
        );


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
        // Dispatch Event
        // ---------------------------------
        //
        // Other dashboard code can listen:
        //
        // window.addEventListener(
        //     "autotrade:authenticated",
        //     event => {}
        // );
        //
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
        // Optional Dashboard Hook
        // ---------------------------------

        if (
            typeof window.initializeDashboard ===
            "function"
        ) {

            await window.initializeDashboard(
                user
            );

        }


        console.log(
            "🚀 AutoTrade AI initialized successfully."
        );

    }

    catch (error) {

        console.error(
            "❌ Telegram authentication failed:",
            error
        );


        window.currentUser =
            null;


        // ---------------------------------
        // Dispatch Authentication Error
        // ---------------------------------

        window.dispatchEvent(

            new CustomEvent(
                "autotrade:auth-error",
                {

                    detail: {

                        message:
                            error.message

                    }

                }

            )

        );


        // ---------------------------------
        // Telegram Alert
        // ---------------------------------

        if (tg) {

            try {

                tg.showAlert(

                    "Authentication failed.\n\n" +
                    error.message

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
// Allows other Mini App files to use:
//
// apiFetch("/api/wallet/...")
//
// =====================================

window.autoTradeAPI = {

    apiFetch,

    authenticateTelegram

};


// =====================================
// Start Application
// =====================================

initializeApp();