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

console.log("MONGO URI:", process.env.MONGO_URI ? "FOUND" : "NOT FOUND");

const app = express();
 


// Middleware

app.use(cors());

app.use(express.json());





// Routes

app.use("/api/users", userRoutes);

app.use("/api/wallet", walletRoutes);

app.use("/api/trades", tradeRoutes);

app.use("/api/bot", botRoutes);





// Health Check

app.get("/", (req,res)=>{


    res.json({

        status:"online",

        message:
        "AutoTrade AI Backend Running"

    });


});





const PORT =
process.env.PORT || 3000;






async function startServer(){


    try{


        await connectDatabase();



        app.listen(PORT, ()=>{


            console.log(

                `Server running on ${PORT}`

            );


        });



    }


    catch(error){


        console.log(

            "Server Start Error:",
            error.message

        );


    }


}





startServer();
