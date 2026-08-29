// =====================================
// ..M AutoTrade AI
// Withdraw Routes
// برداشت تومان
// File: backend/routes/withdraw.js
// =====================================

import express from "express";
import mongoose from "mongoose";

import Withdraw from "../models/Withdraw.js";
import User from "../models/User.js";

const router = express.Router();


// =====================================
// CREATE WITHDRAW REQUEST
// ایجاد درخواست برداشت
// POST /api/withdraw
// =====================================

router.post(
    "/",
    async (req, res) => {

        try {

            const {
                userId,
                amountToman,
                iban,
                description
            } = req.body;


            // =====================================
            // بررسی User ID
            // =====================================

            if (!userId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "شناسه کاربر ارسال نشده است"

                });

            }


            if (
                !mongoose.Types.ObjectId.isValid(
                    userId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "شناسه کاربر نامعتبر است"

                });

            }


            // =====================================
            // بررسی مبلغ
            // تومان
            // =====================================

            const amount =
                Number(amountToman);


            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "مبلغ برداشت نامعتبر است"

                });

            }


            // حداقل برداشت
            const MIN_WITHDRAW_TOMAN = 100000;


            if (
                amount <
                MIN_WITHDRAW_TOMAN
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `حداقل مبلغ برداشت ${MIN_WITHDRAW_TOMAN.toLocaleString("fa-IR")} تومان است`

                });

            }


            // =====================================
            // بررسی شبا
            // =====================================

            if (!iban) {

                return res.status(400).json({

                    success: false,

                    message:
                        "شماره شبا وارد نشده است"

                });

            }


            const cleanIban =
                String(iban)
                    .replace(/\s+/g, "")
                    .toUpperCase();


            // تبدیل IRxxxxxxxxxxxxxxxxxxxxxxxxxx
            // اگر کاربر IR را وارد نکرده باشد

            const normalizedIban =
                cleanIban.startsWith("IR")
                    ? cleanIban
                    : "IR" + cleanIban;


            // شماره شبا ایران
            // IR + 24 رقم

            if (
                !/^IR\d{24}$/.test(
                    normalizedIban
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "شماره شبا نامعتبر است. مثال: IRxxxxxxxxxxxxxxxxxxxxxxxx"

                });

            }


            // =====================================
            // دریافت کاربر
            // =====================================

            const user =
                await User.findById(
                    userId
                );


            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "کاربر پیدا نشد"

                });

            }


            // =====================================
            // موجودی قابل برداشت
            // =====================================

            const currentBalance =
                Number(
                    user.balance || 0
                );


            if (
                !Number.isFinite(
                    currentBalance
                )
            ) {

                return res.status(500).json({

                    success: false,

                    message:
                        "موجودی کاربر نامعتبر است"

                });

            }


            // =====================================
            // بررسی موجودی
            // =====================================

            if (
                amount >
                currentBalance
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "موجودی کافی نیست",

                    balanceToman:
                        currentBalance

                });

            }


            // =====================================
            // جلوگیری از چند برداشت همزمان
            // =====================================

            const pendingWithdraw =
                await Withdraw.findOne({

                    userId,

                    status: "PENDING"

                });


            if (pendingWithdraw) {

                return res.status(409).json({

                    success: false,

                    message:
                        "شما یک درخواست برداشت در حال بررسی دارید",

                    withdrawId:
                        pendingWithdraw._id

                });

            }


            // =====================================
            // کسر موجودی
            //
            // برداشت واقعی باید از بک‌اند انجام شود
            // نه Mini App
            // =====================================

            user.balance =
                currentBalance - amount;


            await user.save();


            // =====================================
            // ایجاد درخواست برداشت
            // =====================================

            let withdraw;

            try {

                withdraw =
                    await Withdraw.create({

                        userId,

                        amountToman:
                            amount,

                        iban:
                            normalizedIban,

                        description:
                            description || "",

                        status:
                            "PENDING",

                        processedAt:
                            null

                    });

            }

            catch (createError) {

                // =====================================
                // اگر ثبت Withdraw شکست خورد،
                // موجودی کاربر برگردانده می‌شود
                // =====================================

                user.balance =
                    currentBalance;

                await user.save();

                throw createError;

            }


            // =====================================
            // پاسخ
            // =====================================

            return res.status(201).json({

                success: true,

                message:
                    "درخواست برداشت با موفقیت ثبت شد",

                withdraw: {

                    id:
                        withdraw._id,

                    userId:
                        withdraw.userId,

                    amountToman:
                        withdraw.amountToman,

                    iban:
                        normalizedIban,

                    status:
                        withdraw.status,

                    createdAt:
                        withdraw.createdAt

                }

            });

        }

        catch (error) {

            console.error(
                "Create Withdraw Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "ثبت درخواست برداشت ناموفق بود"

            });

        }

    }
);


// =====================================
// GET USER WITHDRAWS
// دریافت برداشت‌های کاربر
// GET /api/withdraw/user/:userId
// =====================================

router.get(
    "/user/:userId",
    async (req, res) => {

        try {

            const {
                userId
            } = req.params;


            // =====================================
            // بررسی ID
            // =====================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    userId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "شناسه کاربر نامعتبر است"

                });

            }


            // =====================================
            // دریافت درخواست‌ها
            // =====================================

            const withdraws =
                await Withdraw.find({

                    userId

                })
                .sort({

                    createdAt: -1

                });


            // =====================================
            // پاسخ
            // =====================================

            return res.status(200).json({

                success: true,

                count:
                    withdraws.length,

                withdraws

            });

        }

        catch (error) {

            console.error(
                "Get User Withdraws Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "دریافت درخواست‌های برداشت ناموفق بود"

            });

        }

    }
);


// =====================================
// GET WITHDRAW STATUS
// وضعیت یک برداشت
// GET /api/withdraw/:withdrawId
// =====================================

router.get(
    "/:withdrawId",
    async (req, res) => {

        try {

            const {
                withdrawId
            } = req.params;


            // =====================================
            // بررسی ID
            // =====================================

            if (
                !mongoose.Types.ObjectId.isValid(
                    withdrawId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "شناسه برداشت نامعتبر است"

                });

            }


            // =====================================
            // پیدا کردن برداشت
            // =====================================

            const withdraw =
                await Withdraw.findById(
                    withdrawId
                );


            if (!withdraw) {

                return res.status(404).json({

                    success: false,

                    message:
                        "درخواست برداشت پیدا نشد"

                });

            }


            // =====================================
            // پاسخ
            // =====================================

            return res.status(200).json({

                success: true,

                withdraw: {

                    id:
                        withdraw._id,

                    userId:
                        withdraw.userId,

                    amountToman:
                        withdraw.amountToman,

                    iban:
                        withdraw.iban,

                    description:
                        withdraw.description,

                    status:
                        withdraw.status,

                    processedAt:
                        withdraw.processedAt,

                    createdAt:
                        withdraw.createdAt,

                    updatedAt:
                        withdraw.updatedAt

                }

            });

        }

        catch (error) {

            console.error(
                "Get Withdraw Status Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "دریافت وضعیت برداشت ناموفق بود"

            });

        }

    }
);


// =====================================
// EXPORT
// =====================================

export default router;