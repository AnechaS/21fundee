const request = require('supertest');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const User = require('../../models/user.model');
const SessionToken = require('../../models/sessionToken.model');

const app = require('../../app');

let sessionToken;
let users;
let admin;

beforeEach(async () => {
  await User.deleteMany({});
  await SessionToken.deleteMany({});

  const password = '123456';
  const passwordHashed = await bcrypt.hash(password, 1);

  const dbUsers = [
    {
      email: 'jonsnow@gmail.com',
      password: passwordHashed,
      username: 'Jon Snow',
      role: 'admin',
    },
    {
      email: 'branstark@gmail.com',
      password: passwordHashed,
      username: 'Bran Stark',
      role: 'admin',
    },
  ];

  admin = {
    email: 'sousa.dfs@gmail.com',
    password,
    username: 'Daniel Sousa',
  };

  const savedUsers = await User.insertMany(dbUsers);
  // eslint-disable-next-line no-unused-vars
  const transformedUsers = savedUsers.map(o => o.transform());
  users = JSON.parse(JSON.stringify(transformedUsers));
  sessionToken = SessionToken.generate(users[0]).token;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('GET /users', () => {
  test('should get all users', async () => {
    const agent = await request(app)
      .get('/users')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body).toEqual(users);
  });

  test.todo('add should get all users with pagination');

  test.todo('add should filter users');

  // prettier-ignore
  test.todo('add should report error when pagination\'s parameters are not a number');

  test.todo('add should report error if logged user is not an admin');
});

describe('GET /users/me', () => {
  test("should get the logged user's info", async () => {
    const agent = await request(app)
      .get('/users/me')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body).toEqual(users[0]);
  });

  test('should report error without stacktrace when accessToken is expired', async () => {
    const expiresToken = moment()
      .subtract(1, 'days')
      .toDate();
    await new Promise(resolve => setTimeout(resolve, 500));
    await SessionToken.findOneAndUpdate(
      { token: sessionToken },
      { expiresAt: expiresToken }
    );

    const agent = await request(app)
      .get('/users/me')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.UNAUTHORIZED);

    expect(agent.body.code).toBe(401);
    expect(agent.body.message).toBe('Session token expired.');
  });
});

describe('POST /users', () => {
  test('should create a new user', async () => {
    const agent = await request(app)
      .post('/users')
      .send(admin)
      .set('Authorization', sessionToken)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);

    delete admin.password;

    expect(agent.body).toMatchObject(admin);
  });
});

describe('GET /users/:id', () => {
  test('should get the user', async () => {
    const agent = await request(app)
      .get(`/users/${users[0]._id}`)
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body).toMatchObject(users[0]);
  });

  test('should resport error when user does not exists', async () => {
    const agent = await request(app)
      .get('/users/asdf')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('PUT /users/:id', () => {
  test('should update the user', async () => {
    const agent = await request(app)
      .put(`/users/${users[0]._id}`)
      .send(admin)
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);

    delete admin.password;

    expect(agent.body).toMatchObject(admin);
  });

  test('should resport error when user does not exists', async () => {
    const agent = await request(app)
      .put('/users/asdf')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('DELETE /users/:id', () => {
  test('should delete the user', async () => {
    const agent = await request(app)
      .delete(`/users/${users[0]._id}`)
      .set('Authorization', sessionToken)
      .expect(httpStatus.NO_CONTENT);
    expect(agent.body).toEqual({});
    await expect(User.findById(users[0]._id)).resolves.toBeNull();
  });

  test('should resport error when user does not exists', async () => {
    const agent = await request(app)
      .delete('/users/asdf')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});
