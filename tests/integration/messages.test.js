const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../../app');
const People = require('../../models/people');
// const Message = require('../../models/message');
// const MockDBCollections = require('../MockDBCollections');

mongoose.Promise = global.Promise;

let people = {
  _id: undefined,
  eUserId: 'hjkl',
  firstName: 'Bran',
  lastName: 'Stark',
  province: 'สงขลา',
};

beforeAll(async () => {
  const peopleLast = await People.create(people);
  people._id = peopleLast._id.toString();
});
  
afterAll(async () => {
  await People.deleteOne({ _id: people._id });
  await mongoose.disconnect();
});

describe('POST /messages', () => {
  test('should get all message when request is ok', async () => {
    const agent = await request(app)
      .post('/messages')
      .send({
        people: {
          eUserId: people._id
        },
        schedule: {
          _id: ''
        },
        test: ''
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(agent.body).toMatchObject([]);
  });
});

describe('GET /messages', () => {
  test('should get all message when request is ok', async () => {
    const agent = await request(app)
      .get('/messages')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(agent.body).toMatchObject([]);
  });
});