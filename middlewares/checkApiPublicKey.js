const httpStatus = require('http-status');
const appConfig = require('../config');
const APIError = require('../utils/APIError');

module.exports = function(req, res, next) {
  const key = req.query.key;
  if (key && key === appConfig.apiPublicKey) {
    return next();
  }

  next(
    new APIError({
      message: 'Forbidden',
      status: httpStatus.FORBIDDEN
    })
  );
};
