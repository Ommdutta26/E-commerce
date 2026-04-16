const mongoose = require('mongoose');

function ConnectToDb(){
    mongoose.connect('mongodb://localhost:27017/online-shopping')
    .then(() => {
        console.log('Connected to database successfully');
    })
    .catch((err) => {
        console.error('Database connection failed:', err);
    });

}

module.exports=ConnectToDb;
