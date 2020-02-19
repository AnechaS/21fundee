const httpStatus = require('http-status');
const APIError = require('../utils/APIError');

module.exports = function(req, res, next) {
  const trustedIps = '52.177.171.217';
  const requestIP = req.connection.remoteAddress;
  if(trustedIps === requestIP) {
    return next();
  } 

  return new APIError({
    message: `Access denied to IP address: ${requestIP}`,
    status: httpStatus.FORBIDDEN
  });
};