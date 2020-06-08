const mongoose = require('mongoose');
const crypto = require('crypto');
const chatfuel = require('../utils/chatfuel');

const PeopleSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      trim: true,
      default: () => crypto.randomBytes(8).toString('hex')
    },
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    gender: {
      type: String,
      trim: true
    },
    pic: {
      type: String,
      trim: true
    },
    province: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    dentalId: {
      type: String,
      trim: true,
      index: true
    },
    childName: {
      type: String,
      trim: true
    },
    childBirthday: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

PeopleSchema.statics = {
  async getAndFetch(id) {
    if (!id) {
      return;
    }

    const people = await this.findById(id);
    if (people) {
      return people;
    }

    const chatfuelUser = await chatfuel.getUser(id);
    if (!chatfuelUser) {
      return;
    }

    // create a new people
    const object = {
      _id: chatfuelUser.messengerUserId,
      firstName: chatfuelUser.firstName,
      lastName: chatfuelUser.lastName,
      gender: chatfuelUser.gender,
      pic: chatfuelUser.profilePicUrl,
      province: chatfuelUser.province,
      district: chatfuelUser.district,
      childName: chatfuelUser.name,
      childBirthday: chatfuelUser.year
    };

    this.create(object);
    return object;
  },
  address(query = {}) {
    const result = this.aggregate([
      {
        $match: query
      },
      {
        $group: {
          _id: {
            province: { $ifNull: ['$province', 'อื่นๆ'] },
            district: {
              $cond: {
                if: {
                  $gte: [{ $ifNull: ['$province', 'อื่นๆ'] }, 'อื่นๆ']
                },
                then: 'อำเภออื่นๆ',
                else: '$district'
              }
            }
          },
          count: { $sum: 1 },
          items: { $push: '$$ROOT' }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                province: '$_id.province',
                district: '$_id.district',
                peoplesCount: '$count',
                peoplesWithDIdCount: {
                  $size: {
                    $filter: {
                      input: '$items',
                      as: 'item',
                      cond: {
                        $eq: [
                          { $strLenCP: { $ifNull: ['$$item.dentalId', ''] } },
                          6
                        ]
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      },
      {
        $addFields: {
          peoplesGeneralCount: {
            $subtract: ['$peoplesCount', '$peoplesWithDIdCount']
          }
        }
      }
    ]);

    return result;
  },

  dailyCountCreated(query, period = 'day') {
    let pipeline = [{ $match: query }];
    switch (period) {
      case 'day':
        pipeline.push({
          $group: {
            _id: {
              day: {
                $dayOfMonth: { date: '$createdAt', timezone: 'Asia/Bangkok' }
              },
              month: {
                $month: { date: '$createdAt', timezone: 'Asia/Bangkok' }
              },
              year: {
                $year: { date: '$createdAt', timezone: 'Asia/Bangkok' }
              }
            },
            count: { $sum: 1 }
          }
        });
        break;

      case 'month':
        pipeline.push({
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        });
        break;

      default:
        pipeline.push({
          $group: {
            _id: {
              year: { $year: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        });
        break;
    }

    const result = this.aggregate(pipeline);
    return result;
  }
};

module.exports = mongoose.model('People', PeopleSchema);
