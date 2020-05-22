const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../app');
const appConfig = require('../../config');
const { REPLY_SUBMITTED_TYPES } = require('../../utils/constants');

const People = require('../../models/people.model');
const Schedule = require('../../models/schedule.model');
const Question = require('../../models/question.model');
const Reply = require('../../models/reply.model');
const Progress = require('../../models/progress.model');
const Comment = require('../../models/comment.model');
const Quiz = require('../../models/quiz.model');

mongoose.Promise = global.Promise;

let dbPeople;
let dbSchedule;
let dbQuestions;
let botId = '5eb92fd7f58c2808c98e385b';
let blockId = '5eb92fd7f58c2808c98e419b';

beforeEach(async () => {
  await People.deleteMany({});
  await Schedule.deleteMany({});
  await Question.deleteMany({});
  await Reply.deleteMany({});
  await Quiz.deleteMany({});
  await Progress.deleteMany({});
  await Comment.deleteMany({});

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

  const savedQuestion = await Question.create([
    {
      name: 'a',
      correctAnswers: [1],
      schedule: dbSchedule._id,
      type: 1
    },
    {
      name: 'b',
      schedule: dbSchedule._id,
      type: 3
    }
  ]);

  dbQuestions = JSON.parse(JSON.stringify(savedQuestion));
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
      botId
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
      botId
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

  test('should report error when botId is not provided', async () => {
    delete payload.botId;

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
    expect(field).toBe('botId');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when botId not match', async () => {
    payload.botId = 'abcdef';

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
    expect(field).toBe('botId');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
  });

  test('should report error when without api key', async () => {
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
      submittedType: REPLY_SUBMITTED_TYPES[0],
      botId,
      blockId
    };

    payloadQuiz = {
      people: dbPeople._id,
      schedule: dbSchedule._id,
      botId,
      blockId,
      text: 'a',
      submittedType: REPLY_SUBMITTED_TYPES[0],
      quiz: {
        question: dbQuestions[0]._id,
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

    const object = await Reply.findOne({
      people: payload.people
    }).select('-createdAt -updatedAt -__v');
    const result = JSON.parse(JSON.stringify(object));
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

    const object = await Reply.find({
      people: payload.people,
      schedule: payload.schedule
    }).select('-createdAt -updatedAt -__v');
    const [result] = JSON.parse(JSON.stringify(object));

    expect(object).toHaveLength(1);
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
      isCorrect: true
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
      isCorrect: false
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
    payload.schedule = 'asdfgh';

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

  test('should report error when botId is not provided', async () => {
    delete payload.botId;

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
    expect(field).toBe('botId');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when botId not match', async () => {
    payload.botId = 'asdfg';

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
    expect(field).toBe('botId');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
  });

  test('should report error when blockId is not provided', async () => {
    delete payload.blockId;

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
    expect(field).toBe('blockId');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when blockId not match', async () => {
    payload.blockId = 'asdfgh';

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
    expect(field).toBe('blockId');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
  });

  test('should report error when submittedType not match', async () => {
    payload.submittedType = 'avasdf';

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
    expect(field).toBe('submittedType');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
  });

  test.each([
    ['is equal to empty', ''],
    ['not match mongo id', 'asdf'],
    ['is not exists', mongoose.Types.ObjectId().toString()]
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
    payload.quiz = { question: dbQuestions[0]._id, answer: v };

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

  test.each([
    ['is equal to empty', ''],
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
});

describe('POST /chatfuel/comment', () => {
  let payload;

  beforeEach(() => {
    payload = {
      people: dbPeople._id,
      question: dbQuestions[1]._id,
      answer: 'good'
    };
  });

  test('should create a new comment', async () => {
    const agent = await request(app)
      .post('/chatfuel/comment')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);

    expect(agent.body).toEqual({ created: true });

    let result = await Comment.findOne({
      people: payload.people
    }).select('-createdAt -updatedAt -__v');
    result = JSON.parse(JSON.stringify(result));
    expect(result.people).toBe(payload.people);
    expect(result.question).toBe(payload.question);
    expect(result.answer).toBe(payload.answer);
  });

  test('should update comment when exist people and question', async () => {
    const oldResult = await Comment.create(payload);

    payload.answer = 'bad';

    const agent = await request(app)
      .post('/chatfuel/comment')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);

    expect(agent.body).toEqual({ created: true });

    const results = await Comment.find({
      people: payload.people
    }).select('-createdAt -updatedAt -__v');
    const result = JSON.parse(JSON.stringify(results[0]));
    expect(results).toHaveLength(1);
    expect(result._id).toBe(oldResult._id.toString());
    expect(result.people).toBe(payload.people);
    expect(result.question).toBe(payload.question);
    expect(result.answer).toBe(payload.answer);
  });
});

describe('POST /chatfuel/cetificate', () => {
  /* let payload;

  beforeEach(() => {
    payload = {
      imageUrl:
        'https://scontent.xx.fbcdn.net/v/t1.15752-9/98484477_597577834194633_4758591208668790784_n.jpg?_nc_cat=104%26_nc_sid=b96e70%26_nc_ohc=vP3MX4PE2SAAX_aCKD1%26_nc_ad=z-m%26_nc_cid=0%26_nc_zor=9%26_nc_ht=scontent.xx%26oh=0f57a271d36aa654d1248bbe6f59dc28%26oe=5EED3815'
    };
  }); */

  test('should return currect', async () => {
    /* const agent = await request(app)
      .post('/chatfuel/comment')
      .query({ key: appConfig.apiPublicKey })
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/); */
  });
});
