const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/apiError');
const APiFeatures = require('../utils/ApiFeature')

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    try {
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) {
            return next(new AppError("No doc found with that id", 404));
        }
        res.status(204).json({ message: 'success', doc })
    } catch (err) {
        next(err)
    }
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        return next(new AppError("No doc found with that id", 404));
    }
    res.status(200).json({ message: 'success', data: { data: doc } })

})

exports.createOne = Model => catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(200).json({ message: 'success', data: { data: newDoc } })

})

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions)
    const doc = await query

    if (!doc) {
        return next(new AppError("No doc found with that id", 404));
    }
    res.status(200).json({ message: 'success', data: { data: doc } })

})

exports.getAll = Model => catchAsync(async (req, res, next) => {
    const features = new APiFeatures(Model.find(), req.query)
        .filterQuery()
        .sortQuery()
        .selectFields()
        .pagination();
    const doc = await features.query;   //await features.query.explain();
    res.status(200).json({ message: 'Success', results: doc.length, data: { data: doc }, })

})