const express = require('express');
const { omit } = require('lodash');
const authorize = require('../middlewares/auth');
const User = require('../models/user.model');

const router = express.Router();

router.get('/', authorize('admin'), async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authorize(), async (req, res, next) => {
  try {
    const user = omit(req.user, ['sessionToken']);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;