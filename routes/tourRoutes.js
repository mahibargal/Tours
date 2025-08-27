const express = require('express');
const toursController = require('../controllers/toursController');
const authController = require('../controllers/authController');
const tourRouter = express.Router();


// tourRouter.param('id', toursController.validateId); //middle ware
tourRouter.route('/top-5-cheap')
.get(toursController.aliasTop5CheapTours,toursController.getAlltours)

tourRouter.route('/getTourStats').get(toursController.getTourStats);
tourRouter.route('/getMonthlyTours/:year').get(toursController.getMonthlyTours);

tourRouter.route('/')
.get(authController.protect,toursController.getAlltours)
.post(toursController.addTour); //multiple middleware functions

tourRouter.route('/:id')
.get(toursController.getTourWithId)
.patch(toursController.updateTourWIthId)
.delete(authController.protect,authController.restrictTo('admin','lead-guide'),toursController.deleteTour);

module.exports = tourRouter;