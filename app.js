const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const GlobalErrorHandler = require('./controllers/errorController');
const app = express();
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/apiError');
const reviewRouter = require('./routes/reviewRoutes');


//middlewares
//
app.use(helmet())

if(process.env.NODE_ENV == 'development'){
    app.use(morgan('dev')) // use for log morgan
}

//Body parser, reading data from body int req.body
app.use(express.json({limit:'10kb'}));

//Data sanitization against NoSql query injection (ex {$gt:""})
// app.use(mongoSanitize());

//Data sanitization against xss  (html code in body)
app.use(xssClean());

//Serving static files
app.use(express.static(`${__dirname}/public`));

//Logging middleware
app.use((req,res,next)=>{
    console.log("Calling from middleware");
    next();
})

//Rate limit
const limiter = rateLimit({
    limit:100,
    windowMs:60*60*1000,
    message:"To many requests from this IP, please try again in an hour"
})
app.use('/api',limiter)

///Passing some data
app.use((req,res,next)=>{
    req.startTime = new Date().toISOString();
    next();
})

//ROUTES
app.use('/api/tours/v1',tourRouter);
app.use('/api/users/v1',userRouter);
app.use('/api/reviews/v1',reviewRouter)


app.all("*",(req,res,next)=>{
     next(new AppError(`Can't find ${req.originalUrl} on this server`,404));
})

app.use(GlobalErrorHandler);


module.exports = app;