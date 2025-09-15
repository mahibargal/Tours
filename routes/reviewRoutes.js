const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');




const reviewRouter = express.Router({mergeParams:true});

reviewRouter.use(authController.protect);

//POST /tour/fe234hh/reviews
//POST /reviews
reviewRouter.route('/')
.get(reviewController.getAllReview)
.post(authController.restrictTo('user'),reviewController.createReview)


reviewRouter.route('/')
.get(reviewController.getAllReview)
.patch(authController.restrictTo('user','admin'),reviewController.createReview) //change it tmr
.delete(authController.restrictTo('user','admin'),reviewController.createReview);

module.exports = reviewRouter;

