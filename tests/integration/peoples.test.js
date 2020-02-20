const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');

const app = require('../../app');
const People = require('../../models/people');

mongoose.Promise = global.Promise;

let people;

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /peoples', () => {
  test('should create a new people', async () => {
    const payload = {
      firstName: 'Jon',
      lastName: 'Snow',
      province: 'สงขลา',
      district: 'เทพา',
      dentalId: 'x',
      childName: 'bee',
      childBirthday: '2560',
      gender: 'male'
    };
    
    const agent = await request(app)
      .post('/peoples')
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);

    people = agent.body;

    expect(agent.body).toMatchObject({
      firstName: people.firstName,
      lastName: people.lastName,
      province: people.province,
      district: people.district,
      dentalId: people.dentalId,
      childName: people.childName,
      childBirthday: people.childBirthday,
      gender: people.gender,
    });
  });
});

describe('GET /peoples', () => {
  test('should get all peoples', async () => {
    const agent = await request(app)
      .get('/peoples')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);

    expect(agent.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: people._id,
          firstName: people.firstName,
          lastName: people.lastName,
          province: people.province,
          district: people.district,
          dentalId: people.dentalId,
          childName: people.childName,
          childBirthday: people.childBirthday,
          gender: people.gender,
        })
      ]));
  });
});

describe('PUT /peoples/:id', () => {
  test('should update the people', async () => {
    const payload = {
      firstName: 'c',
      lastName: 'd',
      province: people.province,
      district: 'fgew'
    };

    const agent = await request(app)
      .put(`/peoples/${people._id}`)
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
      
    expect(agent.body).toMatchObject({
      _id: people._id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      province: payload.province,
      district: payload.district
    });
  });

  test('should report error when people does not exists', async () => {
    const agent = await request(app)
      .put('/peoples/jonsnow123')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);

    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('DELETE /peoples', () => {
  test('should delete the people', async () => {
    const agent = await request(app)
      .delete(`/peoples/${people._id}`)
      .expect(httpStatus.NO_CONTENT);

    expect(agent.body).toEqual({});
    await expect(People.findById(people._id)).resolves.toBeNull();
  });

  test('should report error when people does not exists', async () => {
    const agent = await request(app)
      .delete('/peoples/jonsnow123')
      .expect(httpStatus.NOT_FOUND);

    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});