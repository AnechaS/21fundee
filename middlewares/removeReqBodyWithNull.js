const removeRequestBodyWithNull = require('../utils/omitWithNull');

module.exports = function(req, res, next) {
  req.body = removeRequestBodyWithNull(req.body);
  return next();
};