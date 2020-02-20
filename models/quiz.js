const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Quiz = new Schema({
  people: {
    type: String,
    ref: 'People'
  },
  question: {
    type: mongoose.Types.ObjectId,
    ref: 'question',
    required: true,
  },
  answer: {
    type: Number,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
    required: true,
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

module.exports = mongoose.model('Quiz', Quiz);