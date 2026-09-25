# AutoTrade AI — Flat GitHub Upload

این نسخه برای آپلود با گوشی و بدون ساخت پوشه طراحی شده است.

## نام‌گذاری
- `MINI APP`: فایل‌های `index.html`، `app.js` و `style.css` در ریشه هستند.
- `BACKEND__...`: همه فایل‌های Backend با پیشوند `BACKEND__` مشخص شده‌اند.

## مهم
- فایل ZIP را داخل GitHub آپلود نکن. محتویات همین ZIP را آپلود کن.
- `BOT_TOKEN`، `MONGO_URI` و کلیدهای خصوصی را در GitHub قرار نده.
- `BACKEND__env.example` فقط نمونه تنظیمات است.
- این بسته منطق مالی موجود پروژه را نگه می‌دارد و منطق جدیدی برای انتقال پول/معامله واقعی اضافه نمی‌کند.

## اجرای Backend
در محیط Deploy، `package.json` ریشه را به عنوان Node.js project استفاده کن. Start command: `npm start`.
