// =====================================
// AutoTrade AI
// database.js
// MongoDB Connection
// =====================================


import mongoose from "mongoose";
import dotenv from "dotenv";
import config from "./config/databaseConfig.js";


dotenv.config();



export async function connectDatabase(){


    try{


        await mongoose.connect(
            config.mongoURI
        );



        console.log(
            "Database Connected"
        );


    }


    catch(error){


        console.log(

            "Database Error:",

            error.message

        );


    }


}
