const express = require('express');
const moment = require('moment');
const _ = require('lodash');
const authorize = require('../middlewares/auth');
const logger = require('../utils/logger');
const { DATE_BEGIN } = require('../utils/constants');

const People = require('../models/people.model');
const Schedule = require('../models/schedule.model');

const router = express.Router();

/**
 * Report data After data 2020-04-04
 * @api {get} /v1
 */
router.get('/1', authorize(), async (req, res, next) => {
  try {
    const { period: per, dateStart, dateEnd } = req.query;

    // request the statistics for. Can be any of: day, month, year or range.
    const period = ['day', 'month', 'year'].includes(per) ? per : 'day';

    let dStart;
    let dEnd = moment().endOf('day');
    if (dateEnd && moment(dateEnd, 'YYYY-MM-DD').isValid()) {
      dEnd = moment.utc(dateEnd).endOf('day');
    }

    // query at times
    const createdAt = { $lte: dEnd.toDate() };
    if (dateStart && moment(dateStart, 'YYYY-MM-DD').isValid()) {
      dStart = moment.utc(dateStart).startOf('day');
      if (dStart.isSameOrBefore(DATE_BEGIN)) {
        dStart = moment.utc(DATE_BEGIN);
      }
      createdAt.$gte = dStart.toDate();
    }

    // query count peoples
    const peopleCount = People.countDocuments({ createdAt });

    // query count new peoples in last day
    const peopleCountLastDay = People.countDocuments({
      createdAt: {
        $gte: dEnd
          .clone()
          .startOf('day')
          .toDate(),
        $lte: dEnd
          .clone()
          .endOf('day')
          .toDate()
      }
    });

    // query count peoples with dental id
    const peopleCountWithDId = People.countDocuments({
      dentalId: { $exists: true, $regex: '^[0-9]{6}$' },
      createdAt
    });

    // query people address
    const peopleAddress = People.aggregate([
      {
        $match: {
          createdAt
        }
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

    // query daily peoples created
    let groupIdPeopleDaily = {
      day: {
        $dayOfMonth: { $add: ['$createdAt', 7 * 60 * 60 * 1000] }
      },
      month: {
        $month: { $add: ['$createdAt', 7 * 60 * 60 * 1000] }
      },
      year: {
        $year: { $add: ['$createdAt', 7 * 60 * 60 * 1000] }
      }
    };
    let dStartPeopleDaily;
    if (period === 'month' || period === 'year') {
      dStartPeopleDaily = dStart;
      if (!dStartPeopleDaily) {
        dStartPeopleDaily = moment.utc('2019-07-01').startOf('day');
      }

      if (period === 'year') {
        delete groupIdPeopleDaily.month;
      }
      delete groupIdPeopleDaily.day;
    } else {
      dStartPeopleDaily = dStart;
      if (!dStartPeopleDaily) {
        dStartPeopleDaily = dEnd
          .clone()
          .subtract(2, 'month')
          .startOf('day');
      }
    }

    const peopleDaily = People.aggregate([
      {
        $match: {
          createdAt: {
            $gte: dStartPeopleDaily.toDate(),
            $lte: dEnd.clone().toDate()
          }
        }
      },
      {
        $group: {
          _id: groupIdPeopleDaily,
          count: { $sum: 1 }
        }
      }
    ]).then(results => {
      const newResult = [];

      while (dEnd.isSameOrAfter(dStartPeopleDaily)) {
        const result = results.find(o => {
          const d = moment();
          if (Object.hasOwnProperty.call(o._id, 'day')) {
            d.date(o._id.day);
          }
          if (Object.hasOwnProperty.call(o._id, 'month')) {
            d.month(o._id.month - 1);
          }
          if (Object.hasOwnProperty.call(o._id, 'year')) {
            d.year(o._id.year);
          }
          return d.isSame(dStartPeopleDaily.format('YYYY-MM-DD'), period);
        });

        const object = {
          t: dStartPeopleDaily.valueOf(),
          y: result ? result.count : 0
        };

        newResult.push(object);
        dStartPeopleDaily.add(1, period);
      }

      return newResult;
    });

    // query last 5 peoples
    const peopleList = People.find({ createdAt })
      .sort({ createdAt: -1 })
      .limit(5);

    // progress group by schedule where status complate
    const scheduleStatusComplate = People.aggregate([
      [
        {
          $match: {
            createdAt
          }
        },
        {
          $lookup: {
            from: 'progresses',
            localField: '_id',
            foreignField: 'people',
            as: 'progress'
          }
        },
        {
          $unwind: '$progress'
        },
        {
          $match: {
            'progress.status': 2
          }
        },
        {
          $project: {
            _id: '$progress._id',
            people: '$_id',
            schedule: '$progress.schedule',
            status: '$progress.status',
            __v: '$progress.__v',
            createdAt: '$progress.createdAt',
            updatedAt: '$progress.updatedAt'
          }
        },
        {
          $group: {
            _id: '$schedule',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]
    ]);

    // query schedules
    const scheduleList = Schedule.find().sort({ _id: 1 });

    const {
      countPeople,
      countPeoplesWithDId,
      countPeopleGeneral,
      countPeopleLastDay,
      dailyCreatedPeople,
      provincePeople,
      districtPeople,
      listPeople,
      scheduleCountComplate
    } = await Promise.all([
      peopleCount,
      peopleCountWithDId,
      peopleCountLastDay,
      peopleDaily,
      peopleAddress,
      peopleList,
      scheduleStatusComplate,
      scheduleList
    ]).then(results => {
      const [
        countPeople,
        countPeoplesWithDId,
        countPeopleLastDay,
        dailyCreatedPeople,
        addressPeople,
        listPeople,
        scheduleCountComplate,
        listSchedule
      ] = results;

      const countPeopleGeneral = Math.max(countPeople - countPeoplesWithDId, 0);

      const provincePeople = _(addressPeople)
        .groupBy('province')
        .map((val, key) => {
          const peoplesCount = _.sum(val.map(o => o.peoplesCount));
          const peoplesWithDIdCount = _.sum(
            val.map(o => o.peoplesWithDIdCount)
          );
          const peoplesGeneralCount = _.sum(
            val.map(o => o.peoplesGeneralCount)
          );
          const percentage = Number(
            ((peoplesCount / countPeople) * 100).toFixed(2)
          );

          return {
            province: key,
            peoplesCount,
            peoplesWithDIdCount,
            peoplesGeneralCount,
            percentage
          };
        })
        .orderBy(['peoplesCount'], ['desc'])
        .value();

      const districtPeople = addressPeople.map(o => ({
        ...o,
        percentage: Number(((o.peoplesCount / countPeople) * 100).toFixed(2))
      }));

      const complateSchedule = listSchedule.map(o => {
        let count = 0;

        const object = scheduleCountComplate.find(
          subO => subO._id.toString() === o._id.toString()
        );
        if (object) {
          count = object.count;
        }

        const result = {
          x: o.name,
          y: Number(((count / countPeople) * 100).toFixed(2)),
          _id: o._id,
          count
        };
        return result;
      });

      const result = {
        countPeople,
        countPeoplesWithDId,
        countPeopleGeneral,
        countPeopleLastDay,
        dailyCreatedPeople,
        provincePeople,
        districtPeople,
        listPeople,
        scheduleCountComplate: complateSchedule
      };

      return result;
    });

    // widget total peoples
    const widget1 = {
      value: countPeople
    };

    // widget number new peoples
    const widget2 = {
      value: countPeopleLastDay
    };

    // widget number people with dental id
    const widget3 = {
      value: countPeoplesWithDId,
      percentage: Number(((countPeoplesWithDId / countPeople) * 100).toFixed(2))
    };

    // data widget number people general
    const widget4 = {
      value: countPeopleGeneral,
      percentage: Number(((countPeopleGeneral / countPeople) * 100).toFixed(2))
    };

    // data widget chart dialy peoples
    const widget5 = {
      data: dailyCreatedPeople
    };

    // data widget table province of peoples
    const widget6 = {
      total: provincePeople.length,
      data: provincePeople
    };

    if (provincePeople.length) {
      const maxPeopleProvin = _(provincePeople).maxBy('peoplesCount');
      if (typeof maxPeopleProvin !== 'undefined') {
        widget6.maxPeoples = {
          name: maxPeopleProvin.province,
          value: maxPeopleProvin.peoplesCount
        };
      }

      const maxPeopleWithDIdProvin = _(widget6.data).maxBy(
        'peoplesWithDIdCount'
      );
      if (typeof maxPeopleWithDIdProvin !== 'undefined') {
        widget6.maxPeoplesWithDId = {
          name: maxPeopleWithDIdProvin.province,
          value: maxPeopleWithDIdProvin.peoplesWithDIdCount
        };
      }

      const maxPeoplesGeneralProvin = _(widget6.data).maxBy(
        'peoplesGeneralCount'
      );
      if (typeof maxPeoplesGeneralProvin !== 'undefined') {
        widget6.maxPeoplesGeneral = {
          name: maxPeoplesGeneralProvin.province,
          value: maxPeoplesGeneralProvin.peoplesGeneralCount
        };
      }
    }

    // data widget table district of peoples
    const widget7 = {
      total: districtPeople.length,
      data: districtPeople
    };

    if (districtPeople.length) {
      const maxPeopleDistrict = _(districtPeople).maxBy('peoplesCount');
      if (typeof maxPeopleDistrict !== 'undefined') {
        widget7.maxPeoples = {
          name: maxPeopleDistrict.district,
          value: maxPeopleDistrict.peoplesCount
        };
      }

      const maxPeopleWithDIdDistrict = _(districtPeople).maxBy(
        'peoplesWithDIdCount'
      );
      if (typeof maxPeopleWithDIdDistrict !== 'undefined') {
        widget7.maxPeoplesWithDId = {
          name: maxPeopleWithDIdDistrict.district,
          value: maxPeopleWithDIdDistrict.peoplesWithDIdCount
        };
      }

      const maxPeoplesGeneralDistrict = _(districtPeople).maxBy(
        'peoplesGeneralCount'
      );
      if (typeof maxPeoplesGeneralDistrict !== 'undefined') {
        widget7.maxPeoplesGeneral = {
          name: maxPeoplesGeneralDistrict.district,
          value: maxPeoplesGeneralDistrict.peoplesGeneralCount
        };
      }
    }

    // data widget chart reply schedule complate percent
    const widget8 = {
      data: scheduleCountComplate
    };

    // data widget list people lastes
    const widget9 = {
      data: listPeople
    };

    const result = {
      widgets: [
        widget1,
        widget2,
        widget3,
        widget4,
        widget5,
        widget6,
        widget7,
        widget8,
        widget9
      ]
    };

    return res.json(result);
  } catch (error) {
    logger.error(error.message, error);
    return next(error);
  }
});

module.exports = router;
