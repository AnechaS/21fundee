const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    people: {
      type: String,
      ref: 'People',
      index: true
    },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      index: true
    },
    answer: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Comment', CommentSchema);
