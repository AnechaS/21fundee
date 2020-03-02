const Strategy = require('passport-http-bearer');
const SessionToken = require('./models/sessionToken.model');

// SessionToken.findOne({ token })
//   .populate('user', '-password')
//   .then(result => {
//     if (!result) { 
//       return done(null, false);
//     }

//     const user = result.user.toObject();
//     return done(null, {
//       ...user,
//       sessionToken: token
//     });
//   }).catch(error => {
//     return done(error); 
//   });
  
const bearer = async (token, done) => {
  SessionToken.findOne({ token })
    .populate('user', '-password')
    .then(result => {
      if (!result) { 
        return done(null, false);
      }

      const user = result.user.toObject();
      return done(null, {
        ...user,
        sessionToken: token
      });
    }).catch(error => {
      return done(error); 
    });
};

module.exports = new Strategy(bearer);