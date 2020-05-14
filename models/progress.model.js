const mongoose = require('mongoose');

const replyTypes = ['started', 'complete'];

const ProgressSchema = new mongoose.Schema(
  {
    people: {
      type: String,
      ref: 'People',
      required: true
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      required: true
    },
    status: {
      type: String,
      enum: replyTypes
    }
  },
  {
    timestamps: true
  }
);

ProgressSchema.index({ people: -1, schedule: -1 });

module.exports = mongoose.model('Progress', ProgressSchema);
