const mongoose = require('mongoose');

function connectDB(){

    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{
        console.log("DB is connected !!")
    }).catch(()=>{
        console.log("DB is not connected !!")
    })
}

module.exports = connectDB
