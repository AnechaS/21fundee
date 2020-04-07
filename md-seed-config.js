const mongoose = require('mongoose');
const appConfig = require('./config');

const User = require('./seeders/user.seeder');
const Question = require('./seeders/question.seeder');
const Schedule = require('./seeders/schedule.seeder');
const People = require('./seeders/people.seeder');
const Conversation = require('./seeders/conversation.seed');
const Quiz = require('./seeders/quiz.seeder');

/**
 * Seeders List
 * order is important
 * @type {Object}
 */
exports.seedersList = {
  User,
  Question,
  Schedule,
  People,
  Conversation,
  Quiz
};

/**
 * Connect to mongodb implementation
 * @return {Promise}
 */
exports.connect = async function() {
  const conn = await mongoose.connect(appConfig.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  return conn;
};
/**
 * Drop/Clear the database implementation
 * @return {Promise}
 */
exports.dropdb = function() {
  return mongoose.connection.db.dropDatabase();
};
