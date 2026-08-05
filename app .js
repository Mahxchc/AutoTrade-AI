// ===============================
// 🤖 Auto Trade AI - App Logic
// بخش ۱: تنظیمات اولیه ربات
// ===============================


// اطلاعات اولیه ربات
let botData = {

    // موجودی
    balance: 0,

    // سود امروز
    todayProfit: 0,

    // سود کل
    totalProfit: 0,


    // تعداد معاملات
    trades: 0,


    // درصد موفقیت
    winRate: 0,


    // تحلیل هوش مصنوعی
    aiAccuracy: 0,


    // اعتماد آخرین سیگنال
    confidence: 0,


    // وضعیت ربات
    status: "خاموش",


    // آخرین ارز بررسی شده
    symbol: "BTC/USDT",


    // آخرین سیگنال
    signal: "WAIT"

};



// وضعیت اتصال
let connectionStatus = {

    online: false,

    message: "در حال اتصال..."

};



// شروع اولیه برنامه
document.addEventListener("DOMContentLoaded", () => {

    console.log("🤖 Auto Trade AI Started");

    console.log(botData);

});

// ===============================
// بخش ۲: کنترل دکمه‌های ربات
// ===============================


// پیدا کردن دکمه شروع ربات
const startBotBtn = document.querySelector("#startBot");


// اگر دکمه وجود داشت
if(startBotBtn){

    startBotBtn.addEventListener("click", () => {


        // تغییر وضعیت ربات
        botData.status = "فعال";


        // اتصال AI
        connectionStatus.online = true;

        connectionStatus.message = "Online";


        // تغییر تحلیل اولیه
        botData.aiAccuracy = 0;
        botData.confidence = 0;


        // تغییر متن دکمه
        startBotBtn.innerHTML = "🤖 ربات فعال است";


        // نمایش در کنسول
        console.log("Robot Started");
        console.log(botData);



        // تغییر ظاهر دکمه
        startBotBtn.classList.add("active");


    });

}



// دکمه توقف ربات
const stopBotBtn = document.querySelector("#stopBot");


if(stopBotBtn){


    stopBotBtn.addEventListener("click",()=>{


        botData.status = "خاموش";


        connectionStatus.online = false;

        connectionStatus.message = "Offline";


        startBotBtn.innerHTML = "🤖 شروع ربات معامله‌گر";


        startBotBtn.classList.remove("active");


        console.log("Robot Stopped");


    });

}

// ===============================
// بخش ۳: اتصال داده‌ها به صفحه
// ===============================


// آپدیت اطلاعات روی صفحه
function updateDashboard(){


    // موجودی
    const balance = document.querySelector(".balance");

    if(balance){

        balance.innerHTML =
        botData.balance.toFixed(2)
        + " USDT";

    }



    // سود امروز
    const todayProfit =
    document.querySelector(".balance-row strong.green");


    if(todayProfit){

        todayProfit.innerHTML =
        botData.todayProfit
        + "%";

    }



    // سود کل
    const totalProfit =
    document.querySelector(".balance-row strong:not(.green)");


    if(totalProfit){

        totalProfit.innerHTML =
        botData.totalProfit
        + "$";

    }



    // دقت AI
    const aiAccuracy =
    document.querySelector(".ai-item:nth-child(2) strong");


    if(aiAccuracy){

        aiAccuracy.innerHTML =
        botData.aiAccuracy
        + "%";

    }



    // وضعیت ربات
    const status =
    document.querySelector(".ai-item:nth-child(3) strong");


    if(status){

        status.innerHTML =
        botData.status;

    }



    // اعتماد سیگنال
    const confidence =
    document.querySelector(".confidence strong");


    if(confidence){

        confidence.innerHTML =
        botData.confidence
        + "%";

    }



    // تعداد معاملات
    const trades =
    document.querySelector(".chart-info div:nth-child(2) strong");


    if(trades){

        trades.innerHTML =
        botData.trades;

    }



    // درصد موفقیت
    const win =
    document.querySelector(".chart-info div:nth-child(3) strong");


    if(win){

        win.innerHTML =
        botData.winRate
        + "%";

    }


}



// اجرای اولیه
updateDashboard();


// ===============================
// بخش ۴: کنترل منوی پایین
// ===============================


const navButtons = document.querySelectorAll(
    ".bottom-nav button"
);



navButtons.forEach((button,index)=>{


    button.addEventListener("click",()=>{


        // حذف حالت فعال از همه
        navButtons.forEach(btn=>{

            btn.classList.remove("active");

        });



        // فعال کردن دکمه انتخاب شده
        button.classList.add("active");



        // تشخیص صفحه
        switch(index){


            case 0:

                console.log("🏠 Dashboard");

                break;



            case 1:

                console.log("💼 Wallet");

                break;



            case 2:

                console.log("📈 Trades");

                break;



            case 3:

                console.log("🤖 AI");

                break;



            case 4:

                console.log("👤 Profile");

                break;


        }



    });


});


// ===============================
// بخش ۵: اتصال Telegram WebApp
// ===============================



let tg = window.Telegram.WebApp;



// آماده شدن تلگرام
tg.ready();


// باز شدن کامل Mini App
tg.expand();




// گرفتن اطلاعات کاربر
let telegramUser = tg.initDataUnsafe.user;



const userElement =
document.querySelector("#username");





if(telegramUser){


    userElement.innerHTML =

    "سلام "
    +
    telegramUser.first_name
    +
    " 👋";



    console.log(
        "Telegram User:",
        telegramUser
    );


}

else{


    userElement.innerHTML =

    "کاربر مهمان";


}





// اطلاعاتی که بعداً به سرور می‌رود

let userData = {


    id:
    telegramUser ?
    telegramUser.id :
    null,


    name:
    telegramUser ?
    telegramUser.first_name :
    "Guest",


    username:
    telegramUser ?
    telegramUser.username :
    null


};



console.log(
    "User Data:",
    userData
);


// ===============================
// بخش ۶: اتصال به Backend
// ===============================



const BACKEND_URL =

"https://autotrade-backend-02cc.onrender.com";





// ارسال اطلاعات کاربر به سرور

async function sendUserToBackend(){



    try{


        let response = await fetch(

            BACKEND_URL + "/user",

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json"

                },


                body:JSON.stringify(userData)


            }

        );



        let result = await response.json();



        console.log(

            "Backend Response:",

            result

        );



    }

    catch(error){


        console.log(

            "Backend Error:",

            error

        );


    }



}







// اجرای ارسال اطلاعات

if(userData.id){


    sendUserToBackend();


}







// تست تغییر داده ربات

function simulateAI(){



    if(botData.status !== "فعال"){

        return;

    }



    botData.aiAccuracy =
    Math.floor(
        Math.random()*40
    );



    botData.confidence =
    Math.floor(
        Math.random()*40
    );



    updateDashboard();



}






// هر ۵ ثانیه بررسی AI

setInterval(()=>{


    simulateAI();


},5000);
