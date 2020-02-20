const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');

const app = require('../../app');
const People = require('../../models/people');
const Schedule = require('../../models/schedule');
const { IP_CHATFUEL } = require('../../utils/constants');

mongoose.Promise = global.Promise;

describe('POST /chatfuel/people', () => {
  let payload = {
    uid: 'abcde',
    firstName: 'Jon',
    lastName: 'Snow',
    province: 'สงขลา',
    district: 'เทพา',
    dentalId: 'x',
    childName: 'bee',
    childBirthday: '2560',
    gender: 'male'
  };

  test('should create a new people', async () => {
    const agent = await request(app)
      .post('/chatfuel/people')
      .set('x-real-ip', IP_CHATFUEL)
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);

    expect(agent.body).toMatchObject({
      _id: payload.uid,
      firstName: payload.firstName,
      lastName: payload.lastName,
      province: payload.province,
      district: payload.district,
      dentalId: payload.dentalId,
      childName: payload.childName,
      childBirthday: payload.childBirthday,
      gender: payload.gender,
    });
  });

  test('should create a new people with value null', async () => {
    const agent = await request(app)
      .post('/chatfuel/people')
      .set('x-real-ip', IP_CHATFUEL)
      .send({
        uid: 'gggg',
        firstName: 'null',
        lastName: 'null',
        province: 'สงขลา',
        gender: 'null',
        profilePicUrl: 'null',
        locale: 'null',
        source: 'null' 
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
      
    expect(agent.body).toMatchObject({
      _id: 'gggg',
      province: 'สงขลา',
    });

    await People.deleteOne({ _id: agent.body._id });
  });

  test('should update people if "_id" is exists', async () => {
    payload = {
      ...payload,
      firstName: 'b',
      lastName: 'a',
      province: 'ยะลา',
      district: 'เมือง'
    };

    const agent = await request(app)
      .post('/chatfuel/people')
      .set('x-real-ip', IP_CHATFUEL)
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    
    expect(agent.body).toMatchObject({
      _id: payload.uid,
      firstName: payload.firstName,
      lastName: payload.lastName,
      province: payload.province,
      district: payload.district,
    });
  });

  
  test('should report error when uid is not provided', async () => {
    const agent = await request(app)
      .post('/chatfuel/people')
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);
      
    const { field } = agent.body.errors[0];
    const { location } = agent.body.errors[0];
    const { message } = agent.body.errors[0];
    expect(field).toBe('uid');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });
});

describe('POST /chatfuel/message', () => {
  const people = {
    _id: '1601b96497',
    firstName: 'Bran',
    lastName: 'Stark',
    province: 'สงขลา',
  };

  const schedule = { 
    _id: '5e734c6d163c753701b96547',
    name: 'Day 2' 
  };
    
  beforeAll(async () => {
    await People.create(people);
    await Schedule.create(schedule);
  });
    
  afterAll(async () => {
    await People.deleteOne({ _id: people._id });
    await Schedule.deleteOne({ _id: schedule._id });
    await mongoose.disconnect();
  });

  test('should create a new message', async () => {
    const agent = await request(app)
      .post('/chatfuel/message')
      .set('x-real-ip', IP_CHATFUEL)
      .send({
        people: people._id,
        schedule: schedule._id,
        text: 'Hello World'
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);

    expect(agent.body).toMatchObject({
      _id: expect.anything(),
      people: people._id,
      schedule: schedule._id,
      text: 'Hello World'
    });
  });
});