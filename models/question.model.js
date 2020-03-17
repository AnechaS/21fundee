const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    // TODO add field list answer
    // answers: Array,

    correctAnswers: {
      type: [Number],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Question', QuestionSchema);
