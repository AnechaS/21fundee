const mongoose = require('mongoose');
const shortid = require('shortid');

const Schema = mongoose.Schema;

// TODO bot id

const People = new Schema({
  _id: {
    type: String,
    trim: true,
    default: shortid.generate
    // index: { unique: true },
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
  dentalId: {
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