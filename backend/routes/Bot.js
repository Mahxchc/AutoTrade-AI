// =====================================
// AutoTrade AI
// Bot Routes
// =====================================

import express from "express";
import Bot from "../models/Bot.js";


const router = express.Router();



// دریافت وضعیت ربات کاربر

router.get("/:userId", async (req,res)=>{


    try{


        const bot = await Bot.findOne({

            userId:req.params.userId

        });



        if(!bot){


            return res.json({

                status:"STOPPED",

                strategy:"AI Scalping",

                accuracy:0,

                confidence:0


            });


        }



        res.json(bot);



    }


    catch(error){


        res.status(500).json({

            error:error.message

        });


    }


});






// روشن کردن ربات

router.post("/start/:userId", async(req,res)=>{


    try{


        const bot = await Bot.findOneAndUpdate(

            {
                userId:req.params.userId
            },


            {

                status:"ACTIVE",

                lastRun:new Date()

            },


            {

                new:true,

                upsert:true

            }


        );



        res.json({

            success:true,

            bot:bot

        });



    }


    catch(error){


        res.status(500).json({

            error:error.message

        });


    }


});







// خاموش کردن ربات

router.post("/stop/:userId", async(req,res)=>{


    try{


        const bot = await Bot.findOneAndUpdate(

            {
                userId:req.params.userId
            },


            {

                status:"STOPPED"

            },


            {

                new:true

            }


        );


        res.json({

            success:true,

            bot:bot

        });



    }


    catch(error){


        res.status(500).json({

            error:error.message

        });


    }


});





export default router;
