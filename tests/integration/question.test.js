const mongoose = require('mongoose');
const httpStatus = require('http-status');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../app');

const User = require('../../models/user.model');
const SessionToken = require('../../models/sessionToken.model');
const Question = require('../../models/question.model');
const Schedule = require('../../models/schedule.model');

mongoose.Promise = global.Promise;

let sessionToken;
let dbQuestions;
let dbSchedules;
let question;

beforeEach(async () => {
  await User.deleteMany({});
  await SessionToken.deleteMany({});
  await Question.deleteMany({});
  await Schedule.deleteMany({});

  const passwordHashed = await bcrypt.hash('1234', 1);
  const savedUser = await User.create({
    email: 'jonsnow@gmail.com',
    password: passwordHashed,
    username: 'Jon Snow',
    role: 'admin'
  });
  sessionToken = SessionToken.generate(savedUser).token;

  const savedSchedules = await Schedule.create([
    {
      name: 'Day 1'
    },
    {
      name: 'Day 2'
    }
  ]);
  dbSchedules = JSON.parse(JSON.stringify(savedSchedules));

  question = {
    name: 'c',
    correctAnswers: [2],
    schedule: dbSchedules[0]._id
  };

  const savedQuestion = await Question.insertMany([
    {
      name: 'a',
      correctAnswers: [1],
      schedule: dbSchedules[0]._id
    },
    {
      name: 'b',
      correctAnswers: [1],
      schedule: dbSchedules[1]._id
    }
  ]);
  dbQuestions = JSON.parse(JSON.stringify(savedQuestion));
});

afterAll(async () => {
  await mongoose.disconnect();
});

// const format = object => {
//   const getSchedule = dbSchedules.find(o => o._id === object.schedule);
//   return {
//     ...object,
//     schedule: getSchedule
//   };
// };

describe('GET /questions', () => {
  test('should get all questions', async () => {
    const agent = await request(app)
      .get('/questions')
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body.results).toEqual(dbQuestions);
  });

  test('should get count', async () => {
    const agent = await request(app)
      .get('/questions')
      .query({ count: 1, limit: 0 })
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body.results).toEqual([]);
    expect(agent.body.count).toBe(2);
  });
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

    // const questionTransformed = format(dbQuestions[0]);
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
    expect(agent.body._id).toBe(id);
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
