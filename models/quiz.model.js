const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema(
  {
    people: {
      type: String,
      ref: 'People',
      required: true
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true
    },
    botId: {
      type: String,
      trim: true
    },
    blockId: {
      type: String,
      trim: true
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
    },
    answer: {
      type: Number
    },
    isCorrectAnswer: {
      type: Boolean
    }
    // TODO score
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Quiz', QuizSchema);
