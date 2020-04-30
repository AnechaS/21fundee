const mongoose = require('mongoose');
const People = require('./people.model');

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
      title: {
        type: String,
        trim: true
      }
    }
  },
  {
    timestamps: true
  }
);

ConversationSchema.statics = {
  // TODO optomize speed query
  async schedulePercentOfPeoples(query = {}, peoplesCount = 0) {
    let newQuery = query;

    if (Object.keys(query.createdAt || {}).length) {
      const qIdPeoples = await People.find(query)
        .sort({ createdAt: -1 })
        .select('_id');
      const idPeoples = qIdPeoples.map(o => o._id);
      newQuery = { ...newQuery, people: { $in: idPeoples } };
    }

    const result = this.aggregate([
      {
        $match: newQuery
      },
      {
        $group: {
          _id: '$schedule',
          peoples: { $addToSet: '$people' }
        }
      },
      {
        $lookup: {
          from: 'schedules',
          localField: '_id',
          foreignField: '_id',
          as: 'schedules'
        }
      },
      { $match: { schedules: { $ne: [] } } },
      {
        $addFields: {
          schedule: { $arrayElemAt: ['$schedules', 0] },
          peoplesCount: { $size: '$peoples' }
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                name: '$schedule.name',
                no: '$schedule.no',
                // peoplesCount: '$peoplesCount',
                percentage: {
                  $multiply: [{ $divide: ['$peoplesCount', peoplesCount] }, 100]
                }
              }
            ]
          }
        }
      },
      {
        $sort: { no: 1 }
      }
    ]);

    return result;
  }
};

module.exports = mongoose.model('Conversation', ConversationSchema);
