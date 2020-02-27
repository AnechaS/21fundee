const httpStatus = require('http-status');
const APIError = require('../utils/APIError');

const IP_CHATFUEL = '104.209.176.191';

module.exports = function(req, res, next) {
  const requestIP = req.get('x-real-ip');
  if(requestIP === IP_CHATFUEL) {
    return next();
  } 

  next(new APIError({
    message: `Access denied to IP address: ${requestIP}`,
    status: httpStatus.FORBIDDEN
  }));
};