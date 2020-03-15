const httpStatus = require('http-status');
const moment = require('moment');
const APIError = require('../utils/APIError');
const SessionToken = require('../models/sessionToken.model');

const handleAuthorize = async (req, res, next, roles) => {
  try {
    const apiError = new APIError({
      message: 'Unauthorized',
      status: httpStatus.UNAUTHORIZED,
    });

    // check property authorization in headers not provide
    if (
      !Object.hasOwnProperty.call(req.headers, 'authorization') ||
      !req.headers.authorization.trim().length
    ) {
      return next(apiError);
    }

    const token = req.headers.authorization;
    const sessionToken = await SessionToken.findOne({ token }).populate(
      'user',
      '-password'
    );
    
    // check session token is exists database
    if (!sessionToken) {
      return next(apiError);
    }

    // check session token is expires
    if (moment(sessionToken.expiresAt).isBefore()) {
      apiError.message = 'Invalid session token.';
      return next(apiError);
    }

    const user = sessionToken.user.toObject();

    // check roles the user
    if (roles.length) {
      if (!roles.includes(user.role)) {
        apiError.message = 'Invalid Forbidden token.';
        apiError.status = httpStatus.FORBIDDEN;
        return next(apiError);
      }
    }

    req.user = user;

    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = function(...roles) {
  return (req, res, next) => handleAuthorize(req, res, next, roles);
};
