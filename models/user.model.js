const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = new Schema({
  email: String,
  password: String,
  passwordReset: { type: String, select: false },
});

module.exports = mongoose.model('User', User);