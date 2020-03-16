const mongoose = require('mongoose');
const httpStatus = require('http-status');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../app');

const User = require('../../models/user.model');
const SessionToken = require('../../models/sessionToken.model');
const Schedule = require('../../models/schedule.model');

mongoose.Promise = global.Promise;

let sessionToken;
let schedules;
let schedule;

beforeEach(async () => {
  await User.deleteMany({});
  await SessionToken.deleteMany({});
  await Schedule.deleteMany({});

  const passwordHashed = await bcrypt.hash('1234', 1);
  const dbUser = {
    email: 'jonsnow@gmail.com',
    password: passwordHashed,
    username: 'Jon Snow',
    role: 'admin',
  };

  const dbSchedules = [
    {
      name: 'Day 1',
    },
    {
      name: 'Day 2',
    },
  ];

  schedule = { name: 'Day 3' };

  const savedUser = await User.create(dbUser);
  sessionToken = SessionToken.generate(savedUser).token;

  const savedSchedules = await Schedule.insertMany(dbSchedules);
  schedules = JSON.parse(JSON.stringify(savedSchedules));
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('GET /schedules', () => {
  test('should get all schedules', async () => {
    const agent = await request(app)
      .get('/schedules')
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body).toEqual(schedules);
  });

  test.todo('add should get all schedules with pagination');

  test.todo('add should filter schedules');

  // prettier-ignore
  test.todo('add should report error when pagination\'s parameters are not a number');

  test.todo('add should report error if logged user is not an admin');
});

describe('POST /schedules', () => {
  test('should create a new schedule', async () => {
    const agent = await request(app)
      .post('/schedules')
      .send(schedule)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    expect(agent.body.name).toBe(schedule.name);
  });
});

describe('GET /schedules/:id', () => {
  test('should get the schedule', async () => {
    const agent = await request(app)
      .get(`/schedules/${schedules[0]._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body).toEqual(schedules[0]);
  });

  test('should report error when schedules does not exists', async () => {
    const agent = await request(app)
      .get('/schedules/asdfghj')
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('PUT /schedules', () => {
  test('should update the schedule', async () => {
    const agent = await request(app)
      .put(`/schedules/${schedules[0]._id}`)
      .send(schedule)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body._id).toBe(schedules[0]._id);
    expect(agent.body.name).toBe(schedule.name);
  });

  test.todo('add should update and change "_id" the schedule');

  test('should report error when schedules does not exists', async () => {
    const agent = await request(app)
      .put('/schedules/asdfghj')
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('DELETE /schedules', () => {
  test('should delete the schedule', async () => {
    const agent = await request(app)
      .delete(`/schedules/${schedules[0]._id}`)
      .set('Authorization', sessionToken)
      .expect(httpStatus.NO_CONTENT);
    expect(agent.body).toEqual({});
    await expect(Schedule.findById(schedules[0]._id)).resolves.toBeNull();
  });

  test('should report error when schedules does not exists', async () => {
    const agent = await request(app)
      .delete('/schedules/5e412c6d163c750001096478')
      .set('Authorization', sessionToken)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});
