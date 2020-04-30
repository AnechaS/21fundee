const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const faker = require('faker');
const app = require('../../app');

const User = require('../../models/user.model');
const SessionToken = require('../../models/sessionToken.model');
const People = require('../../models/people.model');
const Schedule = require('../../models/schedule.model');
const Conversation = require('../../models/conversation.model');

mongoose.Promise = global.Promise;

let sessionToken;
let dbPeoples = [];
let dbSchedules = [];
let dbConversations = [];

const botId = 'asdfqwer';

beforeEach(async () => {
  await User.deleteMany({});
  await SessionToken.deleteMany({});
  await Conversation.deleteMany({});
  await Schedule.deleteMany({});
  await People.deleteMany({});

  const passwordHashed = await bcrypt.hash('1234', 1);
  const savedUser = await User.create({
    email: 'jonsnow@gmail.com',
    password: passwordHashed,
    username: 'Jon Snow',
    role: 'admin'
  });
  sessionToken = SessionToken.generate(savedUser).token;

  const mockDataPeoples = Array.from({ length: 10 }, () => ({
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    gender: faker.random.arrayElement(['male', 'female']),
    profilePicUrl: faker.image.image(),
    province: 'สงขลา',
    district: faker.random.arrayElement([
      'เทพา',
      'เมือง',
      'หาดใหญ่',
      'จะนะ',
      'สะเดา',
      'อำเภออื่นๆ'
    ]),
    dentalId: faker.random.arrayElement([
      'x',
      faker.helpers.replaceSymbolWithNumber('######')
    ]),
    childName: faker.name.firstName(),
    childBirthday: faker.random.arrayElement([
      'ก่อน 2560',
      '2560',
      '2561',
      '2562'
    ]),
    botId: 'asdfqwer'
  }));

  const savedPeoples = await People.insertMany(mockDataPeoples);
  dbPeoples = JSON.parse(JSON.stringify(savedPeoples));

  const mockDataSchedules = Array.from({ length: 21 }, (_, i) => ({
    name: `Day ${i + 1}`
  }));
  const savedSchedules = await Schedule.create(mockDataSchedules);
  dbSchedules = JSON.parse(JSON.stringify(savedSchedules));

  const mockDataConversation = dbPeoples.reduce((result, value, key) => {
    dbSchedules.forEach((o, k) => {
      if (key <= 6 || (key > 6 && k < 10) || (key > 8 && k < 18)) {
        const obj = {
          people: value._id,
          schedule: o._id,
          text: faker.lorem.word(),
          botId,
          blockId: faker.random.uuid()
        };

        if (faker.random.boolean()) {
          obj.reply = {
            type: faker.random.arrayElement(['button', 'freeform']),
            value: faker.random.arrayElement([1, 2, 3, 4, 5])
          };
        }

        result.push(obj);
      }
    });

    return result;
  }, []);

  const savedConversations = await Conversation.insertMany(
    mockDataConversation
  );
  dbConversations = JSON.parse(JSON.stringify(savedConversations));
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('GET /dashboards', () => {
  test('should return correct', async () => {
    const agent = await request(app)
      .get('/dashboards')
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);

    expect(agent.body).toHaveProperty('numberPeoples', dbPeoples.length);

    const countWithDentakId = dbPeoples.filter(
      ({ dentalId }) => dentalId && dentalId.length === 6
    ).length;
    expect(agent.body).toHaveProperty(
      'numberPeoplesWithDentalId',
      countWithDentakId
    );
    expect(agent.body).toHaveProperty(
      'numberPeoplesGeneral',
      dbPeoples.length - countWithDentakId
    );

    const sortDBPeoples = dbPeoples.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB - dateA;
    });
    expect(agent.body).toHaveProperty('peoples', sortDBPeoples.slice(0, 5));

    expect(agent.body).toHaveProperty('numberNewCreatedPeoples');
    expect(agent.body).toHaveProperty('dailyNumberCreatedPeoples');
    expect(agent.body).toHaveProperty('address');
    expect(agent.body).toHaveProperty('dailyRateConversation');
  });

  test('should get data when conversation daily duplicate people id', async () => {
    const schedule = dbSchedules.find(o => o.name === 'Day 1');
    const conversation = dbConversations.find(o => o.schedule === schedule._id);
    delete conversation._id;
    await Conversation.create(conversation);

    const agent = await request(app)
      .get('/dashboards')
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);

    const objectTest = agent.body.dailyRateConversation.find(
      o => o._id === conversation.schedule
    );

    expect(objectTest.percentage).toBe(100);
  });
});
