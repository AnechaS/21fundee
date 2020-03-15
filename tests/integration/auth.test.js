const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');
const moment = require('moment');

const app = require('../../app');
const SessionToken = require('../../models/sessionToken.model');
const User = require('../../models/user.model');

let dbUser;
let user;

beforeEach(async () => {
  dbUser = {
    email: 'branstark@gmail.com',
    password: 'mypassword',
    username: 'Bran Stark',
    role: 'admin',
  };

  user = {
    email: 'sousa.dfs@gmail.com',
    password: '123456',
    username: 'Daniel Sousa',
  };

  await User.deleteMany({});
  await User.create(dbUser);
  await SessionToken.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /auth/register', () => {
  it('should register a new user when request is ok', async () => {
    const agent = await request(app)
      .post('/auth/register')
      .send(user)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    
    delete user.password;

    expect(agent.body).toHaveProperty('sessionToken');
    expect(agent.body).toMatchObject(user);
  });

  it('should report error when email already exists', async () => {
    const agent = await request(app)
      .post('/auth/register')
      .send(dbUser)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CONFLICT);

    const errors = agent.body.errors[0];
    expect(errors.field).toBe('email');
    expect(errors.location).toBe('body');
    expect(errors.message).toBe('already exists');
  });

  it('should report error when the email provided is not valid', async () => {
    user.email = 'this_is_not_an_email';
    const agent = await request(app)
      .post('/auth/register')
      .send(user)
      .expect(httpStatus.BAD_REQUEST);

    const errors = agent.body.errors[0];
    expect(errors.field).toBe('email');
    expect(errors.location).toBe('body');
    expect(errors.message).toBe('Must be a valid email');
  });

  it('should report error when email and password are not provided', async () => {
    const agent = await request(app)
      .post('/auth/register')
      .send({})
      .expect(httpStatus.BAD_REQUEST);

    expect(agent.body).toMatchObject({
      errors: [
        {
          field: 'email',
          location: 'body',
          message: 'Is required'
        },
        {
          field: 'password',
          location: 'body',
          message: 'Is required'
        }
      ]
    });
  });
});

describe('POST /auth/login', () => {
  it('should return an accessToken and a refreshToken when email and password matches', async() => {
    const agent = await request(app)
      .post('/auth/login')
      .send(dbUser)
      .expect(httpStatus.OK);
    
    delete dbUser.password;
    
    expect(agent.body).toHaveProperty('sessionToken');
    expect(agent.body.email).toBe(dbUser.email);
    expect(agent.body.username).toBe(dbUser.username);
    expect(agent.body).toHaveProperty('sessionToken');
  }); 

  it('should report error when email and password are not provided', async () => {
    const agent = await request(app)
      .post('/auth/login')
      .send({})
      .expect(httpStatus.BAD_REQUEST);
      
    expect(agent.body).toMatchObject({
      errors: [
        {
          field: 'email',
          location: 'body',
          message: 'Is required'
        },
        {
          field: 'password',
          location: 'body',
          message: 'Is required'
        }
      ]
    });
  });

  it('should report error when the email provided is not valid', async () => {
    dbUser.email = 'this_is_not_an_email';

    const agent = await request(app)
      .post('/auth/login')
      .send(dbUser)
      .expect(httpStatus.BAD_REQUEST);
      
    const errors = agent.body.errors[0];
    expect(errors.field).toBe('email');
    expect(errors.location).toBe('body');
    expect(errors.message).toBe('Must be a valid email');
  });

  it("should report error when email and password don't match", async () => {
    dbUser.password = 'xxx';
    const agent = await request(app)
      .post('/auth/login')
      .send(dbUser)
      .expect(httpStatus.UNAUTHORIZED);

    const { code, message } = agent.body;
    expect(code).toBe(401);
    expect(message).toBe('Incorrect email or password');
  });
});

describe('POST /auth/logout', () => {
  let userLogined;
  beforeEach(async () => {
    userLogined = await request(app)
      .post('/auth/login')
      .send(dbUser)
      .expect(httpStatus.OK)
      .then(response => response.body);
  });

  it('should delete session token the user', async () => {
    const agent = await request(app)
      .post('/auth/logout')
      .set('Authorization', userLogined.sessionToken)
      .expect(httpStatus.NO_CONTENT);
    
    expect(agent.body).toEqual({});
    await expect(SessionToken.findOne({ token: userLogined.sessionToken })).resolves.toBeNull();
  });

  it('should report error when the sessionToken is expired', async () => {
    const expires = moment()
      .subtract(1, 'day')
      .toDate();

    await SessionToken.findOneAndUpdate(
      { token: userLogined.sessionToken }, 
      { expiresAt: expires }
    );

    const agent = await request(app)
      .post('/auth/logout')
      .set('Authorization', userLogined.sessionToken)
      .expect(httpStatus.UNAUTHORIZED);
    
    const { code, message } = agent.body;

    expect(code).toBe(401);
    expect(message).toBe('Invalid session token.');
  });
});