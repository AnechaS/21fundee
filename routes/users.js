const express = require('express');
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

module.exports = router;