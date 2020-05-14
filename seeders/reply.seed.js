const { Seeder } = require('mongoose-data-seed');
const faker = require('faker');
const Reply = require('../models/reply.model');
const People = require('../models/people.model');
const Schedule = require('../models/schedule.model');

class ReplySeeder extends Seeder {
  async shouldRun() {
    const count = await Reply.countDocuments().exec();
    return count === 0;
  }

  async run() {
    const peoples = await People.find({}).limit(300);
    const schedule = await Schedule.findOne({});
    const data = peoples.map(o => {
      const obj = {
        people: o,
        schedule,
        text: faker.lorem.text(),
        botId: 'asdfqwer',
        blockId: 'zxcvbnm'
      };

      if (faker.random.boolean()) {
        obj.reply = {
          type: faker.random.arrayElement(['button', 'freeform']),
          value: faker.random.arrayElement([1, 2, 3, 4, 5])
        };
      }

      return obj;
    });
    return Reply.create(data);
  }
}

module.exports = ReplySeeder;
