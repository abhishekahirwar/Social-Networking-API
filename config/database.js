const mongoose = require('mongoose');

exports.connectDB = () => {
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => {
            console.log("Database Connected Successfully.");
        });
};