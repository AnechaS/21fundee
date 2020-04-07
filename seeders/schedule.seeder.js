const { Seeder } = require('mongoose-data-seed');
const Schedule = require('../models/schedule.model');

class ScheduleSeeder extends Seeder {
  async shouldRun() {
    const count = await Schedule.countDocuments().exec();
    return count === 0;
  }

  async run() {
    const data = Array.from({ length: 21 }, (_, i) => ({
      name: `Day ${i + 1}`
    }));
    return Schedule.create(data);
  }
}

module.exports = ScheduleSeeder;
