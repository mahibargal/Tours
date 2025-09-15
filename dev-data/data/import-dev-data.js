const fs = require('fs')
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models.js/tourModel');
const User = require('../../models.js/userModel');
const Review = require('../../models.js/reviewModel');
dotenv.config({ path: './config.env' })

// console.log(process.env);
const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
// console.log(db)
mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then((con => {
    console.log("DB Connected successfully!");

    if (process.argv[2] == '--import') {
        importData()
    } else {
        deleteData()
    }
    // console.log(con.connections)
})).catch(err => {
    console.log(err)
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`));

const importData = async () => {
    try {

        await Tour.create(tours);
        await User.create(users,{validateBeforeSave:false});
        await Review.create(reviews);
        console.log("Data successfully created")
    } catch (err) {
        console.log(err);
    }
}


const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data successfully deleted")
    } catch (err) {
        console.log(err);
    }
}

console.log(process.argv)

