const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');

const app = require('../../app');
const People = require('../../models/people.model');
const Schedule = require('../../models/schedule.model');
const Question = require('../../models/question.model');

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

  test('should update people if "uid" is exists', async () => {
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
      
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
      
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
      
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
      
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
    expect(agent.body.message).toBe('Validation Error');
      
    const { field } = agent.body.errors[0];
    const { location } = agent.body.errors[0];
    const { message } = agent.body.errors[0];
    expect(field).toBe('people');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
  });


  test('should report error when schedule is not provided', async () => {
    const agent = await request(app)
      .post('/chatfuel/message')
      .send({ 
        people: people._id,
        text: 'Hello World',
        botId: 'a',
        blockId: 'aa',
      })
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);
      
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
      
    const { field } = agent.body.errors[0];
    const { location } = agent.body.errors[0];
    const { message } = agent.body.errors[0];
    expect(field).toBe('schedule');
    expect(location).toBe('body');
    expect(message).toBe('Is required');
  });

  test('should report error when schedule is object id', async () => {
    const agent = await request(app)
      .post('/chatfuel/message')
      .send({ 
        people: people._id,
        schedule: 'abc',
        text: 'Hello World',
        botId: 'a',
        blockId: 'aa',
      })
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);
      
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
      
    const { field } = agent.body.errors[0];
    const { location } = agent.body.errors[0];
    const { message } = agent.body.errors[0];
    expect(field).toBe('schedule');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
  });

  test('should report error when schedule is not exists', async () => {
    const agent = await request(app)
      .post('/chatfuel/message')
      .send({ 
        people: people._id,
        schedule: '5e734c6d163c755501b96547',
        text: 'Hello World',
        botId: 'a',
        blockId: 'aa',
      })
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.BAD_REQUEST);
      
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
      
    const { field } = agent.body.errors[0];
    const { location } = agent.body.errors[0];
    const { message } = agent.body.errors[0];
    expect(field).toBe('schedule');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
  });

  test('should create a new quiz of the message when correct answer', async () => {
    const payload = {
      people: people._id,
      schedule: schedule._id,
      text: 'answer the quiz',
      botId: 'a',
      blockId: 'aa',
      quiz: {
        question: question._id,
        answer: question.correct
      }
    };
    
    const agent = await request(app)
      .post('/chatfuel/message')
      .send(payload)
      .set('x-real-ip', IP_CHATFUEL)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);

    expect(agent.body).toMatchObject({
      _id: expect.anything(),
      quiz: {
        question: payload.quiz.question,
        answer: payload.quiz.answer,
        isCorrect: true
      },
      people: people._id,
      schedule: schedule._id,
      text: payload.text,
      botId: payload.botId,
      blockId: payload.blockId,
    });
  });

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
      
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
      
    expect(agent.body.errors).toEqual([ 
      { 
        field: 'quiz.answer',
        location: 'body',
        message: 'Invalid value' 
      },
      { 
        field: 'quiz.question',
        location: 'body',
        message: 'Invalid value' 
      }
    ]);
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
      
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');
      
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
      .expect(httpStatus.BAD_REQUEST);
    
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');

    const { field } = agent.body.errors[0];
    const { location } = agent.body.errors[0];
    const { message } = agent.body.errors[0];
    expect(field).toBe('quiz.question');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
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
    expect(agent.body.message).toBe('Validation Error');

    const { field } = agent.body.errors[0];
    const { location } = agent.body.errors[0];
    const { message } = agent.body.errors[0];
    
    expect(field).toBe('quiz.question');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
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
      
    expect(agent.body.code).toBe(400);
    expect(agent.body.message).toBe('Validation Error');

    const { field } = agent.body.errors[0];
    const { location } = agent.body.errors[0];
    const { message } = agent.body.errors[0];
    expect(field).toBe('quiz.answer');
    expect(location).toBe('body');
    expect(message).toBe('Invalid value');
  });
});