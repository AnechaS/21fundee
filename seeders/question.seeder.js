const { Seeder } = require('mongoose-data-seed');
const faker = require('faker');
const Question = require('../models/question.model');

class QuestionSeeder extends Seeder {
  async shouldRun() {
    const count = await Question.countDocuments().exec();
    return count === 0;
  }

  async run() {
    const data = Array.from({ length: 100 }, () => ({
      name: faker.lorem.sentence(),
      correctAnswers: Array.from(
        { length: faker.random.number({ min: 1, max: 5 }) },
        () => faker.random.number({ min: 1, max: 5 })
      )
    }));

    return Question.create(data);
  }
}

module.exports = QuestionSeeder;
