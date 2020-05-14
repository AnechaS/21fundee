const mongoose = require('mongoose');

const replyTypes = ['started', 'complete'];

const ProgressSchema = new mongoose.Schema(
  {
    people: {
      type: String,
      ref: 'People',
      index: true,
      required: true
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Schedule',
      index: true,
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
