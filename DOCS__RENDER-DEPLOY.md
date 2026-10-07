# Render deployment

1. Create a Render Web Service from this repository.
2. Root Directory: `backend`.
3. Build Command: `npm install`.
4. Start Command: `npm start`.
5. Health Check Path: `/health`.
6. Set `MONGO_URI`, `BOT_TOKEN`, `OWNER_TELEGRAM_ID`, `ADMIN_TELEGRAM_ID`, `BOT_USERNAME`, `SUPPORT_USERNAME`, `BACKEND_URL`, `FRONTEND_URL`, `MINI_APP_URL`, and `TELEGRAM_INIT_DATA_MAX_AGE` in Render Environment.
7. Never commit real tokens, passwords, or payment credentials.

The payment layer remains a server-side integration boundary. Do not insert payment credentials into the frontend. The current generic gateway is not claimed to be a verified ZarinPal integration.

## Admin panel
- Open `https://autotrade-backend-02cc.onrender.com/admin` from inside Telegram (BotFather menu button / Web App link). It needs Telegram `initData`, so a normal browser tab will show an access error.
- Only the Telegram ID in `OWNER_TELEGRAM_ID` / `ADMIN_TELEGRAM_ID` can use it.
- Do NOT open the admin panel from GitHub Pages.

## CORS
`FRONTEND_URL` / `MINI_APP_URL` may include a path (e.g. `https://mahxchc.github.io/AutoTrade-AI/`); the backend compares only the origin (`https://mahxchc.github.io`).
