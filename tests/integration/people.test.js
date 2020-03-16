const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const app = require('../../app');

const User = require('../../models/user.model');
const SessionToken = require('../../models/sessionToken.model');
const People = require('../../models/people.model');

mongoose.Promise = global.Promise;

let sessionToken;
let peoples;
let people;

beforeEach(async () => {
  await User.deleteMany({});
  await SessionToken.deleteMany({});
  await People.deleteMany({});

  const passwordHashed = await bcrypt.hash('1234', 1);
  const dbUser = {
    email: 'jonsnow@gmail.com',
    password: passwordHashed,
    username: 'Jon Snow',
    role: 'admin',
  };

  const dbPeoples = [
    {
      firstName: 'Sara',
      lastName: 'De',
      province: 'สงขลา',
      district: 'เทพา',
      dentalId: 'x',
      childName: 'Ant',
      childBirthday: '2560',
      gender: 'male',
    },
  ];

  people = {
    firstName: 'Makus',
    lastName: 'Yui',
    province: 'สงขลา',
    district: 'เทพา',
    dentalId: 'x',
    childName: 'Bee',
    childBirthday: '2560',
    gender: 'male',
  };

  const savedUser = await User.create(dbUser);
  sessionToken = SessionToken.generate(savedUser).token;

  const savedPeoples = await People.insertMany(dbPeoples);
  peoples = JSON.parse(JSON.stringify(savedPeoples));
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('GET /peoples', () => {
  test('should get all peoples', async () => {
    const agent = await request(app)
      .get('/peoples')
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body).toEqual(peoples);
  });

  test.todo('add should get all peoples with pagination');

  test.todo('add should filter peoples');

  // prettier-ignore
  test.todo('add should report error when pagination\'s parameters are not a number');

  test.todo('add should report error if logged user is not an admin');
});

describe('POST /peoples', () => {
  test('should create a new people', async () => {
    const agent = await request(app)
      .post('/peoples')
      .send(people)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    expect(agent.body).toMatchObject(people);
  });
});

describe('GET /peoples/:id', () => {
  test('should get the peoples', async () => {
    const agent = await request(app)
      .get(`/peoples/${peoples[0]._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body).toEqual(peoples[0]);
  });

  test('should report error when peoples does not exists', async () => {
    const agent = await request(app)
      .get('/peoples/asdfghj')
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('PUT /peoples/:id', () => {
  test('should update the people', async () => {
    const agent = await request(app)
      .put(`/peoples/${peoples[0]._id}`)
      .send(people)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body).toMatchObject(people);
  });

  test.todo('add should update and change "_id" the people');

  test('should report error when people does not exists', async () => {
    const agent = await request(app)
      .put('/peoples/jonsnow123')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('DELETE /peoples', () => {
  test('should delete the people', async () => {
    const agent = await request(app)
      .delete(`/peoples/${peoples[0]._id}`)
      .set('Authorization', sessionToken)
      .expect(httpStatus.NO_CONTENT);
    expect(agent.body).toEqual({});
    await expect(People.findById(peoples[0]._id)).resolves.toBeNull();
  });

  test('should report error when people does not exists', async () => {
    const agent = await request(app)
      .delete('/peoples/jonsnow123')
      .set('Authorization', sessionToken)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});
