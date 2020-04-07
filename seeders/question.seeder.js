const { Seeder } = require('mongoose-data-seed');
const Question = require('../models/question.model');

class QuestionSeeder extends Seeder {
  async shouldRun() {
    const count = await Question.countDocuments().exec();
    return count === 0;
  }

  async run() {
    const data = [
      {
        name: 'คุณคิดว่าฟันน้ำนมสำคัญยังไงเอ่ย?',
        correctAnswers: [1, 2, 3, 4, 5],
      },
    ];
    return Question.create(data);
  }
}

module.exports = QuestionSeeder;
