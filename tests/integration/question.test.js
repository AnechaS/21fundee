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
let dbQuestions;
let question;

beforeEach(async () => {
  await User.deleteMany({});
  await SessionToken.deleteMany({});
  await Question.deleteMany({});

  const passwordHashed = await bcrypt.hash('1234', 1);
  const savedUser = await User.create({
    email: 'jonsnow@gmail.com',
    password: passwordHashed,
    username: 'Jon Snow',
    role: 'admin',
  });
  sessionToken = SessionToken.generate(savedUser).token;

  question = {
    title: 'c',
    correctAnswers: [2],
  };

  const savedQuestion = await Question.insertMany([
    {
      title: 'a',
      correctAnswers: [1],
    },
    {
      title: 'b',
      correctAnswers: [1],
    },
  ]);
  dbQuestions = JSON.parse(JSON.stringify(savedQuestion));
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
    expect(agent.body).toEqual(dbQuestions);
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
    const id = dbQuestions[0]._id;

    const agent = await request(app)
      .get(`/questions/${id}`)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body).toEqual(dbQuestions[0]);
  });

  test('should report error when question does not exists', async () => {
    const id = mongoose.Types.ObjectId();

    const agent = await request(app)
      .get(`/questions/${id}`)
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
    const id = dbQuestions[0]._id;

    const agent = await request(app)
      .put(`/questions/${id}`)
      .send(question)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body).toMatchObject(question);
  });

  test.todo('add should update and change "_id" the question');

  test('should report error when question does not exists', async () => {
    const id = mongoose.Types.ObjectId();

    const agent = await request(app)
      .put(`/questions/${id}`)
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
    const id = dbQuestions[0]._id;

    const agent = await request(app)
      .delete(`/questions/${id}`)
      .set('Authorization', sessionToken)
      .expect(httpStatus.NO_CONTENT);
    expect(agent.body).toEqual({});
    await expect(Question.findById(dbQuestions[0]._id)).resolves.toBeNull();
  });

  test('should report error when question does not exists', async () => {
    const id = mongoose.Types.ObjectId();

    const agent = await request(app)
      .delete(`/questions/${id}`)
      .set('Authorization', sessionToken)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});
