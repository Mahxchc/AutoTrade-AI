// =================================
// AutoTrade AI
// APP.JS VERSION 1
// بخش ۱: Telegram + Settings
// =================================



// Telegram

const tg = window.Telegram.WebApp;


tg.ready();

tg.expand();





// وضعیت ربات

const bot = {


    active:false,


    balance:0,


    profit:0,


    trades:0,


    winRate:0,


    aiAccuracy:0


};







// کاربر

let user = null;



if(tg.initDataUnsafe.user){


    user = tg.initDataUnsafe.user;



    document.getElementById("username").innerHTML =

    "سلام "

    +

    user.first_name

    +

    " 👋";



    document.getElementById("profile-info").innerHTML =

    user.first_name;



}

else{


    document.getElementById("username").innerHTML =

    "کاربر مهمان";


}






console.log(

"AutoTrade Ready",

user

);


// =================================
// بخش ۲: Navigation
// =================================



const navButtons = document.querySelectorAll(".nav-btn");

const pages = document.querySelectorAll(".page");






function openPage(pageId){



    pages.forEach(page=>{


        page.classList.remove("active");


    });




    const page = document.getElementById(pageId);



    if(page){


        page.classList.add("active");


    }



}








navButtons.forEach(button=>{


    button.addEventListener(

        "click",

        ()=>{


            navButtons.forEach(btn=>{


                btn.classList.remove("active");


            });





            button.classList.add("active");





            const pageId =

            button.dataset.page;




            openPage(pageId);



            console.log(

                "Page:",
                pageId

            );



        }


    );


});


// =================================
// بخش ۳: Bot Control
// =================================



const startButton = document.getElementById(
    "startBot"
);

const botStatus = document.getElementById(
    "bot-status"
);






function updateBotUI(){



    if(bot.active){



        botStatus.innerHTML =

        "● Online";



        botStatus.style.color =

        "#22c55e";




        startButton.innerHTML =

        "⛔ توقف ربات معامله‌گر";



        startButton.classList.add(

            "active"

        );



    }

    else{



        botStatus.innerHTML =

        "خاموش";



        botStatus.style.color =

        "#ef4444";





        startButton.innerHTML =

        "🤖 شروع ربات معامله‌گر";



        startButton.classList.remove(

            "active"

        );


    }



}









startButton.addEventListener(

"click",

()=>{


    bot.active = !bot.active;



    console.log(

        "Bot status:",

        bot.active

    );



    updateBotUI();



}

);





// وضعیت اولیه

updateBotUI();

// =================================
// بخش ۴: Dashboard Data
// =================================



function updateDashboard(data){



    if(!data)

    return;





    if(data.balance !== undefined){


        document.getElementById(
            "balance"
        ).innerHTML =


        data.balance + " USDT";



    }






    if(data.profit !== undefined){


        document.getElementById(
            "profit"
        ).innerHTML =


        data.profit + "$";



    }






    if(data.aiAccuracy !== undefined){


        document.getElementById(
            "ai-accuracy"
        ).innerHTML =


        data.aiAccuracy + "%";



    }






    if(data.confidence !== undefined){


        document.getElementById(
            "signal-confidence"
        ).innerHTML =


        data.confidence + "%";



    }






    if(data.trades !== undefined){


        document.getElementById(
            "trade-count"
        ).innerHTML =


        data.trades;



    }







    if(data.winRate !== undefined){


        document.getElementById(
            "win-rate"
        ).innerHTML =


        data.winRate + "%";



    }





}








// داده تست اولیه برای جلوگیری از خالی بودن صفحه

updateDashboard({


    balance:0,


    profit:0,


    aiAccuracy:0,


    confidence:0,


    trades:0,


    winRate:0



});


// =================================
// بخش ۵: Backend Connection
// =================================



const API_URL =

"https://autotrade-backend-02cc.onrender.com";







async function loadServerData(){


    try{


        const response = await fetch(

            API_URL + "/api/dashboard",

            {


                method:"POST",


                headers:{


                    "Content-Type":

                    "application/json"


                },


                body:JSON.stringify({


                    telegramId:

                    user ?

                    user.id :

                    "guest"



                })


            }


        );





        const data = await response.json();




        console.log(

            "Server Response:",

            data

        );





        updateDashboard(data);



    }


    catch(error){


        console.log(

            "Server Error:",

            error

        );


    }


}








// هر ۳۰ ثانیه بروزرسانی

setInterval(()=>{


    loadServerData();



},30000);






// اجرای اولیه

loadServerData();

