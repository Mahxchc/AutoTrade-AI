const tg = window.Telegram?.WebApp;

const API_BASE_URL =
    String(window.APP_API_BASE_URL || "").replace(/\/$/, "");

function apiUrl(path) {
    return API_BASE_URL + path;
}

if (tg) {
    tg.ready();
    tg.expand();
}


/* -----------------------------
   Elements
----------------------------- */

const loadingScreen =
    document.getElementById("loadingScreen");

const registrationScreen =
    document.getElementById("registrationScreen");

const waitingScreen =
    document.getElementById("waitingScreen");

const rejectedScreen =
    document.getElementById("rejectedScreen");

const mainScreen =
    document.getElementById("mainScreen");

const openBotBtn =
    document.getElementById("openBotBtn");


/* -----------------------------
   Screen helper
----------------------------- */

function hideAllScreens() {

    loadingScreen.classList.add("hidden");
    registrationScreen.classList.add("hidden");
    waitingScreen.classList.add("hidden");
    rejectedScreen.classList.add("hidden");

    mainScreen.classList.add("hidden");
}


function showRegistrationRequired() {

    hideAllScreens();

    registrationScreen.classList.remove("hidden");
}


function showWaiting() {

    hideAllScreens();

    waitingScreen.classList.remove("hidden");
}


function showRejected() {

    hideAllScreens();

    rejectedScreen.classList.remove("hidden");
}


function showMain() {

    hideAllScreens();

    mainScreen.classList.remove("hidden");
}


/* -----------------------------
   Telegram user
----------------------------- */

function getTelegramUser() {

    if (!tg || !tg.initDataUnsafe) {
        return null;
    }

    return tg.initDataUnsafe.user || null;
}


/* -----------------------------
   Open bot
----------------------------- */

openBotBtn.addEventListener("click", () => {

    const botUsername =
        window.APP_BOT_USERNAME || "";

    if (!botUsername) {
        alert("نام کاربری ربات هنوز در تنظیمات Mini App وارد نشده است.");
        return;
    }

    const url =
        "https://t.me/" +
        botUsername.replace(/^@/, "");

    if (tg?.openTelegramLink) {
        tg.openTelegramLink(url);
        return;
    }

    window.open(url, "_blank");

});


/* -----------------------------
   User information
----------------------------- */

function renderUser(user) {

    if (!user) {
        return;
    }

    const firstName =
        user.first_name || "";

    const lastName =
        user.last_name || "";

    document.getElementById("firstName")
        .textContent =
        firstName || "---";

    document.getElementById("lastName")
        .textContent =
        lastName || "---";

    document.getElementById("userName")
        .textContent =
        `${firstName} ${lastName}`.trim() || "کاربر";

    if (user.phone_number) {

        document.getElementById("phoneNumber")
            .textContent =
            user.phone_number;

    }

}


/* -----------------------------
   Backend state
----------------------------- */

/*
    این تابع باید از endpoint فعلی
    بک‌اند خودت وضعیت کاربر را بگیرد.

    انتظار:

    {
        registered: true,
        status: "approved",

        user: {
            firstName: "...",
            lastName: "...",
            phone: "..."
        },

        balance: {
            dollar: 125.50,
            toman: 7000000
        },

        trade: {
            dollar: 100,
            toman: 5500000,
            profit: 25
        }
    }

    اسم endpoint را عمداً حدس نزدم،
    چون بک‌اند خودت از قبل وجود دارد.
*/

async function getUserState() {

    if (!tg || !tg.initData) {
        throw new Error("Telegram Mini App initData is unavailable.");
    }

    const apiBase = API_BASE_URL;

    async function api(path, options = {}) {
        const response = await fetch(`${apiBase}${path}`, {
            ...options,
            headers: {
                ...(options.headers || {}),
                "X-Telegram-Init-Data": tg.initData
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const error = new Error(
                data.message || `Backend request failed: ${response.status}`
            );
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    }

    const auth = await api("/api/auth/telegram", { method: "POST" });

    if (!auth.registered) {
        return { registered: false, status: "not_registered" };
    }

    const status = auth.status;

    if (status !== "approved") {
        return {
            registered: true,
            status,
            user: auth.user || null
        };
    }

    const walletResponse = await api("/api/wallet/me");
    const wallet = walletResponse.wallet || {};

    return {
        registered: true,
        status: "approved",
        user: auth.user || null,
        balance: {
            dollar: wallet.balanceUSD ?? wallet.balance ?? 0,
            toman: wallet.balanceToman ?? 0
        },
        trade: {
            dollar: wallet.balanceUSD ?? wallet.balance ?? 0,
            toman: wallet.balanceToman ?? 0,
            profit: wallet.totalProfit ?? 0
        },
        wallet
    };
}

/* -----------------------------
   Render financial information
----------------------------- */

function renderFinancialData(data) {

    const balance =
        data.balance || {};

    const trade =
        data.trade || {};


    document.getElementById("dollarBalance")
        .textContent =
        Number(balance.dollar || 0)
            .toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );


    document.getElementById("tomanBalance")
        .textContent =
        Number(balance.toman || 0)
            .toLocaleString("fa-IR");


    document.getElementById("tradeDollar")
        .textContent =
        Number(trade.dollar || 0)
            .toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );


    document.getElementById("tradeToman")
        .textContent =
        Number(trade.toman || 0)
            .toLocaleString("fa-IR");


    document.getElementById("profitDollar")
        .textContent =
        Number(trade.profit || 0)
            .toLocaleString(
                "en-US",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );
}


/* -----------------------------
   App startup
----------------------------- */

async function startApp() {

    try {

        const telegramUser =
            getTelegramUser();

        if (telegramUser) {
            renderUser(telegramUser);
        }


        /*
           دریافت وضعیت واقعی از بک‌اند
        */

        const data =
            await getUserState();


        /*
           کاربر اصلاً ثبت‌نام نکرده
        */

        if (!data.registered) {

            showRegistrationRequired();

            return;
        }


        /*
           ثبت‌نام کرده ولی منتظر تأیید است
        */

        if (data.status === "pending") {

            showWaiting();

            return;
        }


        /*
           درخواست رد شده
        */

        if (data.status === "rejected") {

            showRejected();

            return;
        }


        /*
           تأیید شده
        */

        if (data.status === "approved") {

            if (data.user) {

                document.getElementById("firstName")
                    .textContent =
                    data.user.firstName || "---";

                document.getElementById("lastName")
                    .textContent =
                    data.user.lastName || "---";

                document.getElementById("phoneNumber")
                    .textContent =
                    data.user.phone || "---";

                document.getElementById("userName")
                    .textContent =
                    `${data.user.firstName || ""}
                     ${data.user.lastName || ""}`.trim()
                    || "کاربر";
            }


            renderFinancialData(data);

            showMain();

            return;
        }


        /*
           وضعیت ناشناخته
        */

        showRegistrationRequired();

    } catch (error) {

        console.error(error);

        /*
           اگر بک‌اند در دسترس نباشد،
           کاربر را وارد محیط مالی نمی‌کنیم.
        */

        showRegistrationRequired();
    }

}


/* -----------------------------
   Existing deposit handler
----------------------------- */

document
    .getElementById("depositBtn")
    .addEventListener("click", () => {

        /*
           از handler موجود پروژه استفاده کن.
           منطق مالی جدیدی اینجا نوشته نشده.
        */

        if (
            typeof window.openDeposit ===
            "function"
        ) {

            window.openDeposit();

        }

    });


/* -----------------------------
   Existing withdraw handler
----------------------------- */

document
    .getElementById("withdrawBtn")
    .addEventListener("click", () => {

        /*
           از handler موجود پروژه استفاده کن.
           منطق مالی جدیدی اینجا نوشته نشده.
        */

        if (
            typeof window.openWithdraw ===
            "function"
        ) {

            window.openWithdraw();

        }

    });


/* Start */

startApp();