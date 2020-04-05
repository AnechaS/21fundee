const { Seeder } = require('mongoose-data-seed');
const Question = require('../models/question.model');

const data = [
  {
    _id: '5e4ed320f813281e48042cc5',
    title: 'คุณคิดว่าฟันน้ำนมสำคัญยังไงเอ่ย?',
    correctAnswers: [1, 2, 3, 4, 5],
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
