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

mongoose.Promise = global.Promise;

let sessionToken;
let dbPeoples;
let dbSchedules;
let dbConversations;
let conversation;

const botId = 'asdfqwer';
const blockIds = ['zxcvbnm', 'qwertyu'];

beforeEach(async () => {
  await User.deleteMany({});
  await SessionToken.deleteMany({});
  await People.deleteMany({});
  await Schedule.deleteMany({});

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
      text: 'Hello',
      botId,
      blockId: blockIds[0],
    },
    {
      people: dbPeoples[1]._id,
      schedule: dbSchedules[0]._id,
      text: 'Hello',
      botId,
      blockId: blockIds[0],
    },
  ]);
  dbConversations = JSON.parse(JSON.stringify(savedConversations));

  conversation = {
    people: dbPeoples[0]._id,
    schedule: dbSchedules[1]._id,
    text: 'abc',
    botId,
    blockId: blockIds[1],
  };
});

afterAll(async () => {
  await mongoose.disconnect();
});

const format = object => {
  const getPeople = dbPeoples.find(o => o._id === object.people);
  const getschedule = dbSchedules.find(o => o._id === object.schedule);
  return {
    ...object,
    people: getPeople,
    schedule: getschedule,
  };
};

describe('GET /conversations', () => {
  test('should get all conversation', async () => {
    const agent = await request(app)
      .get('/conversations')
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(200);
    const conversationTransformed = dbConversations.map(o => format(o));
    expect(agent.body).toEqual(conversationTransformed);
  });
});

describe('POST /conversations', () => {
  test('should reate a new conversation', async () => {
    const agent = await request(app)
      .post('/conversations')
      .set('Authorization', sessionToken)
      .send(conversation)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    expect(agent.body).toMatchObject(conversation);
  });
});

describe('GET /conversations/:id', () => {
  test('should get the conversation', async () => {
    const id = dbConversations[0]._id;

    const agent = await request(app)
      .get(`/conversations/${id}`)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);

    const conversationTransformed = format(dbConversations[0]);
    expect(agent.body).toEqual(conversationTransformed);
  });

  test('should report error when conversations does not exists', async () => {
    const id = mongoose.Types.ObjectId();

    const agent = await request(app)
      .get(`/conversations/${id}`)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('PUT /conversations', () => {
  test('should update the conversation', async () => {
    const id = dbConversations[0]._id;

    const agent = await request(app)
      .put(`/conversations/${id}`)
      .send(conversation)
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);
    expect(agent.body._id).toBe(id);
    expect(agent.body).toMatchObject(conversation);
  });

  test('should report error when conversations does not exists', async () => {
    const id = mongoose.Types.ObjectId();

    const agent = await request(app)
      .put(`/conversations/${id}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('DELETE /conversaitons', () => {
  test('should delete the conversaion', async () => {
    const id = dbConversations[0]._id;

    const agent = await request(app)
      .delete(`/conversations/${id}`)
      .set('Authorization', sessionToken)
      .expect(httpStatus.NO_CONTENT);
    expect(agent.body).toEqual({});
    await expect(Conversation.findById(id)).resolves.toBeNull();
  });

  test('should report error when conversations does not exists', async () => {
    const id = mongoose.Types.ObjectId();

    const agent = await request(app)
      .delete(`/conversations/${id}`)
      .set('Authorization', sessionToken)
      .expect(httpStatus.NOT_FOUND);
    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});
