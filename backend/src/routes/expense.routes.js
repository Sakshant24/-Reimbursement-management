const express = require('express');
const { body, param } = require('express-validator');
const expenseController = require('../controllers/expense.controller');
const validate = require('../middleware/validate.middleware');
const authGuard = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const router = express.Router();

router.use(authGuard);

router.post(
  '/',
  upload.single('receipt'),
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('currency').trim().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 letters'),
    body('category').isIn(['TRAVEL', 'FOOD', 'ACCOMMODATION', 'OFFICE_SUPPLIES', 'CONFERENCE', 'OTHER']).withMessage('Invalid category'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('date').isISO8601().toDate().withMessage('Date must be a valid ISO8601 string'),
    body('ocrRawText').optional().isString()
  ],
  validate,
  expenseController.createExpense
);

router.get('/', expenseController.getExpenses);

router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Invalid expense ID format')
  ],
  validate,
  expenseController.getExpenseById
);

module.exports = router;
