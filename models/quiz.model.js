const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema(
  {
    people: {
      type: String,
      ref: 'People',
      required: true,
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true,
    },
    botId: {
      type: String,
      trim: true,
      required: true,
    },
    blockId: {
      type: String,
      trim: true,
      required: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    answer: {
      type: Number,
    },
    isCorrectAnswer: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Quiz', QuizSchema);
