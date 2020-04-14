const mongoose = require('mongoose');

const replyTypes = ['button', 'freeform'];

const ConversationSchema = new mongoose.Schema(
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
    botId: {
      type: String,
      trim: true,
      required: true
    },
    blockId: {
      type: String,
      trim: true,
      required: true
    },
    text: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      trim: true
    },
    reply: {
      type: {
        type: String,
        enum: replyTypes
      },
      value: {
        type: String,
        trim: true
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Conversation', ConversationSchema);
