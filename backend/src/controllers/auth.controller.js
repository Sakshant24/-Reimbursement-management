const authService = require('../services/auth.service');
const { success } = require('../utils/response.util');

exports.signup = async (req, res, next) => {
  try {
    const data = await authService.signup(req.body);
    return success(res, data, 'Signup successful', 201);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    return success(res, data, 'Login successful', 200);
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const data = await authService.getMe(req.user.userId);
    return success(res, data, 'User retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
};
