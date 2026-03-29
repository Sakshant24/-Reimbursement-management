const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/user.controller');
const validate = require('../middleware/validate.middleware');
const authGuard = require('../middleware/auth.middleware');
const roleGuard = require('../middleware/role.middleware');

const router = express.Router();

router.use(authGuard);
router.use(roleGuard('ADMIN'));

router.post(
  '/',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('role').isIn(['EMPLOYEE', 'MANAGER']).withMessage('Role must be EMPLOYEE or MANAGER'),
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
  ],
  validate,
  userController.createUser
);

router.get('/', userController.getUsers);

router.patch(
  '/:id/role',
  [
    param('id').isUUID().withMessage('Invalid user ID format'),
    body('role').isIn(['EMPLOYEE', 'MANAGER', 'ADMIN']).withMessage('Role is invalid')
  ],
  validate,
  userController.changeRole
);

router.patch(
  '/:id/manager',
  [
    param('id').isUUID().withMessage('Invalid user ID format'),
    body('managerId').isUUID().withMessage('Invalid manager ID format')
  ],
  validate,
  userController.assignManager
);

module.exports = router;
