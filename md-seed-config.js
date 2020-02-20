const mongoose = require('mongoose');
const appConfig = require('./config');

const Users = require('./seeders/user.seeder');
const Question = require('./seeders/question.seeder');
const Schedule = require('./seeders/schedule.seeder');

/**
 * Seeders List
 * order is important
 * @type {Object}
 */
const seedersList = {
  Users,
  Question,
  Schedule
};
/**
 * Connect to mongodb implementation
 * @return {Promise}
 */
const connect = async () => mongoose.connect(appConfig.mongodb, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
});
/**
 * Drop/Clear the database implementation
 * @return {Promise}
 */
const dropdb = async () => mongoose.connection.db.dropDatabase();

module.exports = {
  seedersList,
  connect,
  dropdb
};