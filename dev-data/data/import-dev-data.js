const fs = require('fs')
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models.js/tourModel');
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

const importData = async () => {
    try {

        await Tour.create(tours);
        console.log("Data successfully created")
    } catch (err) {
        console.log(err);
    }
}


const deleteData = async () => {
    try {

        await Tour.deleteMany();
        console.log("Data successfully deleted")
    } catch (err) {
        console.log(err);
    }
}

console.log(process.argv)

