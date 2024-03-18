const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');

const errorMiddleware = require('./middlewares/error');

require('dotenv').config();

app.use(express.json());
app.use(cookieParser());
app.use(fileupload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}));

// Route Imports
const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute');
const followRoute = require('./routes/followRoute');

app.use('/api/v1/user', userRoute);
app.use('/api/v1/posts', postRoute);
app.use('/api/v1/follows', followRoute);

// Middleware For Error
app.use(errorMiddleware);

module.exports = app;