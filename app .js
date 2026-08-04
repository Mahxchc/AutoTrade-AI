let tg = window.Telegram.WebApp;


tg.ready();
tg.expand();



// اتصال تلگرام

let user = tg.initDataUnsafe.user;


if(user){

document.getElementById("user").innerHTML =
"خوش آمدی " + user.first_name + " 👋";

}
else{

document.getElementById("user").innerHTML =
"کاربر مهمان";

}





// تغییر صفحات پایین

function openPage(page){


let pages = document.querySelectorAll(".page");


pages.forEach(p=>{

p.classList.remove("active");

});



document.getElementById(page).classList.add("active");

}





// شروع AI

function startAI(){


alert(
"🤖 ربات معامله‌گر اتوماتیک فعال شد"
);


}
