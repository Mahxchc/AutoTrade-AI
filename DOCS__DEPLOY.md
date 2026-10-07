# AutoTrade AI — Deploy

## GitHub
1. Extract this ZIP.
2. Upload the extracted files to the repository root and replace the old project files.
3. Do not upload `backend/.env`.
4. GitHub Pages publishes only `index.html`, `style.css`, and `app.js` through `.github/workflows/static.yml`.

## Backend
The included `render.yaml` is a deployment blueprint for a Node 20 backend. Create the service from the repository and set these secrets/values in the hosting dashboard:
- `BOT_TOKEN`
- `MONGO_URI`
- `BACKEND_URL` = the public HTTPS backend URL
- `FRONTEND_URL` = the public HTTPS frontend URL
- `MINI_APP_URL` = the same Mini App URL

The server automatically configures the Telegram webhook at `/api/webhook/telegram` after startup when `BOT_TOKEN` and `BACKEND_URL` are present.

## Frontend
Before first production deploy, set `window.APP_API_BASE_URL` in `index.html` to the public HTTPS backend URL. Do not put any secret in the frontend.

## Security
Telegram Mini App `initData` is validated on the backend. Never use `initDataUnsafe` as authorization. Never commit bot tokens, database passwords, or payment credentials.

## Financial integrations
This package does not add new real-money transfer, withdrawal, trading-execution, or payment-gateway execution logic. Existing financial modules are preserved; any real payment integration must be separately reviewed, configured, and tested by the account owner/provider.
