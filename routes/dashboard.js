const express = require('express');
const moment = require('moment');
const _ = require('lodash');
const authorize = require('../middlewares/auth');
const dateArray = require('../utils/dateArray');

const People = require('../models/people.model');
const Reply = require('../models/reply.model');

const router = express.Router();

router.get('/', authorize(), async (req, res, next) => {
  try {
    const { period: per, dateStart, dateEnd } = req.query;

    // request the statistics for. Can be any of: day, month, year or range.
    const period = ['day', 'month', 'year'].includes(per) ? per : 'day';

    // date start query convert moment date
    let dStart;
    if (moment(dateStart || '', 'YYYY-MM-DD').isValid()) {
      dStart = moment(dateStart).startOf('day');
    }

    // date end query convert moment date
    let dEnd;
    if (moment(dateEnd || '', 'YYYY-MM-DD').isValid()) {
      dEnd = moment(dateEnd).endOf('day');
    }

    // moment locale
    const locale = 'th';

    // command query date in collections
    let comdQDate = {};
    if (dStart) {
      comdQDate = { createdAt: { $gte: dStart.toDate() } };
    }

    if (dEnd) {
      comdQDate = {
        createdAt: { ...comdQDate.createdAt, $lte: dEnd.toDate() }
      };
    }

    // query count peoples
    const countPeoples = await People.countDocuments(comdQDate);

    // query count peoples with dental id
    const qCountPeoplesWithDId = People.countDocuments({
      dentalId: { $exists: true, $regex: '^[0-9]{6}$' },
      ...comdQDate
    });

    // query count new created peoples
    let comdQNewCreatedPeoples = comdQDate;
    if (!Object.keys(comdQDate).length) {
      comdQNewCreatedPeoples = {
        createdAt: {
          $gte: moment()
            .startOf('day')
            .toDate(),
          $lte: moment()
            .endOf('day')
            .toDate()
        }
      };
    }

    const qCountNewCreatedPeoples = People.countDocuments(
      comdQNewCreatedPeoples
    );

    // query new data peoples
    const qPeoples = People.find(comdQDate)
      .sort({ createdAt: -1 })
      .limit(5);

    // query address
    const qAddressOfPeoples = People.address(comdQDate);

    // statistics created peoples in the period
    let dGtlQDCPeoples;
    let dLteQDCPeoples;
    if (dStart && !dEnd) {
      dGtlQDCPeoples = dStart.clone().toDate();
      dLteQDCPeoples = moment()
        .endOf('date')
        .toDate();
    } else if (dEnd && !dStart) {
      dGtlQDCPeoples = moment()
        .startOf('day')
        .toDate();
      dLteQDCPeoples = dEnd.clone().toDate();
    } else if (dStart && dEnd) {
      dGtlQDCPeoples = dStart
        .clone()
        .startOf(period)
        .toDate();

      dLteQDCPeoples = dEnd.clone().toDate();
    } else if (!Object.keys(comdQDate).length && period === 'day') {
      dGtlQDCPeoples = moment()
        .subtract(2, 'month')
        .startOf('day')
        .toDate();
      dLteQDCPeoples = moment()
        .endOf('date')
        .toDate();
    } else if (!Object.keys(comdQDate).length && period === 'month') {
      dGtlQDCPeoples = moment()
        .year('2019')
        .month(7)
        .startOf('day')
        .toDate();
      dLteQDCPeoples = moment()
        .endOf('date')
        .toDate();
    } else {
      dGtlQDCPeoples = moment()
        .year('2018')
        .startOf('year')
        .toDate();
      dLteQDCPeoples = moment()
        .endOf('date')
        .toDate();
    }

    const comdQDailyCreatedPeoples = {
      createdAt: {
        $gte: dGtlQDCPeoples,
        $lte: dLteQDCPeoples
      }
    };
    const qDailyCreatedPeoples = People.dailyCountCreated(
      comdQDailyCreatedPeoples,
      period
    );

    // query daily reply complate of peoples
    const qSchedulePercentOfPeoplesInConver = Reply.schedulePercentOfPeoples(
      comdQDate,
      countPeoples
    );

    const [
      countPeoplesWithDId,
      countNewCreatedPeoples,
      peoples,
      dailyCreatedPeoples,
      addressOfPeoples,
      schedulePercentOfPeoples
    ] = await Promise.all([
      qCountPeoplesWithDId,
      qCountNewCreatedPeoples,
      qPeoples,
      qDailyCreatedPeoples,
      qAddressOfPeoples,
      qSchedulePercentOfPeoplesInConver
    ]);

    // date widget number peoples
    const widget1 = {
      // name: 'total peoples',
      value: countPeoples
    };

    // date widget number new peoples
    const widget2 = {
      // name: 'new peoples',
      value: countNewCreatedPeoples
    };

    // data widget number people with dental id
    const widget3 = {
      // name: 'peoples with dental id',
      value: countPeoplesWithDId,
      percentage: Number(
        ((countPeoplesWithDId / countPeoples) * 100).toFixed(2)
      )
    };

    // data widget number people general
    const constPeoplesGeneral = Math.max(countPeoples - countPeoplesWithDId, 0);
    const widget4 = {
      // name: 'general peoples',
      value: constPeoplesGeneral,
      percentage: Number(
        ((constPeoplesGeneral / countPeoples) * 100).toFixed(2)
      )
    };

    // data widget chart people general
    const widget5 = {
      // name: 'statistics created peoples',
      labels: [],
      data: []
    };

    const getDateArr = dateArray({
      dateStart: dGtlQDCPeoples,
      dateEnd: dLteQDCPeoples,
      type: period
    });

    const dateFormats = {
      day: 'D MMM Y',
      month: 'MMM Y',
      year: 'YYYY'
    };

    widget5.labels = getDateArr.map(val => {
      return moment(val)
        .locale(locale)
        .format(dateFormats[period]);
    });

    widget5.data = getDateArr.map(val => {
      const i = dailyCreatedPeoples.findIndex(o => {
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

        return d.isSame(val, period);
      });

      if (i !== -1) {
        const v = dailyCreatedPeoples[i].count;
        return v;
      }

      return 0;
    });

    // data widget table province of peoples
    const widget6 = {
      // name: 'province',
      total: 0,
      maxPeoples: {
        name: '',
        value: ''
      },
      maxPeoplesWithDId: {
        name: '',
        value: ''
      },
      maxPeoplesGeneral: {
        name: '',
        value: ''
      },
      data: []
    };

    const province = (widget6.data = _(addressOfPeoples)
      .groupBy('province')
      .map((val, key) => {
        const peoplesCount = _.sum(val.map(o => o.peoplesCount));
        const peoplesWithDIdCount = _.sum(val.map(o => o.peoplesWithDIdCount));
        const peoplesGeneralCount = _.sum(val.map(o => o.peoplesGeneralCount));
        const percentage = Number(
          ((peoplesCount / countPeoples) * 100).toFixed(2)
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
      .value());

    widget6.total = province.length;

    const maxPeopleProvince = _(province).maxBy('peoplesCount');
    if (typeof maxPeopleProvince !== 'undefined') {
      widget6.maxPeoples = {
        name: maxPeopleProvince.province,
        value: maxPeopleProvince.peoplesCount
      };
    }

    const maxPeopleWithDIdProvince = _(province).maxBy('peoplesWithDIdCount');
    if (typeof maxPeopleWithDIdProvince !== 'undefined') {
      widget6.maxPeoplesWithDId = {
        name: maxPeopleWithDIdProvince.province,
        value: maxPeopleWithDIdProvince.peoplesWithDIdCount
      };
    }

    const maxPeoplesGeneralProvince = _(province).maxBy('peoplesGeneralCount');
    if (typeof maxPeoplesGeneralProvince !== 'undefined') {
      widget6.maxPeoplesGeneral = {
        name: maxPeoplesGeneralProvince.province,
        value: maxPeoplesGeneralProvince.peoplesGeneralCount
      };
    }

    // data widget table district of peoples
    const widget7 = {
      // name: 'district',
      total: 0,
      maxPeoples: {
        name: '',
        value: ''
      },
      maxPeoplesWithDId: {
        name: '',
        value: ''
      },
      maxPeoplesGeneral: {
        name: '',
        value: ''
      },
      data: []
    };

    const district = (widget7.data = addressOfPeoples.map(o => ({
      ...o,
      percentage: Number(((o.peoplesCount / countPeoples) * 100).toFixed(2))
    })));
    widget7.total = district.length;

    const maxPeopleDistrict = _(district).maxBy('peoplesCount');
    if (typeof maxPeopleDistrict !== 'undefined') {
      widget7.maxPeoples = {
        name: maxPeopleDistrict.province,
        value: maxPeopleDistrict.peoplesCount
      };
    }

    const maxPeopleWithDIdDistrict = _(district).maxBy('peoplesWithDIdCount');
    if (typeof maxPeopleWithDIdDistrict !== 'undefined') {
      widget7.maxPeoplesWithDId = {
        name: maxPeopleWithDIdDistrict.province,
        value: maxPeopleWithDIdDistrict.peoplesWithDIdCount
      };
    }

    const maxPeoplesGeneralDistrict = _(district).maxBy('peoplesGeneralCount');
    if (typeof maxPeoplesGeneralDistrict !== 'undefined') {
      widget7.maxPeoplesGeneral = {
        name: maxPeoplesGeneralDistrict.province,
        value: maxPeoplesGeneralDistrict.peoplesGeneralCount
      };
    }

    // data widget chart reply schedule complate percent
    const widget8 = {
      // name: 'reply percentage complete daily',
      max: 0,
      min: 0,
      labels: schedulePercentOfPeoples.map(o => o.name),
      data: []
    };
    const replySchedPercent = (widget8.data = schedulePercentOfPeoples.map(o =>
      Number(o.percentage.toFixed(2))
    ));

    const maxConvSchedPercentage = _.max(replySchedPercent);
    if (typeof maxConvSchedPercentage !== 'undefined') {
      widget8.max = maxConvSchedPercentage;
    }

    const mixConvSchedPercentage = _.min(replySchedPercent);
    if (typeof mixConvSchedPercentage !== 'undefined') {
      widget8.min = mixConvSchedPercentage;
    }

    // data widget list people lastes
    const widget9 = {
      // name: 'peoples',
      data: peoples
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
    return next(error);
  }
});

module.exports = router;
