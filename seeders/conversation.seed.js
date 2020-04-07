const { Seeder } = require('mongoose-data-seed');
const Conversation = require('../models/conversation.model');
const People = require('../models/people.model');
const Schedule = require('../models/schedule.model');

class ConversationSeeder extends Seeder {
  async shouldRun() {
    const count = await Conversation.countDocuments().exec();
    return count === 0;
  }

  async run() {
    const people = await People.findOne({});
    const schedule = await Schedule.findOne({});
    const data = [
      {
        people,
        schedule,
        text: 'Hello',
        botId: 'asdfqwer',
        blockId: 'zxcvbnm'
      }
    ];
    return Conversation.create(data);
  }
}

module.exports = ConversationSeeder;
