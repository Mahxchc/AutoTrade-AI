// =====================================
// AutoTrade AI
// database.js
// MongoDB Connection
// =====================================


import mongoose from "mongoose";
import config from "./config/databaseConfig.js";


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
