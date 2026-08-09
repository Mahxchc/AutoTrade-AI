// =====================================
// User Routes:: M
// AutoTrade AI
// User Registration & Approval API
// File: backend/routes/User.js
// =====================================

import express from "express";

import User from "../models/User.js";

import {
    requireUser,
    requireAdmin
} from "../middleware/auth.js";


const router = express.Router();


// =====================================
// CREATE USER / APPLICATION
// POST /api/users
// =====================================

router.post("/", async (req, res, next) => {

    try {

        const {

            telegramId,
            username,
            firstName,
            lastName,
            phoneNumber

        } = req.body;


        // =====================================
        // Validate Required Data
        // =====================================

        if (
            !telegramId ||
            !firstName ||
            !lastName ||
            !phoneNumber
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Telegram ID, first name, last name and phone number are required"

            });

        }


        // =====================================
        // Find Existing User
        // =====================================

        let user = await User.findOne({

            telegramId

        });


        // =====================================
        // Existing User
        // =====================================

        if (user) {

            user.username =
                username || user.username;

            user.firstName =
                firstName;

            user.lastName =
                lastName;

            user.phoneNumber =
                phoneNumber;

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


        // =====================================
        // New User
        // =====================================

        user = await User.create({

            telegramId,

            username:
                username || "",

            firstName,

            lastName,

            phoneNumber,

            accessEnabled: false,

            approvalStatus:
                "PENDING",

            isAdmin: false,

            botAccess: false,

            botActive: false,

            status:
                "PENDING"

        });


        return res.status(201).json({

            success: true,

            message:
                "Your approval request has been sent to the owner.",

            user

        });

    }

    catch (error) {

        next(error);

    }

});


// =====================================
// GET CURRENT USER
// GET /api/users/me
// =====================================

router.get("/me", requireUser, async (req, res, next) => {

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

});


// =====================================
// APPROVE USER
// POST /api/users/admin/:userId/approve
// =====================================

router.post(
    "/admin/:userId/approve",
    requireUser,
    requireAdmin,
    async (req, res, next) => {

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


// =====================================
// REJECT USER
// POST /api/users/admin/:userId/reject
// =====================================

router.post(
    "/admin/:userId/reject",
    requireUser,
    requireAdmin,
    async (req, res, next) => {

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


// =====================================
// GET PENDING USERS
// GET /api/users/admin/pending
// =====================================

router.get(
    "/admin/pending",
    requireUser,
    requireAdmin,
    async (req, res, next) => {

        try {

            const users =
                await User.find({

                    approvalStatus:
                        "PENDING"

                })
                .sort({

                    createdAt: -1

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


// =====================================
// GET ALL USERS
// GET /api/users/admin/all
// =====================================

router.get(
    "/admin/all",
    requireUser,
    requireAdmin,
    async (req, res, next) => {

        try {

            const users =
                await User.find({})
                .sort({

                    createdAt: -1

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


// =====================================
// GET USER BY TELEGRAM ID
// GET /api/users/:telegramId
// =====================================

router.get(
    "/:telegramId",
    async (req, res, next) => {

        try {

            const {
                telegramId
            } = req.params;


            if (!telegramId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Telegram ID is required"

                });

            }


            const user =
                await User.findOne({

                    telegramId

                });


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }


            user.lastLogin =
                new Date();

            await user.save();


            return res.status(200).json({

                success: true,

                user

            });

        }

        catch (error) {

            next(error);

        }

    }
);


export default router;
