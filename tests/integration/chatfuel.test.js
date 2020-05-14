const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../app');
const appConfig = require('../../config');

const People = require('../../models/people.model');
const Schedule = require('../../models/schedule.model');
const Question = require('../../models/question.model');
const Reply = require('../../models/reply.model');
const Quiz = require('../../models/quiz.model');
const Progress = require('../../models/progress.model');

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
  await Quiz.deleteMany({});
  await Reply.deleteMany({});
  await Progress.deleteMany({});

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
    botId
  });

  dbPeople = JSON.parse(JSON.stringify(savedPeople));

  const savedSchedule = await Schedule.create({
    name: 'Day 1'
  });

  dbSchedule = JSON.parse(JSON.stringify(savedSchedule));

  const savedQuestion = await Question.create({
    name: 'a',
    correctAnswers: [1]
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
      childName: 'Bee',
      childBirthday: '2560',
      gender: 'male',
      pic: 'https://platform-lookaside.fbsbx.com/...',
      ref: `v2=${botId}/${blockId}/p5ykklgfgfr`
    };
  });

  test('should create a new people', async () => {
    const agent = await request(app)
      .post('/chatfuel/people')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);

    expect(agent.body.created).toBe(true);

    payload._id = payload.id;
    delete payload.id;
    delete payload.ref;

    const getPeople = await People.findById(payload._id).select(
      '-createdAt -updatedAt -__v'
    );
    const result = JSON.parse(JSON.stringify(getPeople));
    expect(result).toMatchObject(payload);
    expect(result.botId).toBe(botId);
  });

  test('should create a new people with value null', async () => {
    const payloadX = {
      id: 'qwert',
      firstName: 'null',
      lastName: 'null',
      province: 'สงขลา',
      gender: 'null',
      pic: 'null',
      ref: `v2=${botId}/${blockId}/p5ykklgfgfr`
    };

    const agent = await request(app)
      .post('/chatfuel/people')
      .query({ key: appConfig.apiPublicKey })
      .send(payloadX)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);

    expect(agent.body.created).toBe(true);

    const getPeople = await People.findById(payloadX.id);
    const result = JSON.parse(JSON.stringify(getPeople));
    expect(result._id).toBe(payloadX.id);
    expect(result.province).toBe(payloadX.province);
  });

  test('should update the people if id is exists', async () => {
    delete payload.id;

    const agent = await request(app)
      .post('/chatfuel/people')
      .query({ key: appConfig.apiPublicKey })
      .send({
        id: dbPeople._id,
        ...payload
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);

    expect(agent.body.created).toBe(true);

    delete payload.ref;

    const getPeople = await People.findById(dbPeople._id).select(
      '-createdAt -updatedAt -__v'
    );
    const result = JSON.parse(JSON.stringify(getPeople));
    expect(result).toMatchObject(payload);
  });

  test('should report error when id is not provided', async () => {
    delete payload.id;

    const agent = await request(app)
      .post('/chatfuel/people')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');

    const { field, location, message } = agent.body.errors[0];
    expect(field).toBe('id');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when ref is not provided', async () => {
    delete payload.ref;

    const agent = await request(app)
      .post('/chatfuel/people')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');

    const { field, location, message } = agent.body.errors[0];
    expect(field).toBe('ref');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when ref not match', async () => {
    payload.ref = 'asdf';

    const agent = await request(app)
      .post('/chatfuel/people')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');

    const { field, location, message } = agent.body.errors[0];
    expect(field).toBe('ref');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
  });

  test('should report error when without api key', async () => {
    payload.botId = '';

    const agent = await request(app)
      .post('/chatfuel/people')
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.FORBIDDEN);

    expect(agent.body.code).toBe(httpStatus.FORBIDDEN);
    expect(agent.body.message).toBe('Forbidden');
  });
});

describe('POST /chatfuel/reply', () => {
  let payload;
  let payloadQuiz;

  beforeEach(() => {
    payload = {
      people: dbPeople._id,
      schedule: dbSchedule._id,
      text: 'Hi',
      type: 1,
      ref: `v2=${botId}/${blockId}/p5ykklgfgfr`
    };

    payloadQuiz = {
      people: dbPeople._id,
      schedule: dbSchedule._id,
      ref: `v2=${botId}/${blockId}/p5ykklgfgfr`,
      text: 'a',
      type: 1,
      quiz: {
        question: dbQuestion._id,
        answer: 1
      }
    };
  });

  test('should create a new reply', async () => {
    const agent = await request(app)
      .post('/chatfuel/reply')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    expect(agent.body.created).toBe(true);

    delete payload.ref;

    const getReply = await Reply.findOne({
      people: payload.people
    }).select('-createdAt -updatedAt -__v');
    const result = JSON.parse(JSON.stringify(getReply));
    expect(result).toMatchObject({
      ...payload,
      botId: botId,
      blockId: blockId
    });
  });

  test('should update reply when blockid and people exists', async () => {
    const prevResult = await Reply.create({
      people: payload.people,
      schedule: payload.schedule,
      text: 'x',
      blockId,
      botId
    });

    const agent = await request(app)
      .post('/chatfuel/reply')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    expect(agent.body.created).toBe(true);

    delete payload.ref;

    const results = await Reply.find({
      people: payload.people,
      schedule: payload.schedule
    }).select('-createdAt -updatedAt -__v');
    const [result] = JSON.parse(JSON.stringify(results));

    expect(results).toHaveLength(1);
    expect(prevResult._id.toString()).toBe(result._id);
    expect(result).toMatchObject({
      ...payload,
      botId: botId,
      blockId: blockId
    });
  });

  test('should create a new reply and quiz when answer correct', async () => {
    const agent = await request(app)
      .post('/chatfuel/reply')
      .query({ key: appConfig.apiPublicKey })
      .send(payloadQuiz)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    expect(agent.body.created).toBe(true);

    delete payloadQuiz.ref;
    const { quiz, ...o } = payloadQuiz;

    const getReply = await Reply.findOne({
      people: payload.people
    }).select('-createdAt -updatedAt -__v');
    const resultReply = JSON.parse(JSON.stringify(getReply));
    expect(resultReply).toMatchObject({
      ...o,
      botId: botId,
      blockId: blockId
    });

    const getQuiz = await Quiz.findOne({ people: payload.people }).select(
      '-createdAt -updatedAt -__v'
    );
    const resultQuiz = JSON.parse(JSON.stringify(getQuiz));

    expect(resultQuiz).toMatchObject({
      ...quiz,
      isCorrectAnswer: true,
      botId: botId,
      blockId: blockId
    });
  });

  test('should create a new reply and quiz when answer wrong', async () => {
    payloadQuiz.quiz.answer = 2;

    const agent = await request(app)
      .post('/chatfuel/reply')
      .query({ key: appConfig.apiPublicKey })
      .send(payloadQuiz)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    expect(agent.body.created).toBe(true);

    delete payloadQuiz.ref;
    const { quiz, ...o } = payloadQuiz;

    const getReply = await Reply.findOne({
      people: payload.people
    }).select('-createdAt -updatedAt -__v');
    const resultReply = JSON.parse(JSON.stringify(getReply));
    expect(resultReply).toMatchObject({
      ...o,
      botId: botId,
      blockId: blockId
    });

    const getQuiz = await Quiz.findOne({
      people: payload.people
    }).select('-createdAt -updatedAt -__v');
    const resultQuiz = JSON.parse(JSON.stringify(getQuiz));
    expect(resultQuiz).toMatchObject({
      ...quiz,
      isCorrectAnswer: false,
      botId: botId,
      blockId: blockId
    });
  });

  test('should create a new progress', async () => {
    delete payload.text;
    delete payload.type;

    payload.progress = { status: 1 };

    const agent = await request(app)
      .post('/chatfuel/reply')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);

    expect(agent.body.created).toBe(true);

    const getProgress = await Progress.findOne({
      people: payload.people
    }).select('-createdAt -updatedAt -__v');
    const result = JSON.parse(JSON.stringify(getProgress));

    expect(result.people).toBe(payload.people);
    expect(result.schedule).toBe(payload.schedule);
    expect(result.status).toBe(payload.progress.status);
  });

  test('should create a new reply and update the progress when status equal complete', async () => {
    payload.progress = { status: 2 };

    const agent = await request(app)
      .post('/chatfuel/reply')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);

    expect(agent.body.created).toBe(true);

    const getProgresses = await Progress.find({
      people: payload.people
    }).select('-createdAt -updatedAt -__v');
    const [resultProgress] = getProgresses;
    expect(getProgresses).toHaveLength(1);
    expect(resultProgress.people.toString()).toBe(payload.people);
    expect(resultProgress.schedule.toString()).toBe(payload.schedule);
    expect(resultProgress.status).toBe(payload.progress.status);

    delete payload.ref;
    delete payload.progress;

    const getReply = await Reply.findOne({
      people: payload.people
    }).select('-createdAt -updatedAt -__v');
    const resultReply = JSON.parse(JSON.stringify(getReply));
    expect(resultReply).toMatchObject({
      ...payload,
      botId: botId,
      blockId: blockId
    });
  });

  test('should report error when people is not provided', async () => {
    delete payload.people;

    const agent = await request(app)
      .post('/chatfuel/reply')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');

    const { field, location, message } = agent.body.errors[0];
    expect(field).toBe('people');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when people is not exists', async () => {
    payload.people = 'asdfgh';

    const agent = await request(app)
      .post('/chatfuel/reply')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');

    const { field, location, message } = agent.body.errors[0];
    expect(field).toBe('people');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
  });

  test('should report error when schedule is not provided', async () => {
    delete payload.schedule;

    const agent = await request(app)
      .post('/chatfuel/reply')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');

    const { field, location, message } = agent.body.errors[0];
    expect(field).toBe('schedule');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when schedule is not exists', async () => {
    payload.schedule = mongoose.Types.ObjectId();

    const agent = await request(app)
      .post('/chatfuel/reply')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');

    const { field, location, message } = agent.body.errors[0];
    expect(field).toBe('schedule');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
  });

  test('should report error when ref is not provided', async () => {
    delete payload.ref;

    const agent = await request(app)
      .post('/chatfuel/reply')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');

    const { field, location, message } = agent.body.errors[0];
    expect(field).toBe('ref');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when ref is not macth', async () => {
    payload.ref = 'asdfg/asdf/asdf';

    const agent = await request(app)
      .post('/chatfuel/reply')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');

    const { field, location, message } = agent.body.errors[0];
    expect(field).toBe('ref');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
  });

  test.each([
    ['less then 1', '0'],
    ['more then 4', '5'],
    ['is equal to text', 'avasdf']
  ])('should report error when type %s', async (s, v) => {
    payload.type = v;

    const agent = await request(app)
      .post('/chatfuel/reply')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');

    const { field, location, message } = agent.body.errors[0];
    expect(field).toBe('type');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
  });

  test.each([
    ['is equal to empty', ''],
    ['is equal to text', 'avasdf'],
    ['less then 1', '0'],
    ['more then 2', '3']
  ])('should report error when progress status %s', async (s, v) => {
    payload.progress = { status: v };

    const agent = await request(app)
      .post('/chatfuel/reply')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');

    const { field, location, message } = agent.body.errors[0];
    expect(field).toBe('progress.status');
    expect(location).toBe('body');
    expect(message).toBe(v ? 'Invalid value' : 'Is required');
  });

  test.each([
    ['is equal to empty', ''],
    ['not match mongo id', 'asdf'],
    ['is not exists', mongoose.Types.ObjectId().toS]
  ])('should report error when quiz question %s', async (s, v) => {
    payload.quiz = { question: v, answer: 1 };

    const agent = await request(app)
      .post('/chatfuel/reply')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');

    const { field, location, message } = agent.body.errors[0];
    expect(field).toBe('quiz.question');
    expect(location).toBe('body');
    expect(message).toBe(v ? 'Invalid value' : 'Is required');
  });

  test.each([
    ['is equal to empty', ''],
    ['is equal to text', 'asdf']
  ])('should report error when quiz answer %s', async (s, v) => {
    payload.quiz = { question: dbQuestion._id, answer: v };

    const agent = await request(app)
      .post('/chatfuel/reply')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');

    const { field, location, message } = agent.body.errors[0];
    expect(field).toBe('quiz.answer');
    expect(location).toBe('body');
    expect(message).toBe(v ? 'Invalid value' : 'Is required');
  });
});
