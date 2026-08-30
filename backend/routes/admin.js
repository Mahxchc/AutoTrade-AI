// =====================================
// ..M AutoTrade AI
// Admin Routes
// مدیریت کاربران توسط سازنده
// File: backend/routes/admin.js
// =====================================

import express from "express";

import User from "../models/User.js";

import {
    requireTelegramUser,
    requireAdmin
} from "../middleware/auth.js";


const router =
    express.Router();


// =====================================
// Admin Authentication
// =====================================
//
// همه مسیرهای این فایل:
//
// 1. Telegram Authentication
// 2. بررسی Admin بودن کاربر
//
// فقط ADMIN_TELEGRAM_ID اجازه دارد.
//
// =====================================

router.use(
    requireTelegramUser
);

router.use(
    requireAdmin
);


// =====================================
// GET /api/admin/users
// دریافت لیست کاربران
// =====================================

router.get(
    "/users",
    async (req, res, next) => {

        try {

            const users =
                await User.find({})
                    .select(
                        [
                            "_id",
                            "telegramId",
                            "username",
                            "firstName",
                            "lastName",
                            "phoneNumber",
                            "accessEnabled",
                            "approvalStatus",
                            "isAdmin",
                            "botAccess",
                            "botActive",
                            "status",
                            "lastLogin",
                            "createdAt",
                            "updatedAt"
                        ].join(" ")
                    )
                    .sort({
                        createdAt: -1
                    })
                    .limit(500);


            return res.json({

                success: true,

                count:
                    users.length,

                users

            });

        }

        catch (error) {

            console.error(
                "[ADMIN USERS ERROR]",
                error
            );

            next(error);

        }

    }
);


// =====================================
// GET /api/admin/users/pending
// کاربران در انتظار تأیید
// =====================================

router.get(
    "/users/pending",
    async (req, res, next) => {

        try {

            const users =
                await User.find({

                    $or: [

                        {
                            accessEnabled:
                                false,

                            status:
                                "PENDING"
                        },

                        {
                            approvalStatus:
                                "PENDING"
                        }

                    ]

                })
                .select(
                    [
                        "_id",
                        "telegramId",
                        "username",
                        "firstName",
                        "lastName",
                        "phoneNumber",
                        "accessEnabled",
                        "approvalStatus",
                        "isAdmin",
                        "botAccess",
                        "botActive",
                        "status",
                        "lastLogin",
                        "createdAt"
                    ].join(" ")
                )
                .sort({
                    createdAt: 1
                })
                .limit(500);


            return res.json({

                success: true,

                count:
                    users.length,

                users

            });

        }

        catch (error) {

            console.error(
                "[ADMIN PENDING USERS ERROR]",
                error
            );

            next(error);

        }

    }
);


// =====================================
// GET /api/admin/users/:id
// دریافت اطلاعات یک کاربر
// =====================================

router.get(
    "/users/:id",
    async (req, res, next) => {

        try {

            const user =
                await User.findById(
                    req.params.id
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "کاربر پیدا نشد"

                });

            }


            return res.json({

                success: true,

                user

            });

        }

        catch (error) {

            console.error(
                "[ADMIN USER DETAIL ERROR]",
                error
            );

            next(error);

        }

    }
);


// =====================================
// POST /api/admin/users/:id/approve
// تأیید کاربر
// =====================================

router.post(
    "/users/:id/approve",
    async (req, res, next) => {

        try {

            const user =
                await User.findById(
                    req.params.id
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "کاربر پیدا نشد"

                });

            }


            // =================================
            // جلوگیری از تغییر وضعیت Admin
            // =================================

            if (
                user.isAdmin === true
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "حساب Admin نیاز به تأیید ندارد"

                });

            }


            // =================================
            // Approve User
            // =================================

            user.accessEnabled =
                true;

            user.approvalStatus =
                "APPROVED";

            user.status =
                "ACTIVE";


            await user.save();


            return res.json({

                success: true,

                message:
                    "کاربر با موفقیت تأیید شد",

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

                    accessEnabled:
                        user.accessEnabled,

                    approvalStatus:
                        user.approvalStatus,

                    status:
                        user.status,

                    botAccess:
                        user.botAccess,

                    botActive:
                        user.botActive

                }

            });

        }

        catch (error) {

            console.error(
                "[ADMIN APPROVE USER ERROR]",
                error
            );

            next(error);

        }

    }
);


// =====================================
// POST /api/admin/users/:id/reject
// رد کردن کاربر
// =====================================

router.post(
    "/users/:id/reject",
    async (req, res, next) => {

        try {

            const user =
                await User.findById(
                    req.params.id
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "کاربر پیدا نشد"

                });

            }


            if (
                user.isAdmin === true
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "نمی‌توان Admin را رد کرد"

                });

            }


            user.accessEnabled =
                false;

            user.approvalStatus =
                "REJECTED";

            user.status =
                "PENDING";

            user.botAccess =
                false;

            user.botActive =
                false;


            await user.save();


            return res.json({

                success: true,

                message:
                    "درخواست کاربر رد شد",

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

                    accessEnabled:
                        user.accessEnabled,

                    approvalStatus:
                        user.approvalStatus,

                    status:
                        user.status,

                    botAccess:
                        user.botAccess,

                    botActive:
                        user.botActive

                }

            });

        }

        catch (error) {

            console.error(
                "[ADMIN REJECT USER ERROR]",
                error
            );

            next(error);

        }

    }
);


// =====================================
// POST /api/admin/users/:id/block
// مسدود کردن کاربر
// =====================================

router.post(
    "/users/:id/block",
    async (req, res, next) => {

        try {

            const user =
                await User.findById(
                    req.params.id
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "کاربر پیدا نشد"

                });

            }


            if (
                user.isAdmin === true
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "نمی‌توان حساب Admin را مسدود کرد"

                });

            }


            user.accessEnabled =
                false;

            user.approvalStatus =
                "REJECTED";

            user.status =
                "BLOCKED";

            user.botAccess =
                false;

            user.botActive =
                false;


            await user.save();


            return res.json({

                success: true,

                message:
                    "کاربر مسدود شد",

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

                    accessEnabled:
                        user.accessEnabled,

                    approvalStatus:
                        user.approvalStatus,

                    status:
                        user.status,

                    botAccess:
                        user.botAccess,

                    botActive:
                        user.botActive

                }

            });

        }

        catch (error) {

            console.error(
                "[ADMIN BLOCK USER ERROR]",
                error
            );

            next(error);

        }

    }
);


// =====================================
// POST /api/admin/users/:id/unblock
// رفع مسدودی کاربر
// =====================================

router.post(
    "/users/:id/unblock",
    async (req, res, next) => {

        try {

            const user =
                await User.findById(
                    req.params.id
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "کاربر پیدا نشد"

                });

            }


            if (
                user.isAdmin === true
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "حساب Admin نیازی به رفع مسدودی ندارد"

                });

            }


            user.accessEnabled =
                true;

            user.approvalStatus =
                "APPROVED";

            user.status =
                "ACTIVE";


            await user.save();


            return res.json({

                success: true,

                message:
                    "دسترسی کاربر فعال شد",

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

                    accessEnabled:
                        user.accessEnabled,

                    approvalStatus:
                        user.approvalStatus,

                    status:
                        user.status,

                    botAccess:
                        user.botAccess,

                    botActive:
                        user.botActive

                }

            });

        }

        catch (error) {

            console.error(
                "[ADMIN UNBLOCK USER ERROR]",
                error
            );

            next(error);

        }

    }
);


// =====================================
// POST /api/admin/users/:id/bot-access
// فعال / غیرفعال کردن دسترسی ربات
// =====================================

router.post(
    "/users/:id/bot-access",
    async (req, res, next) => {

        try {

            const user =
                await User.findById(
                    req.params.id
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "کاربر پیدا نشد"

                });

            }


            if (
                user.isAdmin === true
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "تنظیم دسترسی Bot برای Admin مجاز نیست"

                });

            }


            const enabled =
                req.body?.enabled;


            if (
                typeof enabled !==
                "boolean"
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "مقدار enabled باید true یا false باشد"

                });

            }


            // =================================
            // فقط کاربر تأییدشده Bot بگیرد
            // =================================

            if (
                enabled === true &&
                (
                    user.accessEnabled !== true ||
                    user.status !== "ACTIVE"
                )
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "ابتدا دسترسی کاربر را تأیید کنید"

                });

            }


            user.botAccess =
                enabled;


            if (
                enabled === false
            ) {

                user.botActive =
                    false;

            }


            await user.save();


            return res.json({

                success: true,

                message:
                    enabled
                        ? "دسترسی ربات فعال شد"
                        : "دسترسی ربات غیرفعال شد",

                user: {

                    id:
                        user._id,

                    telegramId:
                        user.telegramId,

                    accessEnabled:
                        user.accessEnabled,

                    approvalStatus:
                        user.approvalStatus,

                    status:
                        user.status,

                    botAccess:
                        user.botAccess,

                    botActive:
                        user.botActive

                }

            });

        }

        catch (error) {

            console.error(
                "[ADMIN BOT ACCESS ERROR]",
                error
            );

            next(error);

        }

    }
);


// =====================================
// GET /api/admin/stats
// آمار کلی کاربران
// =====================================

router.get(
    "/stats",
    async (req, res, next) => {

        try {

            const [

                total,

                pending,

                active,

                blocked

            ] =
                await Promise.all([

                    User.countDocuments({}),

                    User.countDocuments({

                        status:
                            "PENDING"

                    }),

                    User.countDocuments({

                        status:
                            "ACTIVE"

                    }),

                    User.countDocuments({

                        status:
                            "BLOCKED"

                    })

                ]);


            return res.json({

                success: true,

                stats: {

                    total,

                    pending,

                    active,

                    blocked

                }

            });

        }

        catch (error) {

            console.error(
                "[ADMIN STATS ERROR]",
                error
            );

            next(error);

        }

    }
);


// =====================================
// Admin Self Check
// GET /api/admin/me
// =====================================

router.get(
    "/me",
    async (req, res) => {

        return res.json({

            success: true,

            isAdmin: true,

            telegramId:
                String(
                    req.telegramUser.id
                )

        });

    }
);


// =====================================
// Export
// =====================================

export default router;