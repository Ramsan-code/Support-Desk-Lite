const errorHandler = (err, req, res, next) => {
    console.error(`Error: ${err.message}`);

    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(statusCode).json({
            success: false,
            data: null,
            error: messages.join(', ')
        });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = 400;
        return res.status(statusCode).json({
            success: false,
            data: null,
            error: 'Duplicate field value entered'
        });
    }

    res.status(statusCode || 500).json({
        success: false,
        data: null,
        error: err.message || 'Server Error'
    });
};

export default errorHandler;

