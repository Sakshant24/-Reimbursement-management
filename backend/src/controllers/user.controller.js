const userService = require('../services/user.service');
const { success } = require('../utils/response.util');

exports.createUser = async (req, res, next) => {
  try {
    const data = await userService.createUser(req.user, req.body);
    return success(res, data, 'User created successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const data = await userService.getUsers(req.user);
    return success(res, data, 'Users retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
};

exports.changeRole = async (req, res, next) => {
  try {
    const data = await userService.changeRole(req.user, req.params.id, req.body.role);
    return success(res, data, 'Role updated successfully', 200);
  } catch (err) {
    next(err);
  }
};

exports.assignManager = async (req, res, next) => {
  try {
    const data = await userService.assignManager(req.user, req.params.id, req.body.managerId);
    return success(res, data, 'Manager assigned successfully', 200);
  } catch (err) {
    next(err);
  }
};
