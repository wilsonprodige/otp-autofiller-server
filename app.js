const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes/index.routes');
const { errorConverter, errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Enable CORS
app.use(cors());
app.options('*', cors());

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// API routes
app.use('/api', routes);

// Convert error to ApiError, if needed
app.use(errorConverter);

// Handle error
app.use(errorHandler);

module.exports = app;