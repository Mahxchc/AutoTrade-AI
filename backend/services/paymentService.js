// =====================================
// AutoTrade AI
// Payment Service
// Withdraw Layer
// =====================================



// ایجاد درخواست برداشت

async function createWithdrawRequest({

    userId,

    amount,

    method = "rial"

}) {



    if(!userId || !amount){

        throw new Error(
            "Invalid withdraw data"
        );

    }



    return {


        success:true,


        requestId:null,


        userId,


        amount,


        method,


        status:"PENDING",


        createdAt:new Date()


    };

}





// بررسی وضعیت برداشت

async function checkWithdrawStatus({

    requestId

}) {


    return {


        requestId,


        status:"PENDING"


    };

}




module.exports = {


    createWithdrawRequest,

    checkWithdrawStatus


};
