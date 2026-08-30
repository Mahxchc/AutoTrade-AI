// =====================================
// ..M AutoTrade AI
// Withdraw Routes
// برداشت تومان
// File: backend/routes/withdraw.js
// =====================================

import express from "express";
import mongoose from "mongoose";

import Withdraw from "../models/Withdraw.js";
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";

import {
    requiredTelegramUser
} from "../middleware/auth.js";


const router = express.Router();


// =====================================
// ..M GET AUTHENTICATED USER
// دریافت کاربر احراز هویت‌شده
// =====================================

async function getAuthenticatedUser(req) {

    const telegramId =
        req.telegramId ||
        req.telegramUser?.id ||
        req.user?.telegramId;


    if (!telegramId) {

        throw new Error(
            "Telegram user is not authenticated"
        );

    }


    const user =
        await User.findOne({

            telegramId:
                String(telegramId)

        });


    if (!user) {

        throw new Error(
            "User not found"
        );

    }


    return user;

}


// =====================================
// ..M MASK IBAN
// مخفی کردن بخشی از شماره شبا
// =====================================

function maskIban(
    iban
) {

    const value =
        String(iban || "");


    if (
        value.length <= 8
    ) {

        return value;

    }


    return (
        value.slice(0, 4) +
        "********" +
        value.slice(-4)
    );

}


// =====================================
// ..M CREATE WITHDRAW REQUEST
// ایجاد درخواست برداشت
// POST /api/withdraw
// =====================================

router.post(
    "/",
    requiredTelegramUser,
    async (req, res) => {

        try {

            const user =
                await getAuthenticatedUser(
                    req
                );


            const {
                amountToman,
                iban,
                description
            } = req.body;


            // =====================================
            // ..M ACCESS CONTROL
            // کنترل دسترسی برداشت
            // =====================================

            if (
                user.status !==
                "ACTIVE"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "حساب کاربری فعال نیست"

                });

            }


            // =====================================
            // ..M VALIDATE AMOUNT
            // بررسی مبلغ
            // =====================================

            const amount =
                Number(
                    amountToman
                );


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


            // =====================================
            // ..M MINIMUM WITHDRAW
            // حداقل برداشت
            // =====================================

            const MIN_WITHDRAW_TOMAN =
                100000;


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
            // ..M VALIDATE IBAN
            // بررسی شماره شبا
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


            const normalizedIban =
                cleanIban.startsWith("IR")
                    ? cleanIban
                    : "IR" + cleanIban;


            if (
                !/^IR\d{24}$/.test(
                    normalizedIban
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "شماره شبا نامعتبر است"

                });

            }


            // =====================================
            // ..M FIND WALLET
            // پیدا کردن کیف پول
            // =====================================

            const wallet =
                await Wallet.findOne({

                    userId:
                        user._id

                });


            if (!wallet) {

                return res.status(404).json({

                    success: false,

                    message:
                        "کیف پول کاربر پیدا نشد"

                });

            }


            // =====================================
            // ..M WALLET STATUS
            // =====================================

            if (
                wallet.status !==
                "ACTIVE"
            ) {

                return res.status(403).json({

                    success: false,

                    message:
                        "کیف پول فعال نیست"

                });

            }


            // =====================================
            // ..M WITHDRAWABLE BALANCE
            // موجودی قابل برداشت
            // =====================================

            const withdrawable =
                Number(
                    wallet.withdrawable || 0
                );


            if (
                !Number.isFinite(
                    withdrawable
                ) ||
                withdrawable < 0
            ) {

                return res.status(500).json({

                    success: false,

                    message:
                        "موجودی قابل برداشت نامعتبر است"

                });

            }


            // =====================================
            // ..M CHECK BALANCE
            // بررسی موجودی
            // =====================================

            if (
                amount >
                withdrawable
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "موجودی قابل برداشت کافی نیست",

                    withdrawableToman:
                        withdrawable

                });

            }


            // =====================================
            // ..M PENDING WITHDRAW
            // جلوگیری از چند برداشت همزمان
            // =====================================

            const pendingWithdraw =
                await Withdraw.findOne({

                    userId:
                        user._id,

                    status:
                        "PENDING"

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
            // ..M CREATE WITHDRAW FIRST
            // ایجاد درخواست برداشت
            // =====================================

            const withdraw =
                await Withdraw.create({

                    userId:
                        user._id,

                    amountToman:
                        amount,

                    iban:
                        normalizedIban,

                    description:
                        description
                            ? String(description)
                            : "",

                    status:
                        "PENDING",

                    processedAt:
                        null

                });


            // =====================================
            // ..M RESERVE WITHDRAWABLE BALANCE
            // رزرو موجودی قابل برداشت
            // =====================================

            const updatedWallet =
                await Wallet.findOneAndUpdate(

                    {

                        _id:
                            wallet._id,

                        status:
                            "ACTIVE",

                        withdrawable: {

                            $gte:
                                amount

                        }

                    },

                    {

                        $inc: {

                            withdrawable:
                                -amount

                        }

                    },

                    {

                        returnDocument:
                            "after"

                    }

                );


            // =====================================
            // ..M ROLLBACK IF BALANCE UPDATE FAILED
            // =====================================

            if (!updatedWallet) {

                await Withdraw.findOneAndUpdate(

                    {

                        _id:
                            withdraw._id,

                        status:
                            "PENDING"

                    },

                    {

                        $set: {

                            status:
                                "CANCELLED",

                            description:
                                "موجودی قابل برداشت کافی نبود"

                        }

                    }

                );


                return res.status(400).json({

                    success: false,

                    message:
                        "موجودی قابل برداشت کافی نیست"

                });

            }


            // =====================================
            // ..M RESPONSE
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
                        maskIban(
                            withdraw.iban
                        ),

                    status:
                        withdraw.status,

                    createdAt:
                        withdraw.createdAt

                },

                wallet: {

                    withdrawableToman:
                        updatedWallet.withdrawable

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
// ..M GET MY WITHDRAWS
// دریافت برداشت‌های کاربر فعلی
// GET /api/withdraw/my
// =====================================

router.get(
    "/my",
    requiredTelegramUser,
    async (req, res) => {

        try {

            const user =
                await getAuthenticatedUser(
                    req
                );


            const withdraws =
                await Withdraw.find({

                    userId:
                        user._id

                })
                .sort({

                    createdAt:
                        -1

                })
                .limit(100);


            return res.status(200).json({

                success: true,

                count:
                    withdraws.length,

                withdraws:
                    withdraws.map(
                        (withdraw) => ({

                            id:
                                withdraw._id,

                            amountToman:
                                withdraw.amountToman,

                            iban:
                                maskIban(
                                    withdraw.iban
                                ),

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

                        })
                    )

            });

        }

        catch (error) {

            console.error(
                "Get My Withdraws Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "دریافت درخواست‌های برداشت ناموفق بود"

            });

        }

    }
);


// =====================================
// ..M GET MY WITHDRAW STATUS
// وضعیت برداشت خود کاربر
// GET /api/withdraw/:withdrawId
// =====================================

router.get(
    "/:withdrawId",
    requiredTelegramUser,
    async (req, res) => {

        try {

            const user =
                await getAuthenticatedUser(
                    req
                );


            const {
                withdrawId
            } = req.params;


            // =====================================
            // ..M VALIDATE ID
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
            // ..M FIND OWN WITHDRAW
            // =====================================

            const withdraw =
                await Withdraw.findOne({

                    _id:
                        withdrawId,

                    userId:
                        user._id

                });


            if (!withdraw) {

                return res.status(404).json({

                    success: false,

                    message:
                        "درخواست برداشت پیدا نشد"

                });

            }


            return res.status(200).json({

                success: true,

                withdraw: {

                    id:
                        withdraw._id,

                    amountToman:
                        withdraw.amountToman,

                    iban:
                        maskIban(
                            withdraw.iban
                        ),

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
                    error.message ||
                    "دریافت وضعیت برداشت ناموفق بود"

            });

        }

    }
);


// =====================================
// ..M EXPORT
// =====================================

export default router;