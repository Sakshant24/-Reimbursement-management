const ruleService = require('../services/rule.service');
const { success } = require('../utils/response.util');

exports.createRule = async (req, res, next) => {
  try {
    const data = await ruleService.createRule(req.user, req.body);
    return success(res, data, 'Rule created successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.getRules = async (req, res, next) => {
  try {
    const data = await ruleService.getRules(req.user);
    return success(res, data, 'Rules retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
};

exports.updateRule = async (req, res, next) => {
  try {
    const data = await ruleService.updateRule(req.user, req.params.id, req.body);
    return success(res, data, 'Rule updated successfully', 200);
  } catch (err) {
    next(err);
  }
};

exports.deleteRule = async (req, res, next) => {
  try {
    const data = await ruleService.deleteRule(req.user, req.params.id);
    return success(res, data, 'Rule deleted successfully', 200);
  } catch (err) {
    next(err);
  }
};
