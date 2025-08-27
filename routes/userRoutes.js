const express = require('express');
const userController =require('../controllers/usersController')
const authController = require('../controllers/authController')

const userRouter = express.Router();


userRouter.post('/signup',authController.signup)
userRouter.post('/login',authController.login)
userRouter.post('/forgotPassword',authController.forgotPassword)
userRouter.patch('/resetPassword/:token',authController.resetPassword)
userRouter.patch('/updatePassword',authController.protect,authController.updatePassword)



userRouter.patch('/updateUser',authController.protect,userController.updateUser)
userRouter.delete('/deleteUser',authController.protect,userController.deleteUser)

// userRouter.route('/').get(userController.getAllUsers).post(userController.addUser);

userRouter.get('/', userController.getAllUsers);
userRouter.get('/:id', userController.getUserWithId);
userRouter.patch('/:id', userController.updateUserWIthId);
userRouter.delete('/:id', userController.deleteUser);
userRouter.post('/',userController.addUser);

module.exports = userRouter;