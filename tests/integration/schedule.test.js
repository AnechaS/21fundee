const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../../app');
const Schedule = require('../../models/schedule');
const MockDBCollections = require('../MockDBCollections');

beforeAll(async () => {
  mongoose.Promise = global.Promise;
  await Schedule.insertMany(MockDBCollections.schedule);
});
  
afterAll(() => {
  mongoose.disconnect();
});

describe('GET /schedule', () => {
  test('should get all schedule when request is ok', async () => {
    const agent = await request(app)
      .get('/schedule')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(agent.body).toMatchObject([MockDBCollections.schedule]);
  });
});

describe('POST /schedule', () => {
  test('should create a new schedule when request is ok', async () => {
    const bodyRequest = {
      name: 'Day 2'
    };

    const agent = await request(app)
      .post('/schedule')
      .send(bodyRequest)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(agent.body).toMatchObject(bodyRequest);
  });
});

describe('PUT /schedule', () => {
  test('should update the schedule when request is ok', async () => {
    const bodyRequest = {
      name: 'wxwg'
    };

    const agent = await request(app)
      .put(`/schedule/${MockDBCollections.schedule._id}`)
      .send(bodyRequest)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(agent.body).toMatchObject(bodyRequest);
  });
});

describe('DELETE /schedule', () => {
  test('should delete the schedule when request is ok', async () => {
    const agent = await request(app)
      .delete(`/schedule/${MockDBCollections.schedule._id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(agent.body).toMatchObject({ _id: MockDBCollections.schedule._id });

    await expect(Schedule.findById(MockDBCollections.schedule._id)).resolves.toBeNull();
  });
});