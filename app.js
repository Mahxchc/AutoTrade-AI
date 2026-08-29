// =====================================
// ..M AutoTrade AI
// Support
// فقط پشتیبانی
// =====================================

const SUPPORT_USERNAME = "@mehdi2410l";


// =====================================
// OPEN SUPPORT
// باز کردن پشتیبانی تلگرام
// =====================================

function openSupport() {

    const username =
        SUPPORT_USERNAME.replace("@", "");

    const url =
        "https://t.me/" + username;


    // Telegram Mini App

    if (
        window.Telegram &&
        window.Telegram.WebApp &&
        typeof window.Telegram.WebApp.openTelegramLink ===
        "function"
    ) {

        window.Telegram.WebApp.openTelegramLink(
            url
        );

        return;
    }


    // مرورگر معمولی

    window.open(
        url,
        "_blank"
    );

}