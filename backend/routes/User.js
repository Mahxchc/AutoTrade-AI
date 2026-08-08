// =====================================
// AutoTrade AI
// User Routes
// =====================================

import express from "express";
import User from "../models/User.js";


const router = express.Router();



// دریافت اطلاعات کاربر

router.get("/:telegramId", async (req,res)=>{


    try{


        const user = await User.findOne({

            telegramId:req.params.telegramId

        });



        if(!user){


            return res.json({

                message:"User not found"

            });


        }



        res.json(user);



    }


    catch(error){


        res.status(500).json({

            error:error.message

        });


    }


});





// ساخت کاربر جدید

router.post("/", async(req,res)=>{


    try{


        const user = await User.create(

            req.body

        );


        res.json({

            success:true,

            user:user

        });



    }


    catch(error){


        res.status(500).json({

            error:error.message

        });


    }


});





export default router;
