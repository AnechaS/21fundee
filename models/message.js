const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// TODO bot id and block id

const Message = new Schema({
  people: {
    type: Schema.Types.ObjectId,
    ref: 'People'
  },
  schedule: {
    type: Schema.Types.ObjectId,
    ref: 'Schedule'
  },
  text: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', Message);