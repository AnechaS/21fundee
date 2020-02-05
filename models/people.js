const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// TODO bot id and block id

const People = new Schema({
  messengerUserId: { 
    type: String,
    index: { unique: true },
    required: true,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  gender: {
    type: String,
    trim: true
  },
  profilePicUrl: {
    type: String,
    trim: true
  },
  province: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  dpId: {
    type: String,
    trim: true
  },
  childName: {
    type: String,
    trim: true
  },
  childBirthday: {
    type: String,
    trim: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('People', People);