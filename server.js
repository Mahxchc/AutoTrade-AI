// =====================================
// AutoTrade AI Backend
// server.js
// =====================================


import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDatabase } from "./database.js";

import userRoutes from "./routes/User.js";
import walletRoutes from "./routes/Wallet.js";
import tradeRoutes from "./routes/Trade.js";
import botRoutes from "./routes/Bot.js";

dotenv.config();

connectDatabase();

const app = express();



app.use(cors());


app.use(express.json());

app.use("/api/users", userRoutes);

app.use("/api/wallet", walletRoutes);

app.use("/api/trades", tradeRoutes);

app.use("/api/bot", botRoutes);







// تست سلامت سرور

app.get("/", (req,res)=>{


    res.json({

        status:"online",

        message:
        "AutoTrade AI Backend Running"

    });


});







// دریافت اطلاعات داشبورد کاربر

app.post("/api/dashboard",(req,res)=>{


    const {telegramId} = req.body;



    res.json({


        telegramId:


        telegramId,



        balance:0,



        profit:0,



        trades:0,



        winRate:0,



        aiAccuracy:0,



        confidence:0



    });



});








// وضعیت ربات

app.get("/api/bot/status",(req,res)=>{


    res.json({


        active:false,


        status:"offline"


    });


});








// شروع ربات

app.post("/api/bot/start",(req,res)=>{


    res.json({


        success:true,


        message:
        "Bot started"



    });


});








// توقف ربات

app.post("/api/bot/stop",(req,res)=>{


    res.json({


        success:true,


        message:
        "Bot stopped"



    });


});








// پورت سرور


const PORT = process.env.PORT || 3000;



app.listen(PORT,()=>{


    console.log(

        `Server running on ${PORT}`

    );


});
