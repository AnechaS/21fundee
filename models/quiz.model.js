const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema(
  {
    people: {
      type: String,
      ref: 'People',
      index: true,
      required: true
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      index: true,
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
      index: true,
      required: true
    },
    answer: {
      type: Number,
      required: true
    },
    isCorrectAnswer: {
      type: Boolean,
      required: true
    },
    answerText: {
      type: String
    },
    desc: {
      type: String
    }
    // TODO score
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Quiz', QuizSchema);
