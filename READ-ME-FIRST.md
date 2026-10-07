# Upload order (all files are flat — no folders)

1. In GitHub: delete the OLD `backend` folder and old loose files first (so nothing conflicts).
2. Select ALL files in this folder and upload them together to the repo root.
3. Render: Settings -> Root Directory = EMPTY (repo root), Build = `npm install`, Start = `npm start`.
4. Do NOT upload any real token/.env. Put secrets only in Render Environment.

File prefixes:
- BACKEND__*   -> Render server code (and BACKEND__admin__* = admin panel at /admin)
- MINIAPP__*   -> Telegram Mini App (GitHub Pages) ; index.html is the Mini App page
- RENDER__*    -> Render config / env example
- DOCS__*      -> notes only
- package.json -> required by Render (must keep this name)
- render.yaml  -> optional Render blueprint
