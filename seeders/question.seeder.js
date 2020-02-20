const { Seeder } = require('mongoose-data-seed');
const Question = require('../models/question');

const data = [
  {
    title: 'คุณคิดว่าฟันน้ำนมสำคัญยังไงเอ่ย?',
    correct: 5
  },
];

class QuestionSeeder extends Seeder {
  async shouldRun() {
    const count = await Question.countDocuments().exec();

    return count === 0;
  }

  async run() {
    return Question.create(data);
  }
}

module.exports = QuestionSeeder;