# AutoTrade AI — Setup

## 1) Environment
Copy `backend/.env.example` to `backend/.env` on your server. Put the real Telegram bot token there. Do not commit `backend/.env`.

Owner settings already prepared:
- Telegram owner ID: `6999255720`
- Bot username: `@autotradee_aii_bot`
- Support: `@mehdi2410l`

## 2) Registration flow
1. User opens the bot.
2. Bot asks for first/last name.
3. Bot requests the Telegram contact button.
4. The contact is verified against the sender's Telegram ID.
5. Registration becomes `COMPLETED` and approval becomes `PENDING`.
6. Admin approves or rejects from the existing admin API.
7. Approved users can enter protected Mini App APIs.
8. The configured owner bypasses approval/access checks.

## 3) Mini App
`index.html` already points the registration button to `@autotradee_aii_bot` and the support link to `@mehdi2410l`.

If the frontend is hosted on a different domain from the backend, set `window.APP_API_BASE_URL` in `index.html` to the backend origin.

## 4) Telegram WebApp security
The backend validates Telegram `initData` using the bot token and rejects stale data using `TELEGRAM_INIT_DATA_MAX_AGE`. Never trust `initDataUnsafe` for authorization.

## 5) GitHub
Upload the extracted project files, not the ZIP wrapper. Do not upload `.env`, bot tokens, database passwords, or payment secrets.

## 6) Important
This package keeps the existing financial/trading services and does not add new money-transfer or trading execution logic. Test your existing financial integrations separately before production use.
