const mongoose = require('mongoose');
const People = require('./people.model');
const { REPLY_SUBMITTED_TYPES } = require('../utils/constants');

const ReplySchema = new mongoose.Schema(
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
    blockId: {
      type: String,
      trim: true
    },
    text: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      trim: true
    },
    submittedType: {
      type: String,
      enum: REPLY_SUBMITTED_TYPES
    }
  },
  {
    timestamps: true
  }
);

ReplySchema.statics = {
  // TODO optimize speed query
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
        $sort: { 'schedule._id': 1 }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                name: '$schedule.name',
                // peoplesCount: '$peoplesCount',
                percentage: {
                  $multiply: [{ $divide: ['$peoplesCount', peoplesCount] }, 100]
                }
              }
            ]
          }
        }
      }
    ]);

    return result;
  }
};

module.exports = mongoose.model('Reply', ReplySchema);
