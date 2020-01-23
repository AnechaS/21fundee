const mongoose = require('mongoose');
const request = require('supertest');

const app = require('../../app');
const People = require('../../models/people');
const MockDBCollections = require('../MockDBCollections');

beforeAll(async () => {
  mongoose.Promise = global.Promise;
  await People.insertMany(MockDBCollections.people);
});
  
afterAll(() => {
  mongoose.disconnect();
});

// TODO test api return error

describe('GET /people', () => {
  test('should get all people when request is ok', async () => {
    const agent = await request(app)
      .get('/people')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(agent.body).toMatchObject([MockDBCollections.people]);
  });
});

describe('POST /people', () => {
  test('should create a new people when request is ok', async () => {
    const bodyRequest = {
      messengerUserId: 'asdf',
      firstName: 'b',
      lastName: 'a',
      province: 'สงขลา'
    };

    const agent = await request(app)
      .post('/people')
      .send(bodyRequest)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(agent.body).toMatchObject(bodyRequest);
  });

  test('should create a new people with value null when request is ok', async () => {
    const bodyRequest = {
      messengerUserId: 'asdf',
      firstName: 'null',
      lastName: 'null',
      province: 'สงขลา',
      gender: 'null',
      profilePicUrl: 'null',
      locale: 'null',
      source: 'null' 
    };

    const agent = await request(app)
      .post('/people')
      .send(bodyRequest)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(agent.body).toMatchObject({
      messengerUserId: 'asdf',
      province: 'สงขลา',
    });
  });

  test('should update province people in the corresponding when request is ok', async () => {
    const bodyRequest = {
      messengerUserId: 'abcde',
      firstName: 'b',
      lastName: 'a',
      province: 'ยะลา'
    };

    const agent = await request(app)
      .post('/people')
      .send(bodyRequest)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(agent.body).toMatchObject({
      ...MockDBCollections.people,
      ...bodyRequest
    });
  });

  test('should update district people in the corresponding when request is ok', async () => {
    const bodyRequest = {
      messengerUserId: 'abcde',
      firstName: 'b',
      lastName: 'a',
      district: 'เทพา'
    };

    const agent = await request(app)
      .post('/people')
      .send(bodyRequest)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(agent.body).toMatchObject(bodyRequest);
  });
});

describe('PUT /people', () => {
  test('should update the people when request is ok', async () => {
    const bodyRequest = {
      messengerUserId: 'abcde',
      firstName: 'b',
      lastName: 'a',
      province: MockDBCollections.people.province,
      district: 'fgew'
    };

    const agent = await request(app)
      .put(`/people/${MockDBCollections.people._id}`)
      .send(bodyRequest)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(agent.body).toMatchObject(bodyRequest);
  });
});

describe('DELETE /people', () => {
  test('should delete the people when request is ok', async () => {
    const agent = await request(app)
      .delete(`/people/${MockDBCollections.people._id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(agent.body).toMatchObject({ _id: MockDBCollections.people._id });

    await expect(People.findById(MockDBCollections.people._id)).resolves.toBeNull();
  });
});