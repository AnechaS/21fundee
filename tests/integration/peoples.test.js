const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');

const app = require('../../app');
const People = require('../../models/people');

mongoose.Promise = global.Promise;

let people = {
  _id: '5e412c6d163c750001b96477',
  firstName: 'Jon',
  lastName: 'Snow',
  province: 'สงขลา',
  district: 'เทพา',
  dentalId: 'x',
  childName: 'bee',
  childBirthday: '2560',
  gender: 'male'
};

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /peoples', () => {
  test('should create a new people', async () => {
    const agent = await request(app)
      .post('/peoples')
      .send(people)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    
    people._id = agent.body._id;

    expect(agent.body).toMatchObject({
      _id: people._id,
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

  test('should create a new people with value null', async () => {
    const bodyRequest = {
      _id: '5e412c6d163c750001b96d73',
      firstName: 'null',
      lastName: 'null',
      province: 'สงขลา',
      gender: 'null',
      profilePicUrl: 'null',
      locale: 'null',
      source: 'null' 
    };

    const agent = await request(app)
      .post('/peoples')
      .send(bodyRequest)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
      
    expect(agent.body).toMatchObject({
      _id: bodyRequest._id,
      province: bodyRequest.province,
    });

    await People.deleteOne({ _id: agent.body._id });
  });

  test('should update people if "_id" is exists', async () => {
    people = {
      ...people,
      firstName: 'b',
      lastName: 'a',
      province: 'ยะลา',
      district: 'เมือง'
    };

    const agent = await request(app)
      .post('/peoples')
      .send(people)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    
    expect(agent.body).toMatchObject({
      _id: people._id,
      firstName: people.firstName,
      lastName: people.lastName,
      province: people.province,
      district: people.district,
    });
  });

  test('should report error when _id not objectId', async () => {
    const bodyRequest = {
      _id: '5e412c6d163cd73',
      firstName: 'null',
      lastName: 'null',
      province: 'สงขลา',
      gender: 'null',
      profilePicUrl: 'null',
      locale: 'null',
      source: 'null' 
    };

    const agent = await request(app)
      .post('/peoples')
      .send(bodyRequest)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.INTERNAL_SERVER_ERROR);

    expect(agent.body.code).toBe(500);
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
    const bodyRequest = {
      firstName: 'c',
      lastName: 'd',
      province: people.province,
      district: 'fgew'
    };

    const agent = await request(app)
      .put(`/peoples/${people._id}`)
      .send(bodyRequest)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
      
    expect(agent.body).toMatchObject({
      _id: people._id,
      firstName: bodyRequest.firstName,
      lastName: bodyRequest.lastName,
      province: bodyRequest.province,
      district: bodyRequest.district
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