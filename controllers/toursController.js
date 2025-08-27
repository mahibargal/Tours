
const fs = require('fs');
const AppError = require('../utils/apiError');
const Tour = require('./../models.js/tourModel');
const APiFeatures = require('./../utils/ApiFeature');
const catchAsync = require('./../utils/catchAsync')

exports.getAlltours = async (req, res, next) => {
    try {
        //BUILD QUERY
        // const reqObj = { ...req.query };
        // const excludedFields = ['page', 'limit', 'sort','fields'];
        // excludedFields.forEach(elm => delete reqObj[elm]);

        // let queryStr = JSON.stringify(reqObj);
        // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); // replace with $    http://localhost:3000/api/tours/v1?duration[gte]=4&page=4
        // console.log(req.query, reqObj, queryStr);


        // let query = Tour.find(JSON.parse(queryStr));


        // if (req.query?.sort) {
        //     // '?sort=-abc,-xyz'
        //     const sortBy = req.query?.sort.split(",").join(" "); //http://localhost:3000/api/tours/v1?duration[gte]=4&page=4&sort=-price,-duration
        //     query.sort(sortBy);

        // } else {
        //     query.sort('-_id'); //default sorting
        // }

        // if(req.query?.fields){
        //     //?fields=duration,price,time
        //     const fields = req.query?.fields.split(",").join(" ")
        //     query.select(fields) // select('field1 field2 field3 field4)
        // }else{
        //     query.select('-__v');
        // }

        // //query.skip(1).limit(20)
        // const page = Number(req.query.page) || 1;
        // const limit = Number(req.query.limit) || 100;
        // const skip = (page-1)*limit;

        // query.skip(skip).limit(limit);


        // if(req.query.page){
        //     const allToursNumber = await Tour.countDocuments();
        //     if(skip>= allToursNumber) throw new Error("Tours with limit not found")
        // }
        // const query = await Tour.find()
        // .where('duration')
        // .equals(5)
        // .where('difficulty')
        // .equals('difficulty');

        //EXECUTE QUERY
        // console.log(query);
        const features = new APiFeatures(Tour.find(), req.query).filterQuery().sortQuery().selectFields().pagination();
        const tours = await features.query;

        //SEND RESPONSE
        res.status(200).json({ message: 'Success', tours: tours, items: tours.length })

    } catch (err) {
        next(err)
        // res.status(400).json({ message: "failed", error: err.message })
    }
}


exports.getTourWithId = catchAsync(async (req, res, next) => {

    // try {
    const tour = await Tour.findById(req.params.id)
    // .populate({
    //     path:'guides',
    //     select:'-__v -passwordChangedAt'
    // });
    // Tour.findOne({_id:req.params.id})
    if (!tour) {
        return next(new AppError("No tour found with that id", 404));
    }
    res.status(200).json({ message: 'success', tour: tour })
    // } catch (err) {
    //     res.status(400).json({ message: err })
    // }
})

exports.deleteTour = async (req, res, next) => {    

    try {

        const tour = await Tour.findByIdAndDelete(req.params.id);
        if (!tour) {
            return next(new AppError("No tour found with that id", 404));
        }
        res.status(204).json({ message: 'success', tour })
    } catch (err) {
        next(err)
        // res.status(400).json({ message: err })
    }
}
//patch request
exports.updateTourWIthId = async (req, res, next) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!tour) {
            return next(new AppError("No tour found with that id", 404));
        }
        res.status(200).json({ message: 'success', tour })
    } catch (err) {
        next(err)
        // res.status(400).json({ message: err })
    }
}

exports.addTour = catchAsync(async (req, res, next) => {
    try {
        console.log(req.body);
        // const tour = new Tour(req.body);
        // const data = await tour.save();
        const newTour = await Tour.create(req.body);

        res.status(200).json({ message: 'success', tour: newTour })
    } catch (err) {
        next(err)
        // res.status(400).json({ message: err });

    }
})

exports.aliasTop5CheapTours = (req, res, next) => {

    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    next();
}

exports.getTourStats = async (req, res, next) => {

    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } }

            },
            {
                $group: {
                    _id: '$difficulty',
                    num: { $sum: 1 },
                    numRating: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort: { avgPrice: 1 }
            },
            // {
            //     $match:{_id:{$ne:'medium'}}
            // }

        ])

        res.status(200).json({ message: 'Success', tour_data_length: stats.length, tours: stats })
    } catch (err) {
        console.log(err)
        next(err)
        // alert('err',err)
    }
}
exports.getMonthlyTours = async (req, res) => {
    const { year } = req.params;
    console.log(req.params.year)
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                num_of_tours_starts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: { _id: 0 }
        },
        {
            $sort: { num_of_tours_starts: -1 }
        }
    ]);
    res.status(200).json({ message: 'success', total_diff_date_tours: plan.length, plan })
}
// exports.validateId = (req,res,next,val)=>{
//     const id = val;
//     console.log("id is",id)
//     const tour = tours.find(elm=>elm.id==req.params.id);
//     if(!tour) return res.status(404).json({message:'invalid id',staus:'failed'});
//     next();
// }

// exports.validateReqBody = (req,res,next)=>{
//     if(!req.body.price || !req.body.duration){
//         return res.status(404).json({message:'Missing Price or duration',staus:'failed'});
//     }
// next();
// }