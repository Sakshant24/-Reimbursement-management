const expenseService = require('../services/expense.service');
const { success } = require('../utils/response.util');

exports.createExpense = async (req, res, next) => {
  try {
    const data = await expenseService.createExpense(req.user, req.body, req.file);
    return success(res, data, 'Expense submitted successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    const data = await expenseService.getExpenses(req.user);
    return success(res, data, 'Expenses retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
};

exports.getExpenseById = async (req, res, next) => {
  try {
    const data = await expenseService.getExpenseById(req.user, req.params.id);
    return success(res, data, 'Expense details retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
};
