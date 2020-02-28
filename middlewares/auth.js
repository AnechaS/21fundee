const httpStatus = require('http-status');
const passport = require('passport');
const APIError = require('../utils/APIError');

const handleJWT = (req, res, next, roles) => async (err, user, info) => {
  try {
    const error = err || info;
    if (error || !user) {
      throw new APIError({
        message: error ? error.message : 'Unauthorized',
        status: httpStatus.UNAUTHORIZED,
        stack: error ? error.stack : undefined,
      });
    }

    if (roles.length) {
      if (!roles.includes(user.role)) {
        throw new APIError({
          message: error ? error.message : 'Forbidden',
          status: httpStatus.FORBIDDEN,
        });
      }
    }

    await req.logIn(user, { session: false });
  } catch (e) {
    return next(e);
  }

  return next();
};

module.exports = function(...roles) {
  return (req, res, next) => passport.authenticate(
    'jwt', { session: false },
    handleJWT(req, res, next, roles),
  )(req, res, next);
}; 
