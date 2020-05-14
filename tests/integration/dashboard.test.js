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
const Reply = require('../../models/reply.model');

mongoose.Promise = global.Promise;

let sessionToken;
let dbPeoples = [];
let dbSchedules = [];
let dbReplys = [];

const botId = 'asdfqwer';

beforeEach(async () => {
  await User.deleteMany({});
  await SessionToken.deleteMany({});
  await Reply.deleteMany({});
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

  const mockDataPeoples = Array.from({ length: 10 }, (v, k) => {
    const object = {
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
      dentalId: 'x',
      childName: faker.name.firstName(),
      childBirthday: faker.random.arrayElement([
        'ก่อน 2560',
        '2560',
        '2561',
        '2562'
      ]),
      botId: 'asdfqwer'
    };

    if (k <= 6) {
      object.dentalId = faker.helpers.replaceSymbolWithNumber('######');
    }

    return object;
  });

  const savedPeoples = await People.insertMany(mockDataPeoples);
  dbPeoples = JSON.parse(JSON.stringify(savedPeoples));

  const mockDataSchedules = Array.from({ length: 21 }, (_, i) => ({
    name: `Day ${i + 1}`
  }));
  const savedSchedules = await Schedule.create(mockDataSchedules);
  dbSchedules = JSON.parse(JSON.stringify(savedSchedules));

  const mockDataReply = dbPeoples.reduce((result, value, key) => {
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
          obj.type = faker.random.arrayElement(['button', 'freeform']);
        }

        result.push(obj);
      }
    });

    return result;
  }, []);

  const savedReplys = await Reply.insertMany(mockDataReply);
  dbReplys = JSON.parse(JSON.stringify(savedReplys));
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

    const [
      widget1,
      widget2,
      widget3,
      widget4,
      widget5,
      widget6,
      widget7
    ] = agent.body.widgets;

    expect(widget1).toEqual({ value: 10 });
    expect(widget2).toEqual({ value: 10 });
    expect(widget3).toEqual({
      value: 7,
      percentage: 70
    });
    expect(widget4).toEqual({
      value: 3,
      percentage: 30
    });

    expect(widget6).toEqual({
      total: 1,
      maxPeoples: { name: 'สงขลา', value: 10 },
      maxPeoplesWithDId: { name: 'สงขลา', value: 7 },
      maxPeoplesGeneral: { name: 'สงขลา', value: 3 },
      data: [
        {
          province: 'สงขลา',
          peoplesCount: 10,
          peoplesWithDIdCount: 7,
          peoplesGeneralCount: 3,
          percentage: 100
        }
      ]
    });
  });

  // test('should get data when reply daily duplicate people id', async () => {
  //   const schedule = dbSchedules.find(o => o.name === 'Day 1');
  //   const reply = dbReplys.find(o => o.schedule === schedule._id);
  //   delete reply._id;
  //   await Reply.create(reply);

  //   const agent = await request(app)
  //     .get('/dashboards')
  //     .set('Accept', 'application/json')
  //     .set('Authorization', sessionToken)
  //     .expect('Content-Type', /json/)
  //     .expect(httpStatus.OK);

  //   const objectTest = agent.body.dailyRateReply.find(
  //     o => o._id === reply.schedule
  //   );

  //   expect(objectTest.percentage).toBe(100);
  // });
});
