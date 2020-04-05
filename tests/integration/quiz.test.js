const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');

const app = require('../../app');
const User = require('../../models/user.model');
const SessionToken = require('../../models/sessionToken.model');
const People = require('../../models/people.model');
const Schedule = require('../../models/schedule.model');
const Conversation = require('../../models/conversation.model');
const Question = require('../../models/question.model');
const Quiz = require('../../models/quiz.model');

mongoose.Promise = global.Promise;

let sessionToken;
let dbPeoples;
let dbSchedules;
let dbConversations;
let dbQuestions;
let dbQuizs;
let quiz;

const botId = 'asdfqwer';
const blockIds = ['zxcvbnm', 'qwertyu'];

beforeEach(async () => {
  await User.deleteMany({});
  await SessionToken.deleteMany({});
  await People.deleteMany({});
  await Schedule.deleteMany({});
  await Conversation.deleteMany({});
  await Question.deleteMany({});
  await Quiz.deleteMany({});

  const passwordHashed = await bcrypt.hash('1234', 1);
  const dbUser = {
    email: 'jonsnow@gmail.com',
    password: passwordHashed,
    username: 'Jon Snow',
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
      botId,
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
      botId,
    },
  ]);
  dbPeoples = JSON.parse(JSON.stringify(savedPeoples));

  const savedSchedules = await Schedule.create([
    {
      name: 'Day 1',
    },
    {
      name: 'Day 2',
    },
  ]);
  dbSchedules = JSON.parse(JSON.stringify(savedSchedules));

  const savedConversations = await Conversation.insertMany([
    {
      people: dbPeoples[0]._id,
      schedule: dbSchedules[0]._id,
      text: 'a',
      reply: {
        type: 'button',
        value: 'a',
      },
      botId,
      blockId: blockIds[0],
    },
    {
      people: dbPeoples[1]._id,
      schedule: dbSchedules[0]._id,
      text: 'b',
      reply: {
        type: 'button',
        value: 'b',
      },
      botId,
      blockId: blockIds[0],
    },
    {
      people: dbPeoples[0]._id,
      schedule: dbSchedules[1]._id,
      text: 'a',
      reply: {
        type: 'button',
        value: 'a',
      },
      botId,
      blockId: blockIds[1],
    },
  ]);
  dbConversations = JSON.parse(JSON.stringify(savedConversations));

  const savedQuestions = await Question.create([
    {
      title: 'a',
      correctAnswers: [1],
    },
    {
      title: 'b',
      correctAnswers: [1],
    },
  ]);
  dbQuestions = JSON.parse(JSON.stringify(savedQuestions));

  const savedQuizs = await Quiz.insertMany([
    {
      people: dbPeoples[0]._id,
      schedule: dbSchedules[0]._id,
      conversation: dbConversations[0]._id,
      botId,
      blockId: blockIds[0],
      question: dbQuestions[0]._id,
      answer: 1,
      isCorrectAnswer: true,
    },
    {
      people: dbPeoples[1]._id,
      schedule: dbSchedules[0]._id,
      conversation: dbConversations[1]._id,
      botId,
      blockId: blockIds[0],
      question: dbQuestions[0]._id,
      answer: 2,
      isCorrectAnswer: false,
    },
  ]);
  dbQuizs = JSON.parse(JSON.stringify(savedQuizs));

  quiz = {
    people: dbPeoples[0]._id,
    schedule: dbSchedules[1]._id,
    conversation: dbConversations[2]._id,
    botId,
    blockId: blockIds[1],
    question: dbQuestions[1]._id,
    answer: 1,
    isCorrectAnswer: true,
  };
});

afterAll(async () => {
  await mongoose.disconnect();
});

const format = object => {
  const getPeople = dbPeoples.find(o => o._id === object.people);
  const getSchedule = dbSchedules.find(o => o._id === object.schedule);
  const getConversation = dbConversations.find(
    o => o._id === object.conversation
  );
  return {
    ...object,
    people: getPeople,
    schedule: getSchedule,
    conversation: getConversation,
  };
};

describe('GET /quizs', () => {
  test('should get all quiz', async () => {
    const agent = await request(app)
      .get('/quizs')
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(200);
    const quizTransformed = dbQuizs.map(o => format(o));
    expect(agent.body).toEqual(quizTransformed);
  });
});

describe('POST /quizs', () => {
  test('should reate a new quiz', async () => {
    const agent = await request(app)
      .post('/quizs')
      .set('Authorization', sessionToken)
      .send(quiz)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    expect(agent.body).toMatchObject(quiz);
  });
});

describe('GET /quiz/:id', () => {
  test('should get the quiz', async () => {
    const id = dbQuizs[0]._id;

    const agent = await request(app)
      .get(`/quizs/${id}`)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);

    const quizTransformed = format(dbQuizs[0]);
    expect(agent.body._id).toBe(id);
    expect(agent.body).toEqual(quizTransformed);
  });

  test('should report error when quiz does not exists', async () => {
    const id = mongoose.Types.ObjectId();

    const agent = await request(app)
      .get(`/quizs/${id}`)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('PUT /quizs', () => {
  test('should update the quiz', async () => {
    const id = dbQuizs[0]._id;

    const agent = await request(app)
      .put(`/quizs/${id}`)
      .send(quiz)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body._id).toBe(id);
    expect(agent.body).toMatchObject(quiz);
  });

  test('should report error when quizs does not exists', async () => {
    const id = mongoose.Types.ObjectId();

    const agent = await request(app)
      .put(`/quizs/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('DELETE /quizs', () => {
  test('should delete the quiz', async () => {
    const id = dbQuizs[0]._id;

    const agent = await request(app)
      .delete(`/quizs/${id}`)
      .set('Authorization', sessionToken)
      .expect(httpStatus.NO_CONTENT);
    expect(agent.body).toEqual({});
    await expect(Quiz.findById(id)).resolves.toBeNull();
  });

  test('should report error when quizs does not exists', async () => {
    const id = mongoose.Types.ObjectId();

    const agent = await request(app)
      .delete(`/quizs/${id}`)
      .set('Authorization', sessionToken)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});