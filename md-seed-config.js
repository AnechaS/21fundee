const mongoose = require('mongoose');
const appConfig = require('./config');

const User = require('./seeders/user.seeder');
const Question = require('./seeders/question.seeder');
const Schedule = require('./seeders/schedule.seeder');

/**
 * Seeders List
 * order is important
 * @type {Object}
 */
exports.seedersList = {
  User,
  Question,
  Schedule
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
