const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' })
const app = require('./app');

// console.log(process.env);
const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
// console.log(db)
mongoose.connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then((con => {
    console.log("db connection success");
    // console.log(con.connections)
}))

// .catch(err => {
//     console.log(err)
// });



// const testTour = new Tour({
//     name: 'fdff',
//     rating: 5.0,
//     price: 1130
// })

// testTour.save().then((doc) => {
//     console.log(doc)
// }).catch(err => {
//     console.log('ERROR!', err)
// })

// console.log(Tour);
const port = process.env.PORT || 8001; ;
const server = app.listen(port, () => {
    console.log("server running on port", port, '...')
})

process.on('unhandledRejection',(err)=>{
    debugger;
    console.log(err.name,err.message);
    server.close(()=>{
        process.exit(1);
    })

})