const express = require('express');
const { body } = require('express-validator');
const httpStatus = require('http-status');
const moment = require('moment');
const appConfig = require('../config');
const _ = require('lodash');
const APIError = require('../utils/APIError');
const validator = require('../middlewares/validator');

const RefreshToken = require('../models/refreshToken.model');
const User = require('../models/user.model');

const router = express.Router();

/**
 * Returns a formated object with tokens
 * @private
 */
function generateTokenResponse(user, accessToken) {
  const tokenType = 'Bearer';
  const refreshToken = RefreshToken.generate(user).token;
  const expiresIn = moment().add(appConfig.jwtExpirationInterval, 'minutes');
  return {
    tokenType,
    accessToken,
    refreshToken,
    expiresIn,
  };
}

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
    const token = generateTokenResponse(user, user.token());
    res.status(httpStatus.CREATED);
    return res.json({ token, user: userTransformed });
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
    const { user, accessToken } = await User.findAndGenerateToken(req.body);
    const token = generateTokenResponse(user, accessToken);
    const userTransformed = user.transform();
    return res.json({ token, user: userTransformed });
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {post} v1/auth/refresh-token Refresh Token
 * @apiDescription Refresh expired accessToken
 * @apiVersion 1.0.0
 * @apiName RefreshToken
 * @apiGroup Auth
 * @apiPermission public
 */
router.post('/refresh-token', validator([
  body('refreshToken', 'Is required')
    .trim()
    .isLength({ min: 1 })
]), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const refreshObject = await RefreshToken.findOneAndRemove({
      token: refreshToken,
    }).populate('user');
    if (!refreshObject) {
      throw new APIError({
        status: httpStatus.UNAUTHORIZED,
        message: 'Incorrect refreshToken'
      });
    }

    if (moment(refreshObject.expiresAt).isBefore()) {
      throw new APIError({
        status: httpStatus.UNAUTHORIZED,
        message: 'Invalid refresh token.'
      });
    }

    const user = refreshObject.user;
    const response = generateTokenResponse(user, user.token());
    return res.json(response);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
