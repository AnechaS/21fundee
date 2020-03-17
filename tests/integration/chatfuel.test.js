const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../app');

const People = require('../../models/people.model');
const Schedule = require('../../models/schedule.model');
const Question = require('../../models/question.model');
const Conversation = require('../../models/conversation.model');
const Quiz = require('../../models/quiz.model');

const { IP_CHATFUEL } = require('../../utils/constants');

mongoose.Promise = global.Promise;

let dbPeople;
let dbSchedule;
let dbQuestion;
let botId = 'asdfqwer';
let blockId = 'zxcvbnm';

beforeEach(async () => {
  await People.deleteMany({});
  await Schedule.deleteMany({});
  await Question.deleteMany({});

  const savedPeople = await People.create({
    _id: 'zxcvb',
    firstName: 'Sara',
    lastName: 'De',
    province: 'สงขลา',
    district: 'เทพา',
    dentalId: 'x',
    childName: 'Ant',
    childBirthday: '2560',
    gender: 'male',
    botId,
    blockId,
  });

  dbPeople = JSON.parse(JSON.stringify(savedPeople));

  const savedSchedule = await Schedule.create({
    name: 'Day 1',
  });

  dbSchedule = JSON.parse(JSON.stringify(savedSchedule));

  const savedQuestion = await Question.create({
    title: 'a',
    correctAnswers: [1],
  });

  dbQuestion = JSON.parse(JSON.stringify(savedQuestion));
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /chatfuel/people', () => {
  let payload;

  beforeEach(() => {
    payload = {
      id: 'abcde',
      firstName: 'Makus',
      lastName: 'Yui',
      province: 'สงขลา',
      district: 'เทพา',
      dentalId: 'x',
      childName: 'Bee',
      childBirthday: '2560',
      gender: 'male',
      botId,
    };
  });

  test('should create a new people', async () => {
    const agent = await request(app)
      .post('/chatfuel/people')
      .set('x-real-ip', IP_CHATFUEL)
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);

    payload._id = payload.id;
    delete payload.id;

    expect(agent.body).toMatchObject(payload);
  });

  test('should create a new people with value null', async () => {
    const payloadX = {
      id: 'qwert',
      firstName: 'null',
      lastName: 'null',
      province: 'สงขลา',
      gender: 'null',
      profilePicUrl: 'null',
      locale: undefined,
      source: null,
      botId,
    };

    const agent = await request(app)
      .post('/chatfuel/people')
      .set('x-real-ip', IP_CHATFUEL)
      .send(payloadX)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    expect(agent.body._id).toBe(payloadX.id);
    expect(agent.body.province).toBe(payloadX.province);
    expect(agent.body.firstName).toBeUndefined();
    expect(agent.body.lastName).toBeUndefined();
    expect(agent.body.gender).toBeUndefined();
    expect(agent.body.locale).toBeUndefined();
    expect(agent.body.source).toBeUndefined();
  });

  test('should update the people if id is exists', async () => {
    delete payload.id;

    const agent = await request(app)
      .post('/chatfuel/people')
      .set('x-real-ip', IP_CHATFUEL)
      .send({
        id: dbPeople._id,
        ...payload,
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    expect(agent.body._id).toBe(dbPeople._id);
    expect(agent.body).toMatchObject(payload);
  });

  test('should report error when id is not provided', async () => {
    delete payload.id;

    const agent = await request(app)
      .post('/chatfuel/people')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    const { field, location, message } = agent.body.errors[0];

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
    expect(field).toBe('id');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when botId is not provided', async () => {
    delete payload.botId;

    const agent = await request(app)
      .post('/chatfuel/people')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    const { field, location, message } = agent.body.errors[0];

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
    expect(field).toBe('botId');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when botId is empty', async () => {
    payload.botId = '';

    const agent = await request(app)
      .post('/chatfuel/people')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    const { field, location, message } = agent.body.errors[0];

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
    expect(field).toBe('botId');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });
});

describe('POST /chatfuel/replies', () => {
  let payload;
  let payloadQuiz;

  beforeEach(() => {
    payload = {
      people: dbPeople._id.toString(),
      schedule: dbSchedule._id.toString(),
      botId,
      blockId,
      conversation: {
        text: 'Hi',
      },
    };

    payloadQuiz = {
      people: dbPeople._id,
      schedule: dbSchedule._id,
      botId,
      blockId,
      conversation: {
        text: 'a',
        reply: {
          type: 'button',
          value: 'a',
        },
      },
      quiz: {
        question: dbQuestion._id,
        answer: 1,
      },
    };
  });

  test('should create a new conversation', async () => {
    const agent = await request(app)
      .post('/chatfuel/replies')
      .set('x-real-ip', IP_CHATFUEL)
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    expect(agent.body.result).toBe(true);

    const { conversation, ...o } = payload;

    const getConversation = await Conversation.findOne(o);
    expect(JSON.parse(JSON.stringify(getConversation))).toMatchObject({
      ...o,
      ...conversation,
    });
  });

  test('should create a new conversation and quiz when answer correct', async () => {
    const agent = await request(app)
      .post('/chatfuel/replies')
      .set('x-real-ip', IP_CHATFUEL)
      .send(payloadQuiz)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    expect(agent.body.result).toBe(true);

    const { conversation, quiz, ...o } = payloadQuiz;

    const getConversation = await Conversation.findOne(o);
    expect(JSON.parse(JSON.stringify(getConversation))).toMatchObject({
      ...o,
      ...conversation,
    });

    const getQuiz = await Quiz.findOne(o);
    expect(JSON.parse(JSON.stringify(getQuiz))).toMatchObject({
      conversation: getConversation._id.toString(),
      ...o,
      ...quiz,
      isCorrectAnswer: true,
    });
  });

  test('should create a new conversation and quiz when answer wrong', async () => {
    payloadQuiz.quiz.answer = 2;

    const agent = await request(app)
      .post('/chatfuel/replies')
      .set('x-real-ip', IP_CHATFUEL)
      .send(payloadQuiz)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    expect(agent.body.result).toBe(true);

    const { conversation, quiz, ...o } = payloadQuiz;

    const getConversation = await Conversation.findOne(o);
    expect(JSON.parse(JSON.stringify(getConversation))).toMatchObject({
      ...o,
      ...conversation,
    });

    const getQuiz = await Quiz.findOne(o);
    expect(JSON.parse(JSON.stringify(getQuiz))).toMatchObject({
      conversation: getConversation._id.toString(),
      ...o,
      ...quiz,
      isCorrectAnswer: false,
    });
  });

  test('should report error when conversation is not provided', async () => {
    delete payload.conversation;

    const agent = await request(app)
      .post('/chatfuel/replies')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    const { field, location, message } = agent.body.errors[0];
    expect(field).toBe('conversation');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
  });

  test.each([
    ['String', 'asdfgh'],
    ['Number', 1],
    ['Array', []],
  ])('should report error when conversation is %s', async (type, value) => {
    payload.conversation = value;

    const agent = await request(app)
      .post('/chatfuel/replies')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    const { field, location, message } = agent.body.errors[0];

    expect(field).toBe('conversation');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
  });

  test('should report error when people is not provided', async () => {
    delete payload.people;

    const agent = await request(app)
      .post('/chatfuel/replies')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    const { field, location, message } = agent.body.errors[0];

    expect(field).toBe('people');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
  });

  test('should report error when people is empty', async () => {
    payload.people = '';

    const agent = await request(app)
      .post('/chatfuel/replies')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    const { field, location, message } = agent.body.errors[0];

    expect(field).toBe('people');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
  });

  test('should report error when people is not exists', async () => {
    payload.people = 'asdfgh';

    const agent = await request(app)
      .post('/chatfuel/replies')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    const { field, location, message } = agent.body.errors[0];

    expect(field).toBe('people');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
  });

  test('should report error when schedule is not provided', async () => {
    delete payload.schedule;

    const agent = await request(app)
      .post('/chatfuel/replies')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    const { field, location, message } = agent.body.errors[0];

    expect(field).toBe('schedule');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
  });

  test('should report error when schedule is empty', async () => {
    payload.schedule = '';

    const agent = await request(app)
      .post('/chatfuel/replies')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    const { field, location, message } = agent.body.errors[0];

    expect(field).toBe('schedule');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
  });

  test('should report error when schedule is not mongo id', async () => {
    payload.schedule = 'asdfg';

    const agent = await request(app)
      .post('/chatfuel/replies')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    const { field, location, message } = agent.body.errors[0];

    expect(field).toBe('schedule');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
  });

  test('should report error when schedule is not exists', async () => {
    payload.schedule = mongoose.Types.ObjectId();

    const agent = await request(app)
      .post('/chatfuel/replies')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    const { field, location, message } = agent.body.errors[0];

    expect(field).toBe('schedule');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
  });

  test('should report error when botId is not provided', async () => {
    delete payload.botId;

    const agent = await request(app)
      .post('/chatfuel/replies')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    const { field, location, message } = agent.body.errors[0];

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
    expect(field).toBe('botId');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when botId is empty', async () => {
    payload.botId = '';

    const agent = await request(app)
      .post('/chatfuel/replies')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    const { field, location, message } = agent.body.errors[0];

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
    expect(field).toBe('botId');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when blockId is not provided', async () => {
    delete payload.blockId;

    const agent = await request(app)
      .post('/chatfuel/replies')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    const { field, location, message } = agent.body.errors[0];

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
    expect(field).toBe('blockId');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when blockId is empty', async () => {
    payload.blockId = '';

    const agent = await request(app)
      .post('/chatfuel/replies')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    const { field, location, message } = agent.body.errors[0];

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
    expect(field).toBe('blockId');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  //   test('should create a new quiz of the message when correct answer', async () => {
  //     const payload = {
  //       people: people._id,
  //       schedule: schedule._id,
  //       text: 'answer the quiz',
  //       botId: 'a',
  //       blockId: 'aa',
  //       quiz: {
  //         question: question._id,
  //         answer: question.corrects[0]
  //       }
  //     };
  //     const agent = await request(app)
  //       .post('/chatfuel/message')
  //       .send(payload)
  //       .set('x-real-ip', IP_CHATFUEL)
  //       .set('Accept', 'application/json')
  //       .expect('Content-Type', /json/)
  //       .expect(httpStatus.CREATED);
  //     expect(agent.body).toMatchObject({
  //       _id: expect.anything(),
  //       quiz: {
  //         question: payload.quiz.question,
  //         answer: payload.quiz.answer,
  //         isCorrect: true
  //       },
  //       people: people._id,
  //       schedule: schedule._id,
  //       text: payload.text,
  //       botId: payload.botId,
  //       blockId: payload.blockId,
  //     });
  //   });
  //   test('should report error when quiz empty', async () => {
  //     const agent = await request(app)
  //       .post('/chatfuel/message')
  //       .send({
  //         people: people._id,
  //         schedule: schedule._id,
  //         text: 'Hello World',
  //         botId: 'a',
  //         blockId: 'aa',
  //         quiz: {}
  //       })
  //       .set('x-real-ip', IP_CHATFUEL)
  //       .set('Accept', 'application/json')
  //       .expect('Content-Type', /json/)
  //       .expect(httpStatus.BAD_REQUEST);
  //     expect(agent.body.code).toBe(400);
  //     expect(agent.body.message).toBe('Validation Error');
  //     expect(agent.body.errors).toEqual([
  //       {
  //         field: 'quiz.answer',
  //         location: 'body',
  //         message: 'Invalid value'
  //       },
  //       {
  //         field: 'quiz.question',
  //         location: 'body',
  //         message: 'Invalid value'
  //       }
  //     ]);
  //   });
  //   test('should report error when quiz.question is not provided', async () => {
  //     const agent = await request(app)
  //       .post('/chatfuel/message')
  //       .send({
  //         people: people._id,
  //         schedule: schedule._id,
  //         text: 'Hello World',
  //         botId: 'a',
  //         blockId: 'aa',
  //         quiz: {
  //           answer: 1
  //         }
  //       })
  //       .set('x-real-ip', IP_CHATFUEL)
  //       .set('Accept', 'application/json')
  //       .expect('Content-Type', /json/)
  //       .expect(httpStatus.BAD_REQUEST);
  //     expect(agent.body.code).toBe(400);
  //     expect(agent.body.message).toBe('Validation Error');
  //     const { field } = agent.body.errors[0];
  //     const { location } = agent.body.errors[0];
  //     const { message } = agent.body.errors[0];
  //     expect(field).toBe('quiz.question');
  //     expect(location).toBe('body');
  //     expect(message).toBe('Invalid value');
  //   });
  //   test('should report error when quiz.question is mongo id', async () => {
  //     const agent = await request(app)
  //       .post('/chatfuel/message')
  //       .send({
  //         people: people._id,
  //         schedule: schedule._id,
  //         text: 'Hello World',
  //         botId: 'a',
  //         blockId: 'aa',
  //         quiz: {
  //           question: 'asdf',
  //           answer: 0
  //         }
  //       })
  //       .set('x-real-ip', IP_CHATFUEL)
  //       .set('Accept', 'application/json')
  //       .expect('Content-Type', /json/)
  //       .expect(httpStatus.BAD_REQUEST);
  //     expect(agent.body.code).toBe(400);
  //     expect(agent.body.message).toBe('Validation Error');
  //     const { field } = agent.body.errors[0];
  //     const { location } = agent.body.errors[0];
  //     const { message } = agent.body.errors[0];
  //     expect(field).toBe('quiz.question');
  //     expect(location).toBe('body');
  //     expect(message).toBe('Invalid value');
  //   });
  //   test('should report error when quiz.question is not exists', async () => {
  //     const agent = await request(app)
  //       .post('/chatfuel/message')
  //       .send({
  //         people: people._id,
  //         schedule: schedule._id,
  //         text: 'Hello World',
  //         botId: 'a',
  //         blockId: 'aa',
  //         quiz: {
  //           question: '5e734c65563c75372cb96547',
  //           answer: 0
  //         }
  //       })
  //       .set('x-real-ip', IP_CHATFUEL)
  //       .set('Accept', 'application/json')
  //       .expect('Content-Type', /json/)
  //       .expect(httpStatus.BAD_REQUEST);
  //     expect(agent.body.code).toBe(400);
  //     expect(agent.body.message).toBe('Validation Error');
  //     const { field } = agent.body.errors[0];
  //     const { location } = agent.body.errors[0];
  //     const { message } = agent.body.errors[0];
  //     expect(field).toBe('quiz.question');
  //     expect(location).toBe('body');
  //     expect(message).toBe('Invalid value');
  //   });
  //   test('should report error when quiz.answer is not provided', async () => {
  //     const agent = await request(app)
  //       .post('/chatfuel/message')
  //       .send({
  //         people: people._id,
  //         schedule: schedule._id,
  //         text: 'Hello World',
  //         botId: 'a',
  //         blockId: 'aa',
  //         quiz: {
  //           question: 'a'
  //         }
  //       })
  //       .set('x-real-ip', IP_CHATFUEL)
  //       .set('Accept', 'application/json')
  //       .expect('Content-Type', /json/)
  //       .expect(httpStatus.BAD_REQUEST);
  //     expect(agent.body.code).toBe(400);
  //     expect(agent.body.message).toBe('Validation Error');
  //     const { field } = agent.body.errors[0];
  //     const { location } = agent.body.errors[0];
  //     const { message } = agent.body.errors[0];
  //     expect(field).toBe('quiz.answer');
  //     expect(location).toBe('body');
  //     expect(message).toBe('Invalid value');
  //   });
});
