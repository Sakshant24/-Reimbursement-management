const express = require('express');
const { body, param } = require('express-validator');
const approvalController = require('../controllers/approval.controller');
const validate = require('../middleware/validate.middleware');
const authGuard = require('../middleware/auth.middleware');
const roleGuard = require('../middleware/role.middleware');

const router = express.Router();

router.use(authGuard);
// Only Managers and Admins can approve/reject
router.use(roleGuard('MANAGER', 'ADMIN'));

router.post(
  '/:expenseId/approve',
  [
    param('expenseId').isUUID().withMessage('Invalid expense ID format'),
    body('comments').optional().isString()
  ],
  validate,
  approvalController.approveStep
);

router.post(
  '/:expenseId/reject',
  [
    param('expenseId').isUUID().withMessage('Invalid expense ID format'),
    body('comments').trim().isLength({ min: 3 }).withMessage('Rejection reason is required (min 3 chars)')
  ],
  validate,
  approvalController.rejectStep
);

router.get('/pending', approvalController.getPendingApprovals);

module.exports = router;
