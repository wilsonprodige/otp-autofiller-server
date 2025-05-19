const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes/index.routes');
const { errorConverter, errorHandler } = require('./middlewares/error.middleware');

const app = express();

app.use(cors());
app.options('{*any}', cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use('/api', routes);

app.use(errorConverter);

app.use(errorHandler);

module.exports = app;