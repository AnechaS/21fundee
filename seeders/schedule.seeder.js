const { Seeder } = require('mongoose-data-seed');
const Schedule = require('../models/schedule');

const data = [
  {
    _id: '5e4ed482ec5c9224585e6b21',
    name: 'Day 1'
  },
  {
    _id: '5e4ed482ec5c9224585e6b22',
    name: 'Day 2'
  },
  {
    _id: '5e4ed482ec5c9224585e6b23',
    name: 'Day 3'
  },
  {
    _id: '5e4ed482ec5c9224585e6b24',
    name: 'Day 4'
  },
  {
    _id: '5e4ed482ec5c9224585e6b25',
    name: 'Day 5'
  },
  {
    _id: '5e4ed482ec5c9224585e6b26',
    name: 'Day 6'
  },
  {
    _id: '5e4ed482ec5c9224585e6b27',
    name: 'Day 7'
  },
  {
    _id: '5e4ed482ec5c9224585e6b28',
    name: 'Day 8'
  },
  {
    _id: '5e4ed482ec5c9224585e6b29',
    name: 'Day 9'
  },
  {
    _id: '5e4ed482ec5c9224585e6b2a',
    name: 'Day 10'
  },
  {
    _id: '5e4ed482ec5c9224585e6b2b',
    name: 'Day 11'
  },
  {
    _id: '5e4ed482ec5c9224585e6b2c',
    name: 'Day 12'
  },
  {
    _id: '5e4ed482ec5c9224585e6b2d',
    name: 'Day 13'
  },
  {
    _id: '5e4ed482ec5c9224585e6b2e',
    name: 'Day 14'
  },
  {
    _id: '5e4ed482ec5c9224585e6b2f',
    name: 'Day 15'
  },
  {
    _id: '5e4ed482ec5c9224585e6b31',
    name: 'Day 16'
  },
  {
    _id: '5e4ed482ec5c9224585e6b32',
    name: 'Day 17'
  },
  {
    _id: '5e4ed482ec5c9224585e6b33',
    name: 'Day 18'
  },
  {
    _id: '5e4ed482ec5c9224585e6b34',
    name: 'Day 19'
  },
  {
    _id: '5e4ed482ec5c9224585e6b35',
    name: 'Day 20'
  },
  {
    _id: '5e4ed482ec5c9224585e6b36',
    name: 'Day 21'
  }
];

class ScheduleSeeder extends Seeder {
  async shouldRun() {
    const count = await Schedule.countDocuments().exec();

    return count === 0;
  }

  async run() {
    return Schedule.create(data);
  }
}

module.exports = ScheduleSeeder;
