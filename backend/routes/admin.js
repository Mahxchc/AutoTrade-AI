// =====================================
// ..M AutoTrade AI
// Admin Routes
// User Management
// File: backend/routes/admin.js
// =====================================

import express from "express";

import {
    requireTelegramUser,
    requireAdmin
} from "../middleware/auth.js";

import User from "../models/User.js";


// =====================================
// Router :: M
// =====================================

const router =
    express.Router();


// =====================================
// Admin Middleware :: M
// فقط سازنده اجازه دسترسی دارد
// =====================================

router.use(
    requireTelegramUser,
    requireAdmin
);


// =====================================
// Helpers :: M
// =====================================

function normalizeStatus(
    value
) {

    return String(
        value || ""
    )
    .trim()
    .toUpperCase();

}


// =====================================
// Build User Response :: M
// =====================================

function buildUserResponse(
    user
) {

    return {

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

        isAdmin:
            user.isAdmin,

        botAccess:
            user.botAccess,

        botActive:
            user.botActive,

        status:
            user.status,

        walletId:
            user.walletId,

        createdAt:
            user.createdAt,

        updatedAt:
            user.updatedAt,

        lastLogin:
            user.lastLogin

    };

}


// =====================================
// GET USERS :: M
// دریافت کاربران
// =====================================

router.get(
    "/users",
    async (
        req,
        res,
        next
    ) => {

        try {

            const status =
                normalizeStatus(
                    req.query.status
                );


            const filter = {};


            // =================================
            // Filter Status
            // =================================

            if (
                [
                    "PENDING",
                    "ACTIVE",
                    "BLOCKED"
                ].includes(
                    status
                )
            ) {

                filter.status =
                    status;

            }


            // =================================
            // Filter Approval
            // =================================

            const approval =
                normalizeStatus(
                    req.query.approval
                );


            if (
                [
                    "PENDING",
                    "APPROVED",
                    "REJECTED"
                ].includes(
                    approval
                )
            ) {

                filter.approvalStatus =
                    approval;

            }


            // =================================
            // Get Users
            // =================================

            const users =
                await User.find(
                    filter
                )
                .sort({

                    createdAt:
                        -1

                })
                .limit(500)
                .lean();


            // =================================
            // Response
            // =================================

            return res.json({

                success:
                    true,

                count:
                    users.length,

                users:
                    users.map(
                        buildUserResponse
                    )

            });

        }

        catch (error) {

            console.error(
                "[ADMIN GET USERS ERROR]",
                error
            );

            next(error);

        }

    }
);


// =====================================
// GET PENDING USERS :: M
// کاربران منتظر تأیید
// =====================================

router.get(
    "/users/pending",
    async (
        req,
        res,
        next
    ) => {

        try {

            const users =
                await User.find({

                    approvalStatus:
                        "PENDING",

                    status:
                        {
                            $ne:
                                "BLOCKED"
                        },

                    isAdmin:
                        false

                })
                .sort({

                    createdAt:
                        1

                })
                .limit(500)
                .lean();


            return res.json({

                success:
                    true,

                count:
                    users.length,

                users:
                    users.map(
                        buildUserResponse
                    )

            });

        }

        catch (error) {

            console.error(
                "[ADMIN GET PENDING ERROR]",
                error
            );

            next(error);

        }

    }
);


// =====================================
// GET USER :: M
// دریافت یک کاربر
// =====================================

router.get(
    "/users/:userId",
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

                    success:
                        false,

                    message:
                        "کاربر پیدا نشد"

                });

            }


            return res.json({

                success:
                    true,

                user:
                    buildUserResponse(
                        user
                    )

            });

        }

        catch (error) {

            console.error(
                "[ADMIN GET USER ERROR]",
                error
            );

            next(error);

        }

    }
);


// =====================================
// APPROVE USER :: M
// تأیید کاربر
// =====================================

router.post(
    "/users/:userId/approve",
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

                    success:
                        false,

                    message:
                        "کاربر پیدا نشد"

                });

            }


            // =================================
            // Protect Admin :: M
            // =================================

            if (
                user.isAdmin === true
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "حساب مدیر قابل تغییر با این مسیر نیست"

                });

            }


            // =================================
            // Approve
            // =================================

            user.accessEnabled =
                true;

            user.approvalStatus =
                "APPROVED";

            user.status =
                "ACTIVE";


            // =================================
            // Bot Access
            // =================================
            //
            // تأیید حساب با اجازه استفاده
            // از Mini App انجام می‌شود.
            //
            // اجازه معامله خودکار جداگانه است.
            //

            user.botAccess =
                false;

            user.botActive =
                false;


            await user.save();


            return res.json({

                success:
                    true,

                approved:
                    true,

                message:
                    "کاربر با موفقیت تأیید شد",

                user:
                    buildUserResponse(
                        user
                    )

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
// REJECT USER :: M
// رد درخواست کاربر
// =====================================

router.post(
    "/users/:userId/reject",
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

                    success:
                        false,

                    message:
                        "کاربر پیدا نشد"

                });

            }


            if (
                user.isAdmin === true
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "حساب مدیر قابل رد شدن نیست"

                });

            }


            // =================================
            // Reject
            // =================================

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

                success:
                    true,

                rejected:
                    true,

                message:
                    "درخواست کاربر رد شد",

                user:
                    buildUserResponse(
                        user
                    )

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
// BLOCK USER :: M
// مسدود کردن کاربر
// =====================================

router.post(
    "/users/:userId/block",
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

                    success:
                        false,

                    message:
                        "کاربر پیدا نشد"

                });

            }


            // =================================
            // Protect Admin :: M
            // =================================

            if (
                user.isAdmin === true
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "حساب مدیر قابل مسدود شدن نیست"

                });

            }


            // =================================
            // Block
            // =================================

            user.status =
                "BLOCKED";

            user.accessEnabled =
                false;

            user.botAccess =
                false;

            user.botActive =
                false;


            await user.save();


            return res.json({

                success:
                    true,

                blocked:
                    true,

                message:
                    "کاربر مسدود شد",

                user:
                    buildUserResponse(
                        user
                    )

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
// UNBLOCK USER :: M
// رفع مسدودی
// =====================================

router.post(
    "/users/:userId/unblock",
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

                    success:
                        false,

                    message:
                        "کاربر پیدا نشد"

                });

            }


            if (
                user.isAdmin === true
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "حساب مدیر نیازی به رفع مسدودی ندارد"

                });

            }


            // =================================
            // Unblock
            // =================================
            //
            // بعد از رفع مسدودی، کاربر دوباره
            // باید توسط مدیر تأیید شود.
            //

            user.status =
                "PENDING";

            user.accessEnabled =
                false;

            user.approvalStatus =
                "PENDING";

            user.botAccess =
                false;

            user.botActive =
                false;


            await user.save();


            return res.json({

                success:
                    true,

                unblocked:
                    true,

                message:
                    "مسدودی کاربر برداشته شد و حساب دوباره منتظر تأیید است",

                user:
                    buildUserResponse(
                        user
                    )

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
// BOT ACCESS ON :: M
// اجازه استفاده از ربات
// =====================================

router.post(
    "/users/:userId/bot-access/enable",
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

                    success:
                        false,

                    message:
                        "کاربر پیدا نشد"

                });

            }


            if (
                user.isAdmin === true
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "حساب مدیر از قبل دسترسی کامل دارد"

                });

            }


            // =================================
            // Must Be Approved
            // =================================

            const approved =
                user.accessEnabled === true &&
                user.approvalStatus ===
                    "APPROVED" &&
                user.status ===
                    "ACTIVE";


            if (!approved) {

                return res.status(403).json({

                    success:
                        false,

                    message:
                        "ابتدا باید حساب کاربر تأیید شود"

                });

            }


            user.botAccess =
                true;

            user.botActive =
                false;


            await user.save();


            return res.json({

                success:
                    true,

                botAccess:
                    true,

                message:
                    "اجازه استفاده از ربات فعال شد",

                user:
                    buildUserResponse(
                        user
                    )

            });

        }

        catch (error) {

            console.error(
                "[ADMIN ENABLE BOT ACCESS ERROR]",
                error
            );

            next(error);

        }

    }
);


// =====================================
// BOT ACCESS OFF :: M
// لغو اجازه ربات
// =====================================

router.post(
    "/users/:userId/bot-access/disable",
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

                    success:
                        false,

                    message:
                        "کاربر پیدا نشد"

                });

            }


            if (
                user.isAdmin === true
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "دسترسی ربات سازنده قابل حذف نیست"

                });

            }


            user.botAccess =
                false;

            user.botActive =
                false;


            await user.save();


            return res.json({

                success:
                    true,

                botAccess:
                    false,

                message:
                    "دسترسی ربات کاربر غیرفعال شد",

                user:
                    buildUserResponse(
                        user
                    )

            });

        }

        catch (error) {

            console.error(
                "[ADMIN DISABLE BOT ACCESS ERROR]",
                error
            );

            next(error);

        }

    }
);


// =====================================
// ADMIN SUMMARY :: M
// خلاصه وضعیت کاربران
// =====================================

router.get(
    "/summary",
    async (
        req,
        res,
        next
    ) => {

        try {

            const [

                totalUsers,

                pendingUsers,

                activeUsers,

                blockedUsers,

                approvedUsers,

                botUsers

            ] =
                await Promise.all([

                    User.countDocuments({

                        isAdmin:
                            false

                    }),

                    User.countDocuments({

                        isAdmin:
                            false,

                        approvalStatus:
                            "PENDING"

                    }),

                    User.countDocuments({

                        isAdmin:
                            false,

                        status:
                            "ACTIVE",

                        accessEnabled:
                            true

                    }),

                    User.countDocuments({

                        isAdmin:
                            false,

                        status:
                            "BLOCKED"

                    }),

                    User.countDocuments({

                        isAdmin:
                            false,

                        approvalStatus:
                            "APPROVED"

                    }),

                    User.countDocuments({

                        isAdmin:
                            false,

                        botAccess:
                            true

                    })

                ]);


            return res.json({

                success:
                    true,

                summary: {

                    totalUsers,

                    pendingUsers,

                    activeUsers,

                    blockedUsers,

                    approvedUsers,

                    botUsers

                }

            });

        }

        catch (error) {

            console.error(
                "[ADMIN SUMMARY ERROR]",
                error
            );

            next(error);

        }

    }
);


// =====================================
// Export Router :: M
// =====================================

export default router;