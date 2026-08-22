// =====================================
// Telegram Authentication :: M
// AutoTrade AI
// =====================================

const tg =
    window.Telegram?.WebApp;


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
// Get Secure Telegram InitData
// =====================================

const telegramInitData =
    tg?.initData || "";


// =====================================
// Backend URL
// =====================================

const BACKEND_URL =
    "https://autotrade-backend-02cc.onrender.com";


// =====================================
// Authenticated API Request
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


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(

            data.message ||
            "API request failed"

        );

    }


    return data;

}


// =====================================
// Authenticate With Backend
// =====================================

async function authenticateTelegram() {

    if (!telegramInitData) {

        throw new Error(

            "Telegram authentication data is missing. " +
            "Please open the Mini App inside Telegram."

        );

    }


    const result =
        await apiFetch(
            "/auth/telegram",
            {
                method: "POST"
            }
        );


    console.log(
        "Telegram authentication successful:",
        result.user
    );


    return result.user;

}


// =====================================
// Start Authentication
// =====================================

async function initializeApp() {

    try {

        const user =
            await authenticateTelegram();


        console.log(
            "Authenticated user:",
            user
        );


        // =====================================
        // Your Dashboard Initialization
        // =====================================

        window.currentUser =
            user;


    }

    catch (error) {

        console.error(
            "Authentication failed:",
            error
        );


        console.error(
            "AutoTrade AI authentication failed."
        );

    }

}


// =====================================
// Run
// =====================================

initializeApp();