const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');

const app = require('../../app');
const People = require('../../models/people');
const Schedule = require('../../models/schedule');

mongoose.Promise = global.Promise;

describe('POST /chatfuel/people', () => {
  let people;

  let json = {
    uid: '5e412c6d963c750001b96477',
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
      .send(json)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    
    people = agent.body;

    expect(agent.body).toMatchObject({
      _id: expect.anything(),
      firstName: json.firstName,
      lastName: json.lastName,
      province: json.province,
      district: json.district,
      dentalId: json.dentalId,
      childName: json.childName,
      childBirthday: json.childBirthday,
      gender: json.gender,
    });
  });

  test('should create a new people with value null', async () => {
    const agent = await request(app)
      .post('/chatfuel/people')
      .send({
        uid: '5e412c6d163c750001b96d73',
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
      _id: '5e412c6d163c750001b96d73',
      province: 'สงขลา',
    });

    await People.deleteOne({ _id: agent.body._id });
  });

  test('should update people if "_id" is exists', async () => {
    json = {
      ...json,
      firstName: 'b',
      lastName: 'a',
      province: 'ยะลา',
      district: 'เมือง'
    };

    const agent = await request(app)
      .post('/chatfuel/people')
      .send(json)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    
    expect(agent.body).toMatchObject({
      _id: people._id,
      firstName: json.firstName,
      lastName: json.lastName,
      province: json.province,
      district: json.district,
    });
  });

  
  test('should report error when uid is not provided', async () => {
    const agent = await request(app)
      .post('/chatfuel/people')
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


  test('should report error when uid is not mongo objectId', async () => {
    const agent = await request(app)
      .post('/chatfuel/people')
      .send({
        uid: '5e412c6d963c750001b96x77',
        province: 'สงขลา',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.INTERNAL_SERVER_ERROR);

    expect(agent.body.code).toBe(500);
    expect(agent.body.message).toBeDefined();
  });
});

describe('POST /chatfuel/message', () => {
  const people = {
    _id: '5e412c6d163c753701b96497',
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