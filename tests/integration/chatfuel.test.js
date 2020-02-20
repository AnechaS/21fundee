const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');

const app = require('../../app');
const People = require('../../models/people');
const Schedule = require('../../models/schedule');
const Question = require('../../models/question');

const { IP_CHATFUEL } = require('../../utils/constants');

mongoose.Promise = global.Promise;

const people = {
  _id: '1601b96497',
  firstName: 'Bran',
  lastName: 'Stark',
  province: 'สงขลา',
};

const schedule = { 
  _id: '5e734c6d163c753701b96547',
  name: 'Day 2' 
};

const question = { 
  _id: '5e734c6d163c753725b96547',
  title: 'คุณคิดว่าฟันน้ำนมสำคัญยังไงเอ่ย?',
  correct: 5
};

beforeAll(async () => {
  await People.create(people);
  await Schedule.create(schedule);
  await Question.create(question);
});
  
afterAll(async () => {
  await People.deleteOne({ _id: people._id });
  await Schedule.deleteOne({ _id: schedule._id });
  await Question.deleteOne({ _id: question._id });

  await mongoose.disconnect();
});

describe('POST /chatfuel/people', () => {
  let payload = {
    uid: 'abcde',
    firstName: 'Jon',
    lastName: 'Snow',
    province: 'สงขลา',
    district: 'เทพา',
    dentalId: 'x',
    childName: 'bee',
    childBirthday: '2560',
    gender: 'male',
    botId: 'a',
    blockId: 'aa',
  };

  test('should create a new people', async () => {
    const agent = await request(app)
      .post('/chatfuel/people')
      .set('x-real-ip', IP_CHATFUEL)
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    
    expect(agent.body).toMatchObject({
      _id: payload.uid,
      firstName: payload.firstName,
      lastName: payload.lastName,
      province: payload.province,
      district: payload.district,
      dentalId: payload.dentalId,
      childName: payload.childName,
      childBirthday: payload.childBirthday,
      gender: payload.gender,
      botId: payload.botId,
      blockId: payload.blockId,
    });
  });

  test('should create a new people with value null', async () => {
    const agent = await request(app)
      .post('/chatfuel/people')
      .set('x-real-ip', IP_CHATFUEL)
      .send({
        uid: 'gggg',
        firstName: 'null',
        lastName: 'null',
        province: 'สงขลา',
        gender: 'null',
        profilePicUrl: 'null',
        locale: 'null',
        source: 'null' 
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
      
    expect(agent.body).toMatchObject({
      _id: 'gggg',
      province: 'สงขลา',
    });

    await People.deleteOne({ _id: agent.body._id });
  });

  test('should update people if "_id" is exists', async () => {
    payload = {
      ...payload,
      firstName: 'b',
      lastName: 'a',
      province: 'ยะลา',
      district: 'เมือง'
    };

    const agent = await request(app)
      .post('/chatfuel/people')
      .set('x-real-ip', IP_CHATFUEL)
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    
    expect(agent.body).toMatchObject({
      _id: payload.uid,
      firstName: payload.firstName,
      lastName: payload.lastName,
      province: payload.province,
      district: payload.district,
    });
  });
  
  test('should report error when uid is not provided', async () => {
    const agent = await request(app)
      .post('/chatfuel/people')
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);
      
    const { field } = agent.body.errors[0];
    const { location } = agent.body.errors[0];
    const { message } = agent.body.errors[0];
    expect(field).toBe('uid');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });
});

describe('POST /chatfuel/message', () => {
  test('should create a new message', async () => {
    const agent = await request(app)
      .post('/chatfuel/message')
      .set('x-real-ip', IP_CHATFUEL)
      .send({
        people: people._id,
        schedule: schedule._id,
        text: 'Hello World',
        botId: 'a',
        blockId: 'aa',
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
      
    expect(agent.body).toMatchObject({
      _id: expect.anything(),
      people: people._id,
      schedule: schedule._id,
      text: 'Hello World'
    });
  });

  test('should report error when people is not provided', async () => {
    const agent = await request(app)
      .post('/chatfuel/message')
      .send({
        schedule: schedule._id,
        text: 'Hello World',
        botId: 'a',
        blockId: 'aa',
      })
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);
      
    const { field } = agent.body.errors[0];
    const { location } = agent.body.errors[0];
    const { message } = agent.body.errors[0];
    expect(field).toBe('people');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when people is not exists', async () => {
    const agent = await request(app)
      .post('/chatfuel/message')
      .send({ 
        people: 'asdf',
        schedule: schedule._id,
        text: 'Hello World',
        botId: 'a',
        blockId: 'aa',
      })
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);
      
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('People not found.');
  });

  test.todo('create quiz');

  test('should report error when quiz empty', async () => {
    const agent = await request(app)
      .post('/chatfuel/message')
      .send({
        people: people._id,
        schedule: schedule._id,
        text: 'Hello World',
        botId: 'a',
        blockId: 'aa',
        quiz: {}
      })
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);
      
    expect(agent.body.errors).toEqual([ 
      { 
        field: 'quiz.question',
        location: 'body',
        message: 'Invalid value' 
      },
      { 
        field: 'quiz.answer',
        location: 'body',
        message: 'Invalid value' 
      } 
    ]);
  });

  test('should report error when quiz not key "question"', async () => {
    const agent = await request(app)
      .post('/chatfuel/message')
      .send({
        people: people._id,
        schedule: schedule._id,
        text: 'Hello World',
        botId: 'a',
        blockId: 'aa',
        quiz: {
          answer: 'abc'
        }
      })
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);
      
    const { field } = agent.body.errors[0];
    const { location } = agent.body.errors[0];
    const { message } = agent.body.errors[0];
    expect(field).toBe('quiz.question');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
  });

  test('should report error when quiz.question is not provided', async () => {
    const agent = await request(app)
      .post('/chatfuel/message')
      .send({
        people: people._id,
        schedule: schedule._id,
        text: 'Hello World',
        botId: 'a',
        blockId: 'aa',
        quiz: {
          answer: 1
        }
      })
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);
      
    const { field } = agent.body.errors[0];
    const { location } = agent.body.errors[0];
    const { message } = agent.body.errors[0];
    expect(field).toBe('quiz.question');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
  });

  test('should report error when quiz.question is object id', async () => {
    const agent = await request(app)
      .post('/chatfuel/message')
      .send({ 
        people: people._id,
        schedule: schedule._id,
        text: 'Hello World',
        botId: 'a',
        blockId: 'aa',
        quiz: {
          question: 'asdf',
          answer: 0
        }
      })
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.INTERNAL_SERVER_ERROR);
    
    expect(agent.body.code).toBe(500);
    expect(agent.body.message).toEqual(expect.stringContaining('Cast to ObjectId failed'));
  });

  test('should report error when quiz.question is not exists', async () => {
    const agent = await request(app)
      .post('/chatfuel/message')
      .send({ 
        people: people._id,
        schedule: schedule._id,
        text: 'Hello World',
        botId: 'a',
        blockId: 'aa',
        quiz: {
          question: '5e734c65563c75372cb96547',
          answer: 0
        }
      })
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);
      
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Question not found.');
  });

  test('should report error when quiz.answer is not provided', async () => {
    const agent = await request(app)
      .post('/chatfuel/message')
      .send({
        people: people._id,
        schedule: schedule._id,
        text: 'Hello World',
        botId: 'a',
        blockId: 'aa',
        quiz: {
          question: 'a'
        }
      })
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);
      
    const { field } = agent.body.errors[0];
    const { location } = agent.body.errors[0];
    const { message } = agent.body.errors[0];
    expect(field).toBe('quiz.answer');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
  });
});

describe('POST /chatfuel/quiz', () => {
  test('should create a new quiz', async () => {
    const payload = {
      people: people._id,
      question: question._id,
      answer: 0,
      botId: 'a',
      blockId: 'aa',
    };

    const agent = await request(app)
      .post('/chatfuel/quiz')
      .set('x-real-ip', IP_CHATFUEL)
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    
    expect(agent.body).toMatchObject({
      question: payload.question,
      people: payload.people,
      answer: payload.answer,
      botId: payload.botId,
      blockId: payload.blockId
    });
  });

  test('should report error when payload empty', async () => {
    const agent = await request(app)
      .post('/chatfuel/quiz')
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);

    expect(agent.body.errors).toMatchObject([
      {
        field: 'question',
        location: 'body',
        message: 'Is required'
      },
      {
        field: 'people',
        location: 'body',
        message: 'Is required'
      }
    ]);
  });

  test('should report error when people is not provided', async () => {
    const agent = await request(app)
      .post('/chatfuel/quiz')
      .send({
        question: question._id,
        answer: 0,
        botId: 'a',
        blockId: 'aa',
      })
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);
      
    const { field } = agent.body.errors[0];
    const { location } = agent.body.errors[0];
    const { message } = agent.body.errors[0];
    expect(field).toBe('people');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when people is not exists', async () => {
    const agent = await request(app)
      .post('/chatfuel/quiz')
      .send({ 
        question: question._id,
        people: 'abc',
        answer: 0,
        botId: 'a',
        blockId: 'aa',
      })
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);
      
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('People not found.');
  });

  
  test('should report error when question is not provided', async () => {
    const agent = await request(app)
      .post('/chatfuel/quiz')
      .send({
        people: people._id,
        answer: 0,
        botId: 'a',
        blockId: 'aa',
      })
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);
      
    const { field } = agent.body.errors[0];
    const { location } = agent.body.errors[0];
    const { message } = agent.body.errors[0];
    expect(field).toBe('question');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when question is object id', async () => {
    const agent = await request(app)
      .post('/chatfuel/quiz')
      .send({ 
        question: 'abc',
        people: people._id,
        answer: 0,
        botId: 'a',
        blockId: 'aa',
      })
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.INTERNAL_SERVER_ERROR);
      
    expect(agent.body.code).toBe(500);
    expect(agent.body.message).toEqual(expect.stringContaining('Cast to ObjectId failed'));
  });

  test('should report error when question is not exists', async () => {
    const agent = await request(app)
      .post('/chatfuel/quiz')
      .send({ 
        question: '5e734c65563c75372cb96547',
        people: people._id,
        answer: 0,
        botId: 'a',
        blockId: 'aa',
      })
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);
      
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Question not found.');
  });
});