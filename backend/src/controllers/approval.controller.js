const approvalService = require('../services/approval.service');
const { success } = require('../utils/response.util');

exports.approveStep = async (req, res, next) => {
  try {
    const data = await approvalService.approveStep(req.user, req.params.expenseId, req.body.comments);
    return success(res, data, 'Expense step approved successfully', 200);
  } catch (err) {
    next(err);
  }
};

exports.rejectStep = async (req, res, next) => {
  try {
    const data = await approvalService.rejectStep(req.user, req.params.expenseId, req.body.comments);
    return success(res, data, 'Expense rejected successfully', 200);
  } catch (err) {
    next(err);
  }
};

exports.getPendingApprovals = async (req, res, next) => {
  try {
    const data = await approvalService.getPendingApprovals(req.user);
    return success(res, data, 'Pending approvals retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
};
