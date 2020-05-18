const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');

const app = require('../../app');
const User = require('../../models/user.model');
const SessionToken = require('../../models/sessionToken.model');
const People = require('../../models/people.model');
const Schedule = require('../../models/schedule.model');
const Question = require('../../models/question.model');
const Comment = require('../../models/comment.model');

mongoose.Promise = global.Promise;

let sessionToken;
let dbPeoples;
let dbSchedules;
let dbQuestions;
let dbComments;
let comment;

const botId = 'asdfqwer';

beforeEach(async () => {
  await User.deleteMany({});
  await SessionToken.deleteMany({});
  await People.deleteMany({});
  await Schedule.deleteMany({});
  await Comment.deleteMany({});

  const passwordHashed = await bcrypt.hash('1234', 1);
  const dbUser = {
    email: 'jonsnow@gmail.com',
    password: passwordHashed,
    username: 'Jon Snow'
  };

  const savedUser = await User.create(dbUser);
  sessionToken = SessionToken.generate(savedUser).token;

  const savedPeoples = await People.create([
    {
      firstName: 'Sara',
      lastName: 'De',
      province: 'สงขลา',
      district: 'เทพา',
      dentalId: 'x',
      childName: 'Ant',
      childBirthday: '2560',
      gender: 'male',
      botId
    },
    {
      firstName: 'Makus',
      lastName: 'Yui',
      province: 'สงขลา',
      district: 'เทพา',
      dentalId: 'x',
      childName: 'Bee',
      childBirthday: '2560',
      gender: 'male',
      botId
    }
  ]);
  dbPeoples = JSON.parse(JSON.stringify(savedPeoples));

  const savedSchedules = await Schedule.create([
    {
      name: 'Day 1'
    },
    {
      name: 'Day 2'
    }
  ]);
  dbSchedules = JSON.parse(JSON.stringify(savedSchedules));

  const savedQuestion = await Question.create([
    {
      name: 'a',
      schedule: dbSchedules[0]._id,
      type: 3
    },
    {
      name: 'b',
      schedule: dbSchedules[0]._id,
      type: 3
    }
  ]);

  dbQuestions = JSON.parse(JSON.stringify(savedQuestion));

  const savedComments = await Comment.insertMany([
    {
      people: dbPeoples[0]._id,
      question: dbQuestions[0]._id,
      answer: 'good'
    }
  ]);
  dbComments = JSON.parse(JSON.stringify(savedComments));

  comment = {
    people: dbPeoples[0]._id,
    question: dbQuestions[1]._id,
    answer: 'good'
  };
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('GET /comments', () => {
  test('should get all comment', async () => {
    const agent = await request(app)
      .get('/comments')
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(200);
    expect(agent.body).toEqual(dbComments);
  });
});

describe('POST /comments', () => {
  test('should create a new comment', async () => {
    const agent = await request(app)
      .post('/comments')
      .set('Authorization', sessionToken)
      .send(comment)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    expect(agent.body).toMatchObject(comment);
  });
});

describe('GET /comments/:id', () => {
  test('should get the comment', async () => {
    const id = dbComments[0]._id;

    const agent = await request(app)
      .get(`/comments/${id}`)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);

    expect(agent.body).toEqual(dbComments[0]);
  });

  test('should report error when comments does not exists', async () => {
    const id = mongoose.Types.ObjectId();

    const agent = await request(app)
      .get(`/comments/${id}`)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('PUT /comments', () => {
  test('should update the comment', async () => {
    const id = dbComments[0]._id;

    const agent = await request(app)
      .put(`/comments/${id}`)
      .send(comment)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body._id).toBe(id);
    expect(agent.body).toMatchObject(comment);
  });

  test('should report error when comments does not exists', async () => {
    const id = mongoose.Types.ObjectId();

    const agent = await request(app)
      .put(`/comments/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('DELETE /comments', () => {
  test('should delete the comment', async () => {
    const id = dbComments[0]._id;

    const agent = await request(app)
      .delete(`/comments/${id}`)
      .set('Authorization', sessionToken)
      .expect(httpStatus.NO_CONTENT);
    expect(agent.body).toEqual({});
    await expect(Comment.findById(id)).resolves.toBeNull();
  });

  test('should report error when comments does not exists', async () => {
    const id = mongoose.Types.ObjectId();

    const agent = await request(app)
      .delete(`/comments/${id}`)
      .set('Authorization', sessionToken)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});
