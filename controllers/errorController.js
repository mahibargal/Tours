const AppError = require("../utils/apiError");

const hadnledCastErrorDB = (err) => {
    const message = `Invalid ${err.path} ${err.value}`;
    return new AppError(message, 400);
}

const hadledDuplicateFieldDB = (err) => {
    const value = err.errmsg.match(/([""])(\\?.)*?\1/)[0];
    const message = `Duplicate field value:${value} . Please use another value!`
    return new AppError(message, 400)
}

const hadnledValidationError = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const msg = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(msg, 400);
}
const JWTInvalidTOkenError = () => new AppError('Invalid toke,please log in again', 401);
const JWTTokenExpireError = () => new AppError('Your token has expired! please log in again', 401);

const sendDevError = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        err: err,
        stack: err.stack
    })

}

const sendProdError = (err, res) => {
    //operational error, trusted error send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        // send generic message
        console.log('Error 🎆', err)
        res.status(500).json({
            status: 'error',
            message: "Soemthing went wrong"
        })
    }

}

module.exports = (err, req, res, next) => {
    // console.log(err.stack)
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV == 'development') {
        sendDevError(err, res);
    } else if (process.env.NODE_ENV == 'production') {
        let error = Object.assign(err);
        if (error.name === 'CastError') {
            error = hadnledCastErrorDB(error);
        }
        if (error.code === 11000) {
            error = hadledDuplicateFieldDB(error)
        }
        if (error.name == 'ValidationError') {
            error = hadnledValidationError(error)
        }
        if (error.name == 'JsonWebTokenError') {
            error = JWTInvalidTOkenError()
        }
        if(error.name == 'TokenExpiredError'){
            error = JWTTokenExpireError();
        }
        sendProdError(error, res)
    }

}