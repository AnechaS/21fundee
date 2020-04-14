const { Seeder } = require('mongoose-data-seed');
const Quiz = require('../models/quiz.model');
const Schedule = require('../models/schedule.model');
const Question = require('../models/question.model');
const Conversation = require('../models/conversation.model');

class QuizSeeder extends Seeder {
  async shouldRun() {
    const count = await Quiz.countDocuments().exec();
    return count === 0;
  }

  async run() {
    const schedule = await Schedule.findOne({});
    const conversations = await Conversation.find({
      reply: { $exists: true }
    }).limit();
    const question = await Question.findOne();
    const data = conversations.map(o => {
      return {
        people: o.people,
        conversation: o,
        schedule,
        question,
        answer: o.reply.value,
        isCorrectAnswer: question.correctAnswers.includes(o.reply.value),
        botId: 'asdfqwer',
        blockId: 'zxcvbnm'
      };
    });
    return Quiz.create(data);
  }
}

module.exports = QuizSeeder;
