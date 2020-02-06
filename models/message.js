const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Message = new Schema({
  people: {
    type: Schema.Types.ObjectId,
    ref: 'People'
  },
  schedule: {
    type: Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true
  },
  text: {
    type: String,
    trim: true
  },
  image: {
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

module.exports = mongoose.model('Message', Message);