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
let dbPeoples;
let people;

beforeEach(async () => {
  await User.deleteMany({});
  await SessionToken.deleteMany({});
  await People.deleteMany({});

  const passwordHashed = await bcrypt.hash('1234', 1);
  const savedUser = await User.create({
    email: 'jonsnow@gmail.com',
    password: passwordHashed,
    username: 'Jon Snow',
    role: 'admin'
  });
  sessionToken = SessionToken.generate(savedUser).token;

  people = {
    firstName: 'Vegeta',
    lastName: '',
    province: 'สงขลา',
    district: 'เทพา',
    dentalId: 'x',
    childName: 'Trunks',
    childBirthday: '2560',
    gender: 'male'
  };

  const savedPeoples = await People.insertMany([
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
    expect(agent.body.results).toEqual(dbPeoples);
  });

  test('should get people with where', async () => {
    const agent = await request(app)
      .get('/peoples')
      .query({
        where: JSON.stringify({
          firstName: 'Son',
          lastName: 'Goku'
        })
      })
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);

    const matchResults = dbPeoples.filter(
      o => o.firstName === 'Son' && o.lastName === 'Goku'
    );
    expect(agent.body.results).toEqual(matchResults);
  });
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
    const id = dbPeoples[0]._id;

    const agent = await request(app)
      .get(`/peoples/${id}`)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body).toEqual(dbPeoples[0]);
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
    const id = dbPeoples[0]._id;

    const agent = await request(app)
      .put(`/peoples/${id}`)
      .send(people)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body._id).toBe(id);
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
      .delete(`/peoples/${dbPeoples[0]._id}`)
      .set('Authorization', sessionToken)
      .expect(httpStatus.NO_CONTENT);
    expect(agent.body).toEqual({});
    await expect(People.findById(dbPeoples[0]._id)).resolves.toBeNull();
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
