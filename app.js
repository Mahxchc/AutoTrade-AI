// =====================================
// ..M Telegram Menu Button
// =====================================

export async function setupTelegramMenuButton() {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

    if (!BOT_TOKEN) {
        console.error("❌ TELEGRAM_BOT_TOKEN پیدا نشد");
        return;
    }

    const MINI_APP_URL = "https://mahxchc.github.io/AutoTrade-AI/";

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            menu_button: {
                type: "web_app",
                text: "Open",
                web_app: {
                    url: MINI_APP_URL
                }
            }
        })
    });

    const result = await response.json();

    if (!result.ok) {
        console.error("❌ خطا در تنظیم Menu Button:", result);
        return;
    }

    console.log("✅ Telegram Menu Button: Open");
}