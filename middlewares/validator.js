const { validationResult } = require('express-validator');

module.exports = function (validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req).formatWith(
      ({ param, location, msg }) => ({
        field: param,
        location,
        message: msg
      })
    );
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    return next();
  };
};