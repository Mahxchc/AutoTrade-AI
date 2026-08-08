// =====================================
// AutoTrade AI Mini App
// server.js
// =====================================

import express from "express";
import path from "path";
import { fileURLToPath } from "url";


const app = express();


// برای مسیر فایل‌ها
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// نمایش فایل‌های مینی اپ
app.use(express.static(__dirname));


// صفحه اصلی
app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


// پورت
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {

    console.log(
        `AutoTrade AI Mini App running on port ${PORT}`
    );

});
