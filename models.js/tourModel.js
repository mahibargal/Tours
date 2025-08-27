const mongoose = require('mongoose');
const validator = require('validator');
const User = require('./userModel');

const toursSchema = new mongoose.Schema(
    {
    name: {
        type: String,
        required: [true, 'Tour name is mandatory'],
        maxLength: [30, 'Max length of name is 30'],
        minLength: [6, 'min length of name is 6'],
        // validate:{
        //     validator:validator.isAlpha,
        //     message:"name should contains only chars"
        // }
    },
    price: {
        type: Number,
        required: [true, "Price is mandatory"]
    },

    rating: {
        type: Number,
        default: 4.5,
        min: [1, 'minimum rating is 1'],
        max: [5, 'max rating is 5']
    },

    duration: {
        type: Number,
        required: [true, "Duartion is mandatory"]
    },

    maxGroupSize: Number,
    difficulty: {
        type: String,
        enum:
        {
            values: ['easy', 'difficult', 'medium'],
            message: "Difficulty should be either easy medium difficult"
        }

    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 4.5
    },
    price: {
        type: Number,
        required: true
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                //this only points to current doc on NEW dosument creation
                return this.price > val
            },
            message: "Discount price ({VALUE}) should be below regular price"
        },
    },
    summary: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, "description is mandatory"],
        trim: true
    },
    imageCover: {
        type: String,
        required: true
    },
    images: [String],
    createdAt: {
        type: Date,
        default: new Date()
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation:{
        type:{
            type:String,
            default:'Point',
            enum:['Point'],
        },
        coordinates:[Number],
        address:String,
        description:String

    },
    locations:[
        {
            type:{
                type:String,
                default:'Point',
                enum:['Point'],   
            },
            coordinates: [Number],
            address:String,
            description: String,
            day:Number
        }
    ],
    // guides:Array,    //embeddding
    guides:[
        {
            type:mongoose.Schema.ObjectId,
            ref:'User'
        }
    ]


},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

toursSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7; //will get in get query but we cannot query like durationWeeks ==1
})

//DOCUMENT MIDDLEWARE: runs befor .save() & .create() (not on saveMany)
toursSchema.pre('save', function (next) {
    // console.log(this) // this is pointing to the current object
    next();
})
toursSchema.pre('save', async function (next) {
    console.log("Saving document...............")
    // const guidesPromises = this.guides.map(async id=> await User.findById(id));  //embedding documents
    // this.guides = await Promise.all(guidesPromises)
    next();
})

toursSchema.post('save', function (docs, next) {
    console.log(this);

    next();
})

// QUERY MIDDLEWARE
toursSchema.pre(/^find/, function (next) {
    // console.log(this);
    this.find({ secretTour: { $ne: true } })
    this.start = Date.now();
    next();
})

toursSchema.pre(/^find/, function (next) {
   this.populate({
    path:'guides',
    select:'-__v -passwordChangedAt'
});
    next();
})
toursSchema.post(/^find/, function (doc, next) {

    console.log(`Query takes ${(new Date - this.start)} miliseconds`);
    next();
})

//AGGREGATION MIDDLEWARE
toursSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } })
    // console.log(this.pipeline());
    next();
})

const Tour = mongoose.model('Tour', toursSchema);

module.exports = Tour;