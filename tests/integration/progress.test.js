const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');

const app = require('../../app');
const User = require('../../models/user.model');
const SessionToken = require('../../models/sessionToken.model');
const People = require('../../models/people.model');
const Schedule = require('../../models/schedule.model');
const Progress = require('../../models/progress.model');

mongoose.Promise = global.Promise;

let sessionToken;
let dbPeoples;
let dbSchedules;
let dbProgresses;
let progress;

beforeEach(async () => {
  await User.deleteMany({});
  await SessionToken.deleteMany({});
  await People.deleteMany({});
  await Schedule.deleteMany({});
  await Progress.deleteMany({});

  const passwordHashed = await bcrypt.hash('1234', 1);
  const dbUser = {
    email: 'jonsnow@gmail.com',
    password: passwordHashed,
    username: 'Jon Snow'
  };

  const savedUser = await User.create(dbUser);
  sessionToken = SessionToken.generate(savedUser).token;

  const savedPeoples = await People.create([
    {
      firstName: 'Krillin',
      lastName: '',
      province: 'สงขลา',
      district: 'เทพา',
      dentalId: 'x',
      childName: 'Marron',
      childBirthday: '2560',
      gender: 'male'
    },
    {
      firstName: 'Son',
      lastName: 'Goku',
      province: 'ยะลา',
      district: 'เมือง',
      dentalId: '5976438',
      childName: 'Gohan',
      childBirthday: '2560',
      gender: 'male'
    }
  ]);
  dbPeoples = JSON.parse(JSON.stringify(savedPeoples));

  const savedSchedules = await Schedule.create([
    {
      name: 'Day 1'
    },
    {
      name: 'Day 2'
    }
  ]);
  dbSchedules = JSON.parse(JSON.stringify(savedSchedules));

  const savedProgress = await Progress.insertMany([
    {
      people: dbPeoples[0]._id,
      schedule: dbSchedules[0]._id,
      status: 2
    },
    {
      people: dbPeoples[1]._id,
      schedule: dbSchedules[0]._id,
      status: 1
    }
  ]);
  dbProgresses = JSON.parse(JSON.stringify(savedProgress));

  progress = {
    people: dbPeoples[0]._id,
    schedule: dbSchedules[1]._id,
    status: 1
  };
});

afterAll(async () => {
  await mongoose.disconnect();
});

/* const format = object => {
  const getPeople = dbPeoples.find(o => o._id === object.people);
  const getSchedule = dbSchedules.find(o => o._id === object.schedule);
  return {
    ...object,
    people: getPeople,
    schedule: getSchedule
  };
}; */

describe('GET /progresses', () => {
  test('should get all progress', async () => {
    const agent = await request(app)
      .get('/progresses')
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(agent.body.results).toEqual(dbProgresses);
  });

  test('should get count', async () => {
    const agent = await request(app)
      .get('/progresses')
      .query({ count: 1, limit: 0 })
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(agent.body.results).toEqual([]);
    expect(agent.body.count).toBe(2);
  });
});

describe('POST /progresses', () => {
  test('should reate a new progress', async () => {
    const agent = await request(app)
      .post('/progresses')
      .set('Authorization', sessionToken)
      .send(progress)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    expect(agent.body).toMatchObject(progress);
  });
});

describe('GET /progresses/:id', () => {
  test('should get the progress', async () => {
    const id = dbProgresses[0]._id;

    const agent = await request(app)
      .get(`/progresses/${id}`)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);

    // const progressTransformed = format(dbProgresses[0]);
    expect(agent.body._id).toBe(id);
    expect(agent.body).toEqual(dbProgresses[0]);
  });

  test('should report error when progress does not exists', async () => {
    const id = mongoose.Types.ObjectId();

    const agent = await request(app)
      .get(`/progresses/${id}`)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('PUT /progresses', () => {
  test('should update the progress', async () => {
    const id = dbProgresses[0]._id;

    const agent = await request(app)
      .put(`/progresses/${id}`)
      .send(progress)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body._id).toBe(id);
    expect(agent.body).toMatchObject(progress);
  });

  test('should report error when progresses does not exists', async () => {
    const id = mongoose.Types.ObjectId();

    const agent = await request(app)
      .put(`/progresses/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('DELETE /progresses', () => {
  test('should delete the progress', async () => {
    const id = dbProgresses[0]._id;

    const agent = await request(app)
      .delete(`/progresses/${id}`)
      .set('Authorization', sessionToken)
      .expect(httpStatus.NO_CONTENT);
    expect(agent.body).toEqual({});
    await expect(Progress.findById(id)).resolves.toBeNull();
  });

  test('should report error when progresses does not exists', async () => {
    const id = mongoose.Types.ObjectId();

    const agent = await request(app)
      .delete(`/progresses/${id}`)
      .set('Authorization', sessionToken)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});
