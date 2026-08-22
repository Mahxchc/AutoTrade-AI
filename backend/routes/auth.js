// =====================================
// Auth Routes :: M
// AutoTrade AI
// Telegram Authentication
// File: backend/routes/auth.js
// =====================================

import express from "express";

import {
    requireTelegramUser
} from "../middleware/auth.js";


const router =
    express.Router();


// =====================================
// Telegram Login
// =====================================

router.post(
    "/telegram",
    requireTelegramUser,
    async (req, res, next) => {

        try {

            const user =
                req.user;


            return res.json({

                success: true,

                message:
                    "Telegram authentication successful",

                user: {

                    id:
                        user._id,

                    telegramId:
                        user.telegramId,

                    username:
                        user.username,

                    firstName:
                        user.firstName,

                    lastName:
                        user.lastName,

                    status:
                        user.status,

                    accessEnabled:
                        user.accessEnabled,

                    isAdmin:
                        user.isAdmin,

                    botAccess:
                        user.botAccess,

                    botActive:
                        user.botActive

                }

            });

        }

        catch (error) {

            next(error);

        }

    }
);


// =====================================
// Current Authenticated User
// =====================================

router.get(
    "/me",
    requireTelegramUser,
    async (req, res, next) => {

        try {

            const user =
                req.user;


            return res.json({

                success: true,

                user: {

                    id:
                        user._id,

                    telegramId:
                        user.telegramId,

                    username:
                        user.username,

                    firstName:
                        user.firstName,

                    lastName:
                        user.lastName,

                    status:
                        user.status,

                    accessEnabled:
                        user.accessEnabled,

                    isAdmin:
                        user.isAdmin,

                    botAccess:
                        user.botAccess,

                    botActive:
                        user.botActive

                }

            });

        }

        catch (error) {

            next(error);

        }

    }
);


export default router;