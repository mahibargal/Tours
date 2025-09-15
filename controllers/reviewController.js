const Review = require("../models.js/reviewModel")
const APiFeatures = require("../utils/ApiFeature")
const catchAsync = require("../utils/catchAsync")


exports.getAllReview = catchAsync(async (req, res, next) => {
    let filter = {};
    if(req.params.tourId) filter = {tour:req.params.tourId};
    const features = new APiFeatures(Review.find(filter), req.query).filterQuery().sortQuery().selectFields().pagination();
    const reviews = await features.query;
    res.status(200).json({
        message: 'success',
        count: reviews.length,
        reviews
    })

})

exports.createReview = catchAsync(async (req, res, next) => {

    // const {} = req.body;
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id

    const review = await Review.create(req.body);

    res.status(201).json({
        message: 'success',
        review
    })

})