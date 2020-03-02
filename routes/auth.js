const express = require('express');
const { body } = require('express-validator');
const httpStatus = require('http-status');
const _ = require('lodash');
const APIError = require('../utils/APIError');
const validator = require('../middlewares/validator');
const authorize = require('../middlewares/auth');

const SessionToken = require('../models/sessionToken.model');
const User = require('../models/user.model');

const router = express.Router();

/**
 * @api {post} auth/register Register
 * @apiDescription Register a new user
 * @apiVersion 1.0.0
 * @apiName Register
 * @apiGroup Auth
 */
router.post('/register', validator([
  body('email')
    .trim()
    .notEmpty().withMessage('Is required')
    .bail()
    .isEmail().withMessage('Must be a valid email'),
  body('password')
    .trim()
    .notEmpty().withMessage('Is required')
    .bail()
    .isLength({ min: 6, max: 128 })
]), async (req, res, next) => {
  try {
    const userData = _.omit(req.body, 'role');
    const user = await new User(userData).save();
    const userTransformed = user.transform();
    const sessionToken = SessionToken.generate(user).token;
    res.status(httpStatus.CREATED);
    return res.json({ ...userTransformed, sessionToken });
  } catch (error) {
    return next(User.checkDuplicateEmail(error));
  }
});

/**
 * @api {post} v1/auth/login Login
 * @apiDescription Get an accessToken
 * @apiVersion 1.0.0
 * @apiName Login
 * @apiGroup Auth
 * @apiPermission public
 */
router.post('/login', validator([
  body('email')
    .trim()
    .notEmpty().withMessage('Is required')
    .bail()
    .isEmail().withMessage('Must be a valid email'),
  body('password')
    .trim()
    .notEmpty().withMessage('Is required')
    .bail()
    .isLength({ max: 128 })
]), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).exec();
    if (user && await user.passwordMatches(password)) {
      const sessionToken = SessionToken.generate(user).token;
      const userTransformed = user.transform();
      return res.json({ ...userTransformed, sessionToken });
    }

    throw new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'Incorrect email or password'
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {post} v1/auth/logout Logout Token
 * @apiDescription Logout user
 * @apiVersion 1.0.0
 * @apiName Logout
 * @apiGroup Auth
 * @apiPermission public
 */
router.post('/logout', authorize(), async (req, res, next) => {
  try {
    const token = req.headers.authorization.replace('Bearer ', '');
    await SessionToken.remove({ token });
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
