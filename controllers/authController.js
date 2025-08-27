const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const util = require('util')
const User = require('./../models.js/userModel');
const AppError = require('./../utils/apiError');
const sendEmail = require('./../utils/email');

const catchAsync = require('../utils/catchAsync');


const generateToken = id => {
    return jwt.sign(
        { id: id },
        process.env.JWT_SECRET_CODE,
        {
            expiresIn: process.env.JWT_EXPIRY_TIME
        }
    )
}

const createSendToken = (user, statusCode, res) => {
    const token = generateToken(user._id);
    const cookieOptions = {
        expires: new Date( Date.now() + process.env.JWT_COOKIE_EXPIRY_TIME * 24 * 60 * 60 * 1000 ),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') cookieOptions['secure'] = true;

    user.password = undefined;//don't send user password
    res.cookie('jwt', token, cookieOptions);
    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user
        }
    })
}
exports.signup = catchAsync(async (req, res, next) => {

    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });

    createSendToken(newUser, 201, res);
    // const token = generateToken(newUser._id)

    // res.status(201).json({
    //     status: "success",
    //     token,
    //     data: {
    //         user: newUser
    //     }
    // })
});

exports.login = catchAsync(async (req, res, next) => {
    debugger;
    let { email, password } = req.body;
    const user = await User.findOne({ email: email }).select('+password');
    console.log(user);

    if (!user) {
        return next(new AppError('User or Password does not match', 401));
    }
    const isPasswordMatch = await user.correctPassword(password, user.password);

    if (!user || !isPasswordMatch) {
        return next(new AppError('User or Password does not match', 401));
    }

    //creating and sending token
    createSendToken(user, 200, res);

    // const token = generateToken(user._id);
    // res.status(200).json({
    //     message: 'success',
    //     token
    // })
})

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    //check for token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please login to get access', 401));
    }

    //check for token match
    const decodedToken = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET_CODE);
    console.log(token, decodedToken);

    //check for is user still exist menas user is deleted after token issue
    const freshUser = await User.findById(decodedToken.id);
    // console.log(freshUser);
    if (!freshUser) {
        return next(new AppError('User has been deleted, please login again', 401));
    }

    //check for user has change password after token is issued
    const tokenIssuedTime = decodedToken.iat;
    const passwordChangeAfterJwtIssued = freshUser.passwordChangeAfterJwtIssued(tokenIssuedTime);
    if (passwordChangeAfterJwtIssued) {
        return next(new AppError('User has change password, please login again', 401));
    }

    //Grant access to protected route
    req.user = freshUser;
    next();

})

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles is array ['admin','lead-guide']
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You dont have permission to perform this action'), 403)
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1 Get user based on posted email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with email address', 404))
    }

    //2generate random reset token
    const resetToken = await user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3send it to users email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\nIf you didn't forget your password, please ignore this email`

    try {

        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10min)',
            message
        })

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passWordTokenResetExpires = undefined;
        return next(new AppError(`There was an ${err} sending the email,. Try again later`, 500))
    }


})

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1 get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passWordTokenResetExpires: {
            $gt: Date.now()
        }
    });

    //2 set new password if token not expired and user exist
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passWordTokenResetExpires = undefined;

    await user.save();
    //3 update changedPasswordAt property for the user
    //did it in usermdel
    //4 log the user in , send jwt

    //creating and sending token
    createSendToken(user, 200, res);
    // const token = generateToken(user._id);
    // res.status(200).json({
    //     message: 'success',
    //     token
    // })

})

exports.updatePassword = catchAsync(async (req, res, next) => {
    const { password, newPassword, passwordConfirm } = req.body;
    const id = req.user._id;
    //get user from collection
    const user = await User.findById(id).select('+password');
    if (!user) {
        return next(new AppError('USer details not matched', 400))
    }
    console.log(user);
    const currPassword = user.password;
    console.log(currPassword);

    //2 check if posted current password is correct
    const isPasswordCorrect = await user.correctPassword(password, currPassword);
    console.log(isPasswordCorrect);


    //3 if correct, update password
    if (!isPasswordCorrect) {
        return next(new AppError('Your current password is wrong', 400))
    }
    user.password = newPassword;
    user.passwordConfirm = passwordConfirm;

    await user.save();
    //findbyIdand update will not work here


    //4log user in, send jwt

    //creating and sending token
    createSendToken(user, 200, res);
    // const token = generateToken(user._id);

    // res.status(200).json({
    //     status: 'success',
    //     token
    // })

})
