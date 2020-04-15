const express = require('express');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const authorize = require('../middlewares/auth');

const User = require('../models/user.model');

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

router.get('/', authorize(), async (req, res, next) => {
  try {
    const users = await User.find().limit(2000);
    const transformedUsers = users.map(user => user.transform());
    res.json(transformedUsers);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authorize(), async (req, res, next) => {
  try {
    const user = req.user;
    res.json(user.transform());
  } catch (error) {
    next(error);
  }
});

router.post('/', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const user = await User.create(object);
    return res.status(httpStatus.CREATED).json(user.transform());
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', authorize(), async (req, res, next) => {
  try {
    const user = req.locals;
    res.json(user.transform());
  } catch (error) {
    next(error);
  }
});

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
