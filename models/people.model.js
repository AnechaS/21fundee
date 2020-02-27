const mongoose = require('mongoose');
const crypto = require('crypto');

const PeopleSchema = new mongoose.Schema({
  _id: {
    type: String,
    trim: true,
    default: () => crypto.randomBytes(15).toString('hex')
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
  botId: {
    type: String,
    trim: true
  },
  blockId: {
    type: String,
    trim: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('People', PeopleSchema);