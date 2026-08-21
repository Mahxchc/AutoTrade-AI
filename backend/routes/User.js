// ..M User Routes
// AutoTrade AI
// User Registration & Approval API
// File: backend/routes/User.js

import express from "express";

import User from "../models/User.js";

import {
    requireUser,
    requireAdmin
} from "../middleware/auth.js";


const router =
    express.Router();


// =========================================================
// ..M CREATE OR UPDATE USER
// POST /user
// =========================================================

router.post(
    "/",
    async (
        req,
        res,
        next
    ) => {

        try {

            const {

                telegramId,
                username,
                firstName,
                lastName,
                phoneNumber

            } = req.body;


            // -------------------------------------------------
            // ..M VALIDATE TELEGRAM ID
            // -------------------------------------------------

            if (!telegramId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Telegram ID is required"

                });

            }


            const normalizedTelegramId =
                String(
                    telegramId
                ).trim();


            // -------------------------------------------------
            // ..M FIND EXISTING USER
            // -------------------------------------------------

            let user =
                await User.findOne({

                    telegramId:
                        normalizedTelegramId

                });


            // -------------------------------------------------
            // ..M UPDATE EXISTING USER
            // -------------------------------------------------

            if (user) {

                if (username !== undefined) {

                    user.username =
                        String(
                            username || ""
                        ).trim();

                }


                if (firstName !== undefined) {

                    user.firstName =
                        String(
                            firstName || ""
                        ).trim();

                }


                if (lastName !== undefined) {

                    user.lastName =
                        String(
                            lastName || ""
                        ).trim();

                }


                if (phoneNumber !== undefined) {

                    user.phoneNumber =
                        String(
                            phoneNumber || ""
                        ).trim();

                }


                user.lastLogin =
                    new Date();


                await user.save();


                return res.status(200).json({

                    success: true,

                    message:
                        "User information updated",

                    user

                });

            }


            // -------------------------------------------------
            // ..M CREATE NEW USER
            // -------------------------------------------------

            user =
                await User.create({

                    telegramId:
                        normalizedTelegramId,

                    username:
                        String(
                            username || ""
                        ).trim(),

                    firstName:
                        String(
                            firstName || ""
                        ).trim(),

                    lastName:
                        String(
                            lastName || ""
                        ).trim(),

                    phoneNumber:
                        String(
                            phoneNumber || ""
                        ).trim(),

                    accessEnabled:
                        false,

                    approvalStatus:
                        "PENDING",

                    isAdmin:
                        false,

                    botAccess:
                        false,

                    botActive:
                        false,

                    status:
                        "PENDING",

                    lastLogin:
                        new Date()

                });


            return res.status(201).json({

                success: true,

                message:
                    "User created successfully. Waiting for approval.",

                user

            });

        }

        catch (error) {

            next(error);

        }

    }
);


// =========================================================
// ..M GET CURRENT USER
// GET /user/me
// =========================================================

router.get(
    "/me",
    requireUser,
    async (
        req,
        res,
        next
    ) => {

        try {

            return res.status(200).json({

                success: true,

                user:
                    req.user

            });

        }

        catch (error) {

            next(error);

        }

    }
);


// =========================================================
// ..M APPROVE USER
// POST /user/admin/:userId/approve
// =========================================================

router.post(
    "/admin/:userId/approve",
    requireUser,
    requireAdmin,
    async (
        req,
        res,
        next
    ) => {

        try {

            const user =
                await User.findById(
                    req.params.userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            user.approvalStatus =
                "APPROVED";

            user.accessEnabled =
                true;

            user.botAccess =
                true;

            user.status =
                "ACTIVE";

            user.botActive =
                false;


            await user.save();


            return res.status(200).json({

                success: true,

                message:
                    "User approved successfully",

                user

            });

        }

        catch (error) {

            next(error);

        }

    }
);


// =========================================================
// ..M REJECT USER
// POST /user/admin/:userId/reject
// =========================================================

router.post(
    "/admin/:userId/reject",
    requireUser,
    requireAdmin,
    async (
        req,
        res,
        next
    ) => {

        try {

            const user =
                await User.findById(
                    req.params.userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            user.approvalStatus =
                "REJECTED";

            user.accessEnabled =
                false;

            user.botAccess =
                false;

            user.botActive =
                false;

            user.status =
                "BLOCKED";


            await user.save();


            return res.status(200).json({

                success: true,

                message:
                    "User application rejected",

                user

            });

        }

        catch (error) {

            next(error);

        }

    }
);


// =========================================================
// ..M GET PENDING USERS
// GET /user/admin/pending
// =========================================================

router.get(
    "/admin/pending",
    requireUser,
    requireAdmin,
    async (
        req,
        res,
        next
    ) => {

        try {

            const users =
                await User.find({

                    approvalStatus:
                        "PENDING"

                })
                .sort({

                    createdAt:
                        -1

                });


            return res.status(200).json({

                success: true,

                count:
                    users.length,

                users

            });

        }

        catch (error) {

            next(error);

        }

    }
);


// =========================================================
// ..M GET ALL USERS
// GET /user/admin/all
// =========================================================

router.get(
    "/admin/all",
    requireUser,
    requireAdmin,
    async (
        req,
        res,
        next
    ) => {

        try {

            const users =
                await User.find({})
                .sort({

                    createdAt:
                        -1

                });


            return res.status(200).json({

                success: true,

                count:
                    users.length,

                users

            });

        }

        catch (error) {

            next(error);

        }

    }
);


// =========================================================
// ..M GET USER BY TELEGRAM ID
// GET /user/:telegramId
// =========================================================
//
// اگر کاربر وجود نداشته باشد:
// به صورت خودکار یک حساب PENDING ساخته می‌شود.
//
// نکته امنیتی:
// PENDING هیچ دسترسی معاملاتی ندارد.
// برای معامله باید:
//
// approvalStatus = APPROVED
// accessEnabled = true
// botAccess = true
// status = ACTIVE
//
// =========================================================

router.get(
    "/:telegramId",
    async (
        req,
        res,
        next
    ) => {

        try {

            const telegramId =
                String(
                    req.params.telegramId || ""
                ).trim();


            if (!telegramId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Telegram ID is required"

                });

            }


            // -------------------------------------------------
            // ..M FIND USER
            // -------------------------------------------------

            let user =
                await User.findOne({

                    telegramId

                });


            // -------------------------------------------------
            // ..M CREATE USER AUTOMATICALLY
            // -------------------------------------------------

            if (!user) {

                user =
                    await User.create({

                        telegramId,

                        username:
                            "",

                        firstName:
                            "",

                        lastName:
                            "",

                        phoneNumber:
                            "",

                        accessEnabled:
                            false,

                        approvalStatus:
                            "PENDING",

                        isAdmin:
                            false,

                        botAccess:
                            false,

                        botActive:
                            false,

                        status:
                            "PENDING",

                        lastLogin:
                            new Date()

                    });


                return res.status(201).json({

                    success: true,

                    created:
                        true,

                    message:
                        "User created and is waiting for approval.",

                    user

                });

            }


            // -------------------------------------------------
            // ..M UPDATE LAST LOGIN
            // -------------------------------------------------

            user.lastLogin =
                new Date();


            await user.save();


            // -------------------------------------------------
            // ..M RETURN USER
            // -------------------------------------------------

            return res.status(200).json({

                success: true,

                created:
                    false,

                user

            });

        }

        catch (error) {

            // -------------------------------------------------
            // ..M DUPLICATE TELEGRAM ID
            // -------------------------------------------------

            if (
                error &&
                error.code === 11000
            ) {

                try {

                    const existingUser =
                        await User.findOne({

                            telegramId:
                                String(
                                    req.params.telegramId
                                ).trim()

                        });


                    if (existingUser) {

                        return res.status(200).json({

                            success: true,

                            created:
                                false,

                            user:
                                existingUser

                        });

                    }

                }

                catch (findError) {

                    console.error(
                        "Duplicate User Recovery Error:",
                        findError
                    );

                }

            }


            next(error);

        }

    }
);


// =========================================================
// ..M EXPORT
// =========================================================

export default router;