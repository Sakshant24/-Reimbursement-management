const express = require('express');
const { body, param } = require('express-validator');
const ruleController = require('../controllers/rule.controller');
const validate = require('../middleware/validate.middleware');
const authGuard = require('../middleware/auth.middleware');
const roleGuard = require('../middleware/role.middleware');

const router = express.Router();

router.use(authGuard);
router.use(roleGuard('ADMIN'));

const ruleValidations = [
  body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('ruleType').isIn(['SEQUENTIAL', 'PERCENTAGE', 'SPECIFIC', 'HYBRID']).withMessage('Invalid ruleType'),
  body('thresholdPercentage')
    .if(body('ruleType').isIn(['PERCENTAGE', 'HYBRID']))
    .isFloat({ min: 1, max: 100 }).withMessage('Percentage must be 1-100'),
  body('specificApproverId')
    .if(body('ruleType').isIn(['SPECIFIC', 'HYBRID']))
    .isUUID().withMessage('Valid specificApproverId is required'),
  body('approverSequence').isArray({ min: 1 }).withMessage('approverSequence must be an array with min 1 entry'),
  body('approverSequence.*.userId').isUUID().withMessage('Invalid userId in sequence'),
  body('approverSequence.*.stepOrder').isInt({ min: 1 }).withMessage('Invalid stepOrder in sequence')
];

router.post('/', ruleValidations, validate, ruleController.createRule);
router.get('/', ruleController.getRules);

router.patch(
  '/:id',
  [param('id').isUUID().withMessage('Invalid rule ID')],
  validate, 
  ruleController.updateRule
);

router.delete(
  '/:id',
  [param('id').isUUID().withMessage('Invalid rule ID')],
  validate,
  ruleController.deleteRule
);

module.exports = router;
