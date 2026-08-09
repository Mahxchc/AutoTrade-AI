// =====================================
// Error Handler:: M
// AutoTrade AI
// Global Error Handling Middleware
// File: backend/middleware/errorHandler.js
// =====================================


// =====================================
// Global Error Handler
// =====================================

export default function errorHandler(

    error,

    req,

    res,

    next

) {


    // =====================================
    // Server Log
    // =====================================

    console.error(

        "Server Error:",

        error

    );


    // =====================================
    // If Response Already Started
    // =====================================

    if (res.headersSent) {

        return next(error);

    }


    // =====================================
    // Default Error
    // =====================================

    let statusCode =
        error.statusCode || 500;


    let message =
        error.message ||
        "Internal server error";


    // =====================================
    // Mongoose Validation Error
    // =====================================

    if (
        error.name ===
        "ValidationError"
    ) {

        statusCode = 400;

        message =
            "Invalid request data";

    }


    // =====================================
    // Mongoose Cast Error
    // =====================================

    if (
        error.name ===
        "CastError"
    ) {

        statusCode = 400;

        message =
            "Invalid ID or data format";

    }


    // =====================================
    // Duplicate Key Error
    // =====================================

    if (
        error.code === 11000
    ) {

        statusCode = 409;

        message =
            "Duplicate data already exists";

    }


    // =====================================
    // Response
    // =====================================

    return res.status(

        statusCode

    ).json({

        success: false,

        message

    });

}
