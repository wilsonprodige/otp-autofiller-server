const httpStatus = require('http-status');
const { verifyToken } = require('../utils/token');
const ApiError = require('../utils/apiError');
const { User } = require('../models');

const auth = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
      }

      const payload = verifyToken(token);
      
      const user = await User.findByPk(payload.sub);
      if (!user) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found');
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = auth;