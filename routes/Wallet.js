// =====================================
// AutoTrade AI
// Wallet Routes
// =====================================

import express from "express";
import Wallet from "../models/Wallet.js";


const router = express.Router();



// دریافت کیف پول کاربر

router.get("/:userId", async (req, res)=>{


    try{


        const wallet = await Wallet.findOne({

            userId: req.params.userId

        });



        if(!wallet){


            return res.json({

                balance:0,

                currency:"USDT",

                message:
                "Wallet not found"


            });


        }




        res.json(wallet);



    }


    catch(error){


        res.status(500).json({

            error:error.message

        });


    }


});






export default router;
