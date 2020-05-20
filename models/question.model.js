const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      index: true
    },
    name: {
      type: String,
      trim: true
    },
    type: {
      type: Number,
      enum: [1, 2, 3]
    },
    answers: {
      type: Array
    },
    correctAnswers: {
      type: [Number],
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Question', QuestionSchema);
