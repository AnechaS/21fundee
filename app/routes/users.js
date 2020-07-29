const express = require('express');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const authorize = require('../middlewares/auth');

const User = require('../models/user');

const router = express.Router();

router.param('id', async (req, res, next, id) => {
  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const user = await User.findById(id).select('-password');
      if (user) {
        req.locals = user;
        return next();
      }
    }

    // object id is not exists
    throw new APIError({
      message: 'Object not found.',
      status: httpStatus.NOT_FOUND
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * List users
 * @api {get} /users
 */
router.get('/', authorize(), async (req, res, next) => {
  try {
    const users = await User.find().limit(2000);
    const transformedUsers = users.map(user => user.transform());
    res.json(transformedUsers);
  } catch (error) {
    next(error);
  }
});

/**
 * Create a new user
 * @api {post} /users
 */
router.post('/', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const user = await User.create(object);
    return res.status(httpStatus.CREATED).json(user.transform());
  } catch (error) {
    return next(error);
  }
});

/**
 * Get user infomation
 * @api {post} /users
 */
router.get('/:id', authorize(), async (req, res, next) => {
  try {
    const user = req.locals;
    res.json(user.transform());
  } catch (error) {
    next(error);
  }
});

/**
 * TODO: add response session token.
 * Get user with SessionToken
 * @api {get} /users/me
 */
router.get('/me', authorize(), async (req, res, next) => {
  try {
    const user = req.user;
    res.json(user.transform());
  } catch (error) {
    next(error);
  }
});

/**
 * Update user
 * @api {put} /users/:id
 */
router.put('/:id', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const user = Object.assign(req.locals, object);
    const savedUser = await user.save();
    return res.json(savedUser.transform());
  } catch (error) {
    return next(error);
  }
});

/**
 * TODO: Change password with SessionToken
 * @api {post} /users/me/change-password
 */
router.post('/me/changePassword', authorize(), async (req, res, next) => {
  try {
    const { password, newPassword } = req.body;
    // verify user with token and password
    // clear session token ยกเว้น token ที่ส่งมา
    // if password equal new password then response
    // change new password then user
    // return true

    // const object = req.body;
    // const user = await User.create(object);
    return res.status(httpStatus.OK).json({});
  } catch (error) {
    return next({
      results: false,
      message: error.message
    });
  }
});

/**
 * TODO: Update user with SessionToken.
 * @api {post} /users/me
 */
router.put('/me', authorize(), async (req, res, next) => {
  try {
    const { password, newPassword } = req.body;
    // verify user with token and password
    // clear session token ยกเว้น token ที่ส่งมา
    // if password equal new password then response
    // change new password then user
    // return true

    // const object = req.body;
    // const user = await User.create(object);
    return res.status(httpStatus.OK).json({});
  } catch (error) {
    return next({
      results: false,
      message: error.message
    });
  }
});

/**
 * Delete a user
 * @api {delete} /users/:id
 */
router.delete('/:id', authorize(), async (req, res, next) => {
  try {
    const user = req.locals;
    await user.remove();
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;