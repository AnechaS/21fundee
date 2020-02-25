const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Question = new Schema({
  title: {
    type: String,
    trim: true,
    required: true
  },
  // TODO add field list answer
  // answers: Array,
  corrects: {
    type: [Number],
    default: [],
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', Question);