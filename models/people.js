const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const People = new Schema({
  messengerUserId: { 
    type: String, 
    index: { unique: true } 
  },
  firstName: String,
  lastName: String,
  gender: String,
  profilePicUrl: String,
  province: String,
  district: String,
  dentalPersonnelId: String,
  childName: String,
  childBirthday: String,
}, {
  timestamps: true
});

module.exports = mongoose.model('People', People);