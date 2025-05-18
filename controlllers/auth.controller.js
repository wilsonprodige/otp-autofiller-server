const httpStatus = require('http-status');
const { authService } = require('../services');
const ApiResponse = require('../utils/apiResponse');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.loginWithEmailAndPassword(email, password);
    new ApiResponse(res, httpStatus.OK, { user, token }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

const googleAuth = async (req, res, next) => {
  try {
    const googleUser = req.body;
    const { user, token } = await authService.loginOrSignupWithGoogle(googleUser);
    new ApiResponse(res, httpStatus.OK, { user, token }, 'Google authentication successful');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  googleAuth,
};