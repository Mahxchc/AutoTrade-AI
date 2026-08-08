// =====================================
// AutoTrade AI
// Wallet Model
// =====================================


class Wallet {


    constructor({

        userId

    }) {


        this.userId = userId;


        // موجودی فعلی

        this.balance = 0;



        // مجموع سود

        this.totalProfit = 0;



        // تعداد معاملات

        this.totalTrades = 0;



        // مقدار قابل برداشت

        this.withdrawable = 0;



        // تاریخ ساخت کیف پول

        this.createdAt = new Date();



        // آخرین بروزرسانی

        this.updatedAt = new Date();



    }





    // اضافه کردن سود بعد از معامله موفق

    addProfit(amount){


        this.balance += amount;


        this.totalProfit += amount;


        this.withdrawable += amount;


        this.updatedAt = new Date();


    }





    // ثبت معامله

    addTrade(){


        this.totalTrades += 1;


        this.updatedAt = new Date();


    }





    // برداشت از کیف پول

    withdraw(amount){



        if(amount > this.withdrawable){


            throw new Error(
                "Insufficient withdrawable balance"
            );


        }



        this.balance -= amount;


        this.withdrawable -= amount;


        this.updatedAt = new Date();


    }





    // گرفتن اطلاعات کیف پول

    getInfo(){


        return {


            userId:this.userId,


            balance:this.balance,


            totalProfit:this.totalProfit,


            totalTrades:this.totalTrades,


            withdrawable:this.withdrawable,


            updatedAt:this.updatedAt


        };


    }



}




module.exports = Wallet;
