const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Schedule = new Schema({
  name: {
    type: String,
    trim: true,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Schedule', Schedule);