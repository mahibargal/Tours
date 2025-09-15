const express = require('express');
const userController =require('../controllers/usersController')
const authController = require('../controllers/authController')

const userRouter = express.Router();

userRouter.post('/signup',authController.signup)
userRouter.post('/login',authController.login)
userRouter.post('/forgotPassword',authController.forgotPassword)
userRouter.patch('/resetPassword/:token',authController.resetPassword);

userRouter.use(authController.protect);//running for all below after this middleware

userRouter.patch('/updatePassword',authController.updatePassword)

userRouter.get('/me',userController.getMe,userController.getUserWithId)
userRouter.patch('/updateUser',userController.updateUser)
userRouter.delete('/deleteUser',userController.deleteUser)

userRouter.use(authController.restrictTo('admin','user'));

userRouter.get('/', userController.getAllUsers);
userRouter.get('/:id', userController.getUserWithId);
userRouter.patch('/:id', userController.updateUserWIthId);
userRouter.delete('/:id', userController.deleteUser);
userRouter.post('/',userController.addUser);

module.exports = userRouter;