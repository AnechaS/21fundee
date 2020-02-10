const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');

const app = require('../../app');
const People = require('../../models/people');
const Schedule = require('../../models/schedule');
const Message = require('../../models/message');

mongoose.Promise = global.Promise;

const people = {
  _id: '5e412c6d163c753701b96477',
  firstName: 'Bran',
  lastName: 'Stark',
  province: 'สงขลา',
};

const schedule = { 
  _id: '5e734c6d163c753701b96477',
  name: 'Day 2' 
};

beforeAll(async () => {
  await People.create(people);
  await Schedule.create(schedule);
});
  
afterAll(async () => {
  await People.deleteOne({ _id: people._id });
  await Schedule.deleteOne({ _id: schedule._id });
  await mongoose.disconnect();
});

describe('POST /messages', () => {
  test('should reate a new message', async () => {
    const json = {
      people: people._id,
      schedule: schedule._id,
      text: 'Hello World'
    };

    const agent = await request(app)
      .post('/messages')
      .send(json)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);
    
    expect(agent.body).toMatchObject({
      _id: expect.anything(),
      people: people._id,
      schedule: schedule._id,
      text: json.text
    });
  });
});

describe('GET /messages', () => {
  test('should get all message', async () => {
    const agent = await request(app)
      .get('/messages')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(agent.body).toMatchObject([
      {
        _id: expect.anything(),
        people,
        schedule,
        text: 'Hello World'
      }
    ]);
  });
});


describe('PUT /messages', () => {
  test('should update the message ', async () => {
    const id = (await Message.findOne({}))._id;

    const json = {
      text: 'Good.'
    };

    const agent = await request(app)
      .put(`/messages/${id}`)
      .send(json)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);

    expect(agent.body).toMatchObject({
      _id: id.toString(),
      people: people._id,
      schedule: schedule._id,
      text: json.text
    });
  });

  test('should report error when schedules does not exists', async () => {
    const agent = await request(app)
      .put('/messages/asdfghj')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);   

    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('DELETE /messages', () => {
  test('should delete the message', async () => {
    const id = (await Message.findOne({}))._id;

    const agent = await request(app)
      .delete(`/messages/${id}`)
      .expect(httpStatus.NO_CONTENT);

    expect(agent.body).toEqual({});
    await expect(Message.findById(id)).resolves.toBeNull();
  });

  test('should report error when message does not exists', async () => {
    const agent = await request(app)
      .delete('/messages/asdfghj')
      .expect(httpStatus.NOT_FOUND);

    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});
