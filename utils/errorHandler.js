const ApiError = require('../utils/apiError');
const logger = require('../config/logger');

const errorConverter = (err, req, res, next) => {
  let error = err;
  
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal Server Error';
    const isOperational = false;
    
    // Handle Mongoose/MongoDB errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(el => el.message);
      error = ApiError.validationError(errors, message);
    } else if (error.name === 'CastError') {
      const message = `Invalid ${error.path}: ${error.value}`;
      error = ApiError.badRequest(message);
    } else if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const message = `${field} already exists`;
      error = ApiError.conflict(message);
    } else if (error.name === 'JsonWebTokenError') {
      error = ApiError.unauthorized('Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      error = ApiError.unauthorized('Token expired');
    } else {
      error = new ApiError(statusCode, message, isOperational, err.stack);
    }
  }
  
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;
  
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    statusCode = 500;
    message = 'Internal Server Error';
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.errors && { errors: err.errors }),
  };

  if (process.env.NODE_ENV === 'development') {
    logger.error(err);
  }

  res.status(statusCode).json(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};