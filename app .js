const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const BACKEND_URL = "https://autotrade-backend-02cc.onrender.com";

const content = document.getElementById("content");
const userElement = document.getElementById("user");

const pages = {

dashboard: `
<div class="card">
<h2>💰 داشبورد</h2>

<div class="balance">
0.00 USDT
</div>

<div class="grid">

<div class="stat">
<div>سود امروز</div>
<div class="stat-value green">0%</div>
</div>

<div class="stat">
<div>معاملات</div>
<div class="stat-value">0</div>
</div>

</div>

<br>

<button onclick="startAI()">
🚀 شروع ربات
</button>

</div>
`,

wallet: `
<div class="card">
<h2>💼 کیف پول</h2>

<div class="balance">
0.00 USDT
</div>

<button>➕ واریز</button>

<br><br>

<button>➖ برداشت</button>

</div>
`,

trades: `
<div class="card">
<h2>📈 معاملات</h2>

<p>هنوز معامله‌ای ثبت نشده است.</p>

</div>
`,

ai: `
<div class="card">
<h2>🤖 هوش مصنوعی</h2>

<p class="green">● Online</p>

<p>دقت: 87%</p>

<button onclick="startAI()">
فعال‌سازی AI
</button>

</div>
`,

profile: `
<div class="card">
<h2>👤 پروفایل</h2>

<p id="profileName">در حال بارگذاری...</p>

</div>
`

};

function showPage(page){

content.innerHTML = pages[page];

document
.querySelectorAll(".bottom-nav button")
.forEach(btn=>btn.classList.remove("active"));

const buttons =
document.querySelectorAll(".bottom-nav button");

switch(page){

case "dashboard":
buttons[0].classList.add("active");
break;

case "wallet":
buttons[1].classList.add("active");
break;

case "trades":
buttons[2].classList.add("active");
break;

case "ai":
buttons[3].classList.add("active");
break;

case "profile":
buttons[4].classList.add("active");
break;

}

if(page==="profile" && tg.initDataUnsafe.user){

document.getElementById("profileName").innerHTML =
tg.initDataUnsafe.user.first_name;

}

}

function startAI(){

alert("🤖 ربات معامله‌گر آماده است.");

}

const user = tg.initDataUnsafe.user;

if(user){

userElement.innerHTML =
"سلام " + user.first_name + " 👋";

fetch(BACKEND_URL + "/user",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

id:user.id,

first_name:user.first_name,

username:user.username

})

}).catch(console.error);

}
else{

userElement.innerHTML =
"کاربر مهمان";

}

showPage("dashboard");
