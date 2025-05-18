class ApiError extends Error {
    constructor(
      statusCode,
      message,
      isOperational = true,
      stack = '',
      errors = null
    ) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = isOperational;
      this.errors = errors;
      
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  
    static badRequest(message = 'Bad Request', errors = null) {
      return new ApiError(400, message, true, null, errors);
    }
  
    static unauthorized(message = 'Unauthorized') {
      return new ApiError(401, message);
    }
  
    static forbidden(message = 'Forbidden') {
      return new ApiError(403, message);
    }
  
    static notFound(message = 'Not Found') {
      return new ApiError(404, message);
    }
  
    static conflict(message = 'Conflict') {
      return new ApiError(409, message);
    }
  
    static internal(message = 'Internal Server Error') {
      return new ApiError(500, message);
    }
  
    static validationError(errors, message = 'Validation Error') {
      return new ApiError(422, message, true, null, errors);
    }
  }
  
  module.exports = ApiError;