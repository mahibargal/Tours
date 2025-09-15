const express = require('express');
const toursController = require('../controllers/toursController');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const reviewRouter = require('../routes/reviewRoutes');
const tourRouter = express.Router();

//POST /tour/fe234hh/reviews
//GET /tour/fe234hh/reviews

// tourRouter.route('/:tourId/reviews')
// .post(authController.protect, authController.restrictTo('user'), reviewController.createReview)
tourRouter.use('/:tourId/reviews', reviewRouter);


// tourRouter.param('id', toursController.validateId); //middle ware
tourRouter.route('/top-5-cheap')
    .get(toursController.aliasTop5CheapTours, toursController.getAlltours)

tourRouter.route('/getTourStats').get(toursController.getTourStats);
tourRouter.route('/getMonthlyTours/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), toursController.getMonthlyTours);

tourRouter.route('/')
    .get(toursController.getAlltours)
    .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), toursController.addTour); //multiple middleware functions

tourRouter.route('/:id')
    .get(toursController.getTourWithId)
    .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), toursController.updateTourWIthId)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), toursController.deleteTour);


module.exports = tourRouter;