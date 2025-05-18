const { User } = require('../models');
const { generateToken } = require('../utils/token');
const ApiError = require('../utils/apiError');

const loginWithEmailAndPassword = async (email, password) => {
  const user = await User.findOne({ where: { email, authProvider: 'local' } });
  
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(401, 'Incorrect email or password');
  }
  
  const token = generateToken(user.id);
  
  return { user, token };
};

const loginOrSignupWithGoogle = async (googleUser) => {
  let user = await User.findOne({ where: { googleId: googleUser.id } });
  
  if (!user) {
    // Create new user from Google data
    user = await User.create({
      googleId: googleUser.id,
      email: googleUser.email,
      firstName: googleUser.given_name,
      lastName: googleUser.family_name,
      fullName: googleUser.name,
      profilePicture: googleUser.picture,
      isEmailVerified: googleUser.verified_email,
      authProvider: 'google',
    });
  }
  
  const token = generateToken(user.id);
  
  return { user, token };
};

module.exports = {
  loginWithEmailAndPassword,
  loginOrSignupWithGoogle,
};