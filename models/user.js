const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const User = new Schema({
  userId: { type: String, index: { unique: true } },
  firstName: String,
  lastName: String,
  province: String,
  district: String,
  dentalPersonnelId: String,
  childName: String,
  childBirthday: String,
});

module.exports = mongoose.model('User', User);