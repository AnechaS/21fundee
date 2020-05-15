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
    // TODO add field list answer
    // answers: Array,

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
