const httpStatus = require('http-status');
const APIError = require('../utils/APIError');

module.exports = function(req, res, next) {
  const trustedIps = '104.209.176.191';
  const requestIP = req.ip;
  if(trustedIps === requestIP) {
    return next();
  } 

  return new APIError({
    message: `Access denied to IP address: ${requestIP}`,
    status: httpStatus.FORBIDDEN
  });
};