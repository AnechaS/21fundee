const mongoose = require('mongoose');
const httpStatus = require('http-status');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../app');

const User = require('../../models/user.model');
const SessionToken = require('../../models/sessionToken.model');
const Question = require('../../models/question.model');

mongoose.Promise = global.Promise;

let sessionToken;
let questions;
let question;

beforeEach(async () => {
  await User.deleteMany({});
  await SessionToken.deleteMany({});
  await Question.deleteMany({});

  const passwordHashed = await bcrypt.hash('1234', 1);
  const dbUser = {
    email: 'jonsnow@gmail.com',
    password: passwordHashed,
    username: 'Jon Snow',
    role: 'admin',
  };

  const dbQuestions = [
    {
      title: 'a',
      corrects: [1],
    },
    {
      title: 'b',
      corrects: [1],
    },
  ];

  question = {
    title: 'c',
    corrects: [2],
  };

  const savedUser = await User.create(dbUser);
  sessionToken = SessionToken.generate(savedUser).token;

  const savedQuestion = await Question.insertMany(dbQuestions);
  questions = JSON.parse(JSON.stringify(savedQuestion));
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('GET /questions', () => {
  test('should get all questions', async () => {
    const agent = await request(app)
      .get('/questions')
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body).toEqual(questions);
  });

  test.todo('add should get all questions with pagination');

  test.todo('add should filter questions');

  // prettier-ignore
  test.todo('add should report error when pagination\'s parameters are not a number');

  test.todo('add should report error if logged user is not an admin');
});

describe('POST /questions', () => {
  test('should create a new question', async () => {
    const agent = await request(app)
      .post('/questions')
      .send(question)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    expect(agent.body).toMatchObject(question);
  });
});

describe('GET /questions/:id', () => {
  test('should get the question', async () => {
    const agent = await request(app)
      .get(`/questions/${questions[0]._id}`)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body).toEqual(questions[0]);
  });

  test('should report error when question does not exists', async () => {
    const agent = await request(app)
      .get('/questions/asdfghj')
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('PUT /questions', () => {
  test('should update the question', async () => {
    const agent = await request(app)
      .put(`/questions/${questions[0]._id}`)
      .send(question)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body).toMatchObject(question);
  });

  test.todo('add should update and change "_id" the question');

  test('should report error when question does not exists', async () => {
    const agent = await request(app)
      .put('/questions/asdfghj')
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('DELETE /questions', () => {
  test('should delete the question', async () => {
    const agent = await request(app)
      .delete(`/questions/${questions[0]._id}`)
      .set('Authorization', sessionToken)
      .expect(httpStatus.NO_CONTENT);
    expect(agent.body).toEqual({});
    await expect(Question.findById(questions[0]._id)).resolves.toBeNull();
  });

  test('should report error when question does not exists', async () => {
    const agent = await request(app)
      .delete('/questions/5e412c6d163c750001096478')
      .set('Authorization', sessionToken)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});
