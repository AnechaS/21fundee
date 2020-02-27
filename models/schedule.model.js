const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Schedule', ScheduleSchema);