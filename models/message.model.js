const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Message = new Schema({
  people: {
    type: String,
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
  quiz: {
    question: {
      type: mongoose.Types.ObjectId,
      ref: 'question',
    },
    answer: {
      type: Number,
    },
    isCorrect: {
      type: Boolean,
    },
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', Message);