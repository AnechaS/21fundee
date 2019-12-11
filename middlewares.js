const { validationResult } = require('express-validator');

// export async function handleApiHeaders(req, res, next) {
//   try {
//     if (req.header('x-api-key') !== 'me1tmoru01TOi5Ss1x') {
//       return res.status(400).json({ error: 'unauthorized' });
//     }

//     const token = req.header('authorization');
//     if (!token.trim().length) {
//       return res.status(403).json({ error: 'Invalid session token' });
//     }

//     // query user
//     Parse.User.enableUnsafeCurrentUser();
//     const user = await Parse.User.become(token);

//     // query user detail
//     const UserDetail = Parse.Object.extend('UserDetail');
//     const userDetailQuery = new Parse.Query(UserDetail);
//     userDetailQuery.equalTo('userid', user.get('userid'));
//     userDetailQuery.select(['firstname', 'surname', 'friend']);
//     const userDetail = await userDetailQuery.first();

//     // remote filed unwanted of user
//     const newUser = _.omit(user.toJSON(), ['ACL', 'createdAt', 'updatedAt']);

//     // remote filed unwanted of user detail
//     const newUserDetail = _.omit(userDetail.toJSON(), [
//       'createdAt',
//       'updatedAt',
//     ]);
//     newUserDetail.__type = 'Object';
//     newUserDetail.className = 'UserDetail';

//     const object = { ...newUser, detail: newUserDetail };

//     // set data to request
//     req.user = object;

//     return next();
//   } catch (error) {
//     return res.json({ error: 'Invalid session token' }).status(403);
//   }
// }

exports.handleValidator = function(validations) {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    // const errors = validationResult(req);
    // if (errors.isEmpty()) {
    //   return next();
    // }

    // res.status(400).json({ error: errors.array() });

    const errors = validationResult(req).formatWith(
      ({ location, msg, value }) => ({
        location,
        message: msg,
        value,
      })
    );
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ error: errors.mapped() });
  };
};

