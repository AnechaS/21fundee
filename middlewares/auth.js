const httpStatus = require('http-status');
const passport = require('passport');
const APIError = require('../utils/APIError');

const handleBearer = (req, res, next, roles) => {
  try {
    const user = req.user;
    if (roles.length) {
      if (!roles.includes(user.role)) {
        throw new APIError({
          message: 'Forbidden',
          status: httpStatus.FORBIDDEN,
        });
      }
    }

    return next();
  } catch (e) {
    return next(e);
  }
};

module.exports = function(...roles) {
  return [
    passport.authenticate('bearer', { session: false }),
    (req, res, next) => handleBearer(req, res, next, roles),
  ];
}; 
