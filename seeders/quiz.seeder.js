const { Seeder } = require('mongoose-data-seed');
const Quiz = require('../models/quiz.model');
const People = require('../models/people.model');
const Schedule = require('../models/schedule.model');
const Question = require('../models/question.model');
const Conversation = require('../models/conversation.model');

class QuizSeeder extends Seeder {
  async shouldRun() {
    const count = await Quiz.countDocuments().exec();
    return count === 0;
  }

  async run() {
    const people = await People.findOne({});
    const schedule = await Schedule.findOne({});
    const conversation = await Conversation.findOne({});
    const question = await Question.findOne();
    const data = [
      {
        people,
        schedule,
        conversation,
        question,
        answer: question.correctAnswers[0],
        isCorrectAnswer: true,
        botId: 'asdfqwer',
        blockId: 'zxcvbnm'
      }
    ];
    return Quiz.create(data);
  }
}

module.exports = QuizSeeder;
