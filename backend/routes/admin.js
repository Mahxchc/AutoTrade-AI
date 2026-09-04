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

import {
    sendApprovalNotification,
    sendRejectionNotification
} from "../bot.js";

const router =
    express.Router();

// =====================================
// Admin Authentication :: M
// =====================================

router.use(
    requireTelegramUser
);

router.use(
    requireAdmin
);

// =====================================
// GET /api/admin/users
// همه کاربران
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
// در انتظار تأیید
// =====================================

router.get(
    "/users/pending",
    async (req, res, next) => {

        try {

            const users =
                await User.find({

                    $or: [

                        {
                            approvalStatus:
                                "PENDING"
                        },

                        {
                            status:
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
                        "createdAt",
                        "updatedAt"
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
// تأیید دسترسی کاربر
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
            // Approve :: M
            // =================================

            user.accessEnabled =
                true;

            user.approvalStatus =
                "APPROVED";

            user.status =
                "ACTIVE";

            user.botAccess =
                true;

            user.botActive =
                false;

            await user.save();

            // =================================
            // Notify User :: M
            // =================================

            let notificationSent =
                false;

            try {

                notificationSent =
                    await sendApprovalNotification(
                        user
                    );

            }

            catch (notifyError) {

                console.error(
                    "[APPROVAL TELEGRAM NOTIFICATION ERROR]",
                    notifyError
                );

            }

            return res.json({

                success: true,

                message:
                    notificationSent
                        ? "کاربر تأیید شد و پیام برای کاربر ارسال شد"
                        : "کاربر تأیید شد اما پیام Telegram ارسال نشد",

                notificationSent,

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

                    phoneNumber:
                        user.phoneNumber,

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
// رد درخواست دسترسی
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

            // =================================
            // Reject :: M
            // =================================

            user.accessEnabled =
                false;

            user.approvalStatus =
                "REJECTED";

            user.status =
                "REJECTED";

            user.botAccess =
                false;

            user.botActive =
                false;

            await user.save();

            // =================================
            // Notify User :: M
            // =================================

            let notificationSent =
                false;

            try {

                notificationSent =
                    await sendRejectionNotification(
                        user
                    );

            }

            catch (notifyError) {

                console.error(
                    "[REJECTION TELEGRAM NOTIFICATION ERROR]",
                    notifyError
                );

            }

            return res.json({

                success: true,

                message:
                    notificationSent
                        ? "درخواست رد شد و پیام برای کاربر ارسال شد"
                        : "درخواست رد شد اما پیام Telegram ارسال نشد",

                notificationSent,

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

                    phoneNumber:
                        user.phoneNumber,

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

                user

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

            user.botAccess =
                true;

            user.botActive =
                false;

            await user.save();

            // =================================
            // Notify User :: M
            // =================================

            try {

                await sendApprovalNotification(
                    user
                );

            }

            catch (notifyError) {

                console.error(
                    "[UNBLOCK TELEGRAM NOTIFICATION ERROR]",
                    notifyError
                );

            }

            return res.json({

                success: true,

                message:
                    "دسترسی کاربر فعال شد",

                user

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
                        "تنظیم Bot برای Admin مجاز نیست"

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

            if (!enabled) {

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

                user

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
// =====================================

router.get(
    "/stats",
    async (req, res, next) => {

        try {

            const [
                total,
                pending,
                active,
                rejected,
                blocked
            ] =
                await Promise.all([

                    User.countDocuments({}),

                    User.countDocuments({

                        approvalStatus:
                            "PENDING"

                    }),

                    User.countDocuments({

                        approvalStatus:
                            "APPROVED",

                        status:
                            "ACTIVE"

                    }),

                    User.countDocuments({

                        approvalStatus:
                            "REJECTED"

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

                    rejected,

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
// Export :: M
// =====================================

export default router;