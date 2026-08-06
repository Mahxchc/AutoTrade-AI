// =====================================
// AutoTrade AI
// Trade Routes
// =====================================

import express from "express";
import Trade from "../models/Trade.js";


const router = express.Router();



// دریافت معاملات کاربر

router.get("/:userId", async (req,res)=>{


    try{


        const trades = await Trade.find({

            userId:req.params.userId

        })
        .sort({

            createdAt:-1

        });



        res.json(trades);



    }


    catch(error){


        res.status(500).json({

            error:error.message

        });


    }


});





// ایجاد معامله جدید

router.post("/", async(req,res)=>{


    try{


        const trade = await Trade.create(

            req.body

        );


        res.json({

            success:true,

            trade:trade

        });



    }


    catch(error){


        res.status(500).json({

            error:error.message

        });


    }


});





export default router;
