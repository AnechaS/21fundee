const { ExtractJwt, Strategy } = require('passport-jwt');
const appConfig = require('./config');

const jwtOptions = {
  secretOrKey: appConfig.jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
};

const jwt = async (payload, done) => {
  try {
    return done(null, payload.sub);
  } catch (error) {
    return done(error, false);
  }
};

module.exports = new Strategy(jwtOptions, jwt);