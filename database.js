// =====================================
// AutoTrade AI
// database.js
// MongoDB Connection
// =====================================


import mongoose from "mongoose";



export async function connectDatabase(){


    try{


        await mongoose.connect(

            process.env.MONGO_URI

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
