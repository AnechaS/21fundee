const { Seeder } = require('mongoose-data-seed');
const faker = require('faker');
const Quiz = require('../models/quiz.model');
const People = require('../models/people.model');
const Schedule = require('../models/schedule.model');
const Question = require('../models/question.model');

class QuizSeeder extends Seeder {
  async shouldRun() {
    const count = await Quiz.countDocuments().exec();
    return count === 0;
  }

  async run() {
    const schedule = await Schedule.findOne({});
    const people = await People.findOne({});
    const question = await Question.find();

    const data = question.map(o => {
      const answer = faker.random.arrayElement([1, 2, 3, 4, 5]);
      return {
        people: people._id,
        schedule,
        question,
        answer: answer,
        isCorrectAnswer: o.correctAnswers.includes(answer),
        botId: 'asdfqwer',
        blockId: 'zxcvbnm'
      };
    });

    return Quiz.create(data);
  }
}

module.exports = QuizSeeder;
