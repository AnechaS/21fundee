const mongoose = require('mongoose');
const schemaQuery = require('../utils/schemaQuery');

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
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (doc, ret) => {
        delete ret._id;
      }
    }
  }
);

CommentSchema.query = schemaQuery;

module.exports = mongoose.model('Comment', CommentSchema);
