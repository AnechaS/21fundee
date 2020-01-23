const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../../app');
// const Message = require('../../models/message');
const MockDBCollections = require('../MockDBCollections');

beforeAll(async () => {
  mongoose.Promise = global.Promise;
  // await Message.insertMany(MockDBCollections.schedule);
});
  
afterAll(() => {
  mongoose.disconnect();
});

describe('GET /message', () => {
  test('should get all message when request is ok', async () => {
    const agent = await request(app)
      .get('/message')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(agent.body).toMatchObject([MockDBCollections.message]);
  });
});