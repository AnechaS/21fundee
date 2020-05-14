const mongoose = require('mongoose');
const People = require('./people.model');

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
    botId: {
      type: String,
      trim: true
    },
    blockId: {
      type: String,
      trim: true
    },
    text: {
      type: String,
      trim: true
    },
    source: {
      type: String,
      trim: true
    },
    type: {
      type: Number,
      enum: [1, 2, 3, 4]
    }
  },
  {
    timestamps: true
  }
);

ReplySchema.statics = {
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

module.exports = mongoose.model('Reply', ReplySchema);
