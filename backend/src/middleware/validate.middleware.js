const { validationResult } = require('express-validator');
const { error } = require('../utils/response.util');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 'Validation failed', 400, errors.array());
  }
  next();
};
