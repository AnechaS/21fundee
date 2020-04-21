const express = require('express');
const moment = require('moment');
const authorize = require('../middlewares/auth');

const People = require('../models/people.model');
// const Conversation = require('../models/conversation.model');

const router = express.Router();

router.get('/', authorize(), async (req, res, next) => {
  try {
    // const conversation = await Conversation.find()
    //   // .limit(2000)
    //   .populate('people')
    //   .populate('schedule');

    const people = {};

    // count people all
    const CountPeoples = await People.countDocuments().exec();
    people.count = CountPeoples;
    // console.log('Count peoples: ', CountPeoples);

    // count people exists dental id
    const CountPeoplesWithDetalId = await People.countDocuments({
      dentalId: { $exists: true, $regex: '^[0-9]{6}$' }
    }).exec();
    people.countWithDetalId = CountPeoplesWithDetalId;
    // console.log('Count peoples with detal id: ', CountPeoplesWithDetalId);

    // count people general
    const CountPeoplesGeneral = Math.max(
      CountPeoples - CountPeoplesWithDetalId,
      0
    );
    // console.log('Count peoples general: ', CountPeoplesGeneral);

    // Count new peoples
    const CountNewPeoples = await People.find({
      createdAt: moment().toDate()
    });
    // console.log('Count new peoples: ', CountNewPeoples);

    // new peoples list
    const newPeoples = await People.find({
      createdAt: { $gte: moment('2020-04-14').toDate() }
    }).limit(5);
    // console.log('New peoples: ', newPeoples);

    // People create in deration
    const CountPeoplesCreatedInPeriod = await People.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$createdAt' },
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      }
    ]);

    return res.json({
      people
      // CountPeoples,
      // CountPeoplesWithDetalId,
      // CountPeoplesGeneral,
      // CountPeoplesCreatedInPeriod
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
