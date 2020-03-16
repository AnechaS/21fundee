const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');

const app = require('../../app');
const User = require('../../models/user.model');
const SessionToken = require('../../models/sessionToken.model');
const People = require('../../models/people.model');
const Schedule = require('../../models/schedule.model');
const Message = require('../../models/message.model');

mongoose.Promise = global.Promise;

let sessionToken;
let people;
let schedule;
let messages;
let message;

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
    role: 'admin',
  };

  const dbPeople = {
    firstName: 'Sara',
    lastName: 'De',
    province: 'สงขลา',
    district: 'เทพา',
    dentalId: 'x',
    childName: 'Ant',
    childBirthday: '2560',
    gender: 'male',
  };

  const dbSchedule = {
    name: 'Day 1',
  };

  const savedUser = await User.create(dbUser);
  sessionToken = SessionToken.generate(savedUser).token;

  const savedPeople = await People.create(dbPeople);
  people = JSON.parse(JSON.stringify(savedPeople));

  const savedSchedule = await People.create(dbSchedule);
  schedule = JSON.parse(JSON.stringify(savedSchedule));

  const dbMessages = [
    {
      people: people._id,
      schedule: schedule._id,
      text: 'Hello World',
    },
  ];

  const savedMessages = await Message.insertMany(dbMessages);
  messages = JSON.parse(JSON.stringify(savedMessages));

  message = {};
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('GET /messages', () => {
  test('should get all message', async () => {
    const agent = await request(app)
      .get('/messages')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    console.log(agent.body);

    // expect(agent.body).toBeInstanceOf(Array);
    // expect(agent.body).toEqual(
    //   expect.arrayContaining([
    //     expect.objectContaining({
    //       _id: message._id,
    //       people: expect.objectContaining({
    //         _id: people._id,
    //         firstName: people.firstName,
    //         lastName: people.lastName,
    //         province: people.province,
    //       }),
    //       schedule: expect.objectContaining({
    //         _id: schedule._id,
    //         name: schedule.name,
    //       }),
    //       text: message.text,
    //     }),
    //   ])
    // );
  });
});

// describe('POST /messages', () => {
//   test('should reate a new message', async () => {
//     const payload = {
//       people: people._id,
//       schedule: schedule._id,
//       text: 'Hello World'
//     };

//     const agent = await request(app)
//       .post('/messages')
//       .send(payload)
//       .set('Accept', 'application/json')
//       .expect('Content-Type', /json/)
//       .expect(httpStatus.CREATED);

//     message = agent.body;

//     expect(agent.body).toMatchObject({
//       people: people._id,
//       schedule: schedule._id,
//       text: payload.text
//     });
//   });
// });

// describe('GET /messages', () => {
//   test('should get all message', async () => {
//     const agent = await request(app)
//       .get('/messages')
//       .set('Accept', 'application/json')
//       .expect('Content-Type', /json/)
//       .expect(200);

//     expect(agent.body).toBeInstanceOf(Array);
//     expect(agent.body).toEqual(
//       expect.arrayContaining([
//         expect.objectContaining({
//           _id: message._id,
//           people: expect.objectContaining({
//             _id: people._id,
//             firstName: people.firstName,
//             lastName: people.lastName,
//             province: people.province,
//           }),
//           schedule: expect.objectContaining({
//             _id: schedule._id,
//             name: schedule.name
//           }),
//           text: message.text
//         })
//       ])
//     );
//   });
// });

// describe('PUT /messages', () => {
//   test('should update the message ', async () => {
//     const payload = {
//       text: 'Good.'
//     };

//     const agent = await request(app)
//       .put(`/messages/${message._id}`)
//       .send(payload)
//       .set('Accept', 'application/json')
//       .expect('Content-Type', /json/)
//       .expect(httpStatus.OK);

//     expect(agent.body).toMatchObject({
//       _id: message._id,
//       people: people._id,
//       schedule: schedule._id,
//       text: payload.text
//     });
//   });

//   test('should report error when schedules does not exists', async () => {
//     const agent = await request(app)
//       .put('/messages/asdfghj')
//       .set('Accept', 'application/json')
//       .expect('Content-Type', /json/)
//       .expect(httpStatus.NOT_FOUND);

//     expect(agent.body.code).toBe(404);
//     expect(agent.body.message).toBe('Object not found.');
//   });
// });

// describe('DELETE /messages', () => {
//   test('should delete the message', async () => {
//     const agent = await request(app)
//       .delete(`/messages/${message._id}`)
//       .expect(httpStatus.NO_CONTENT);

//     expect(agent.body).toEqual({});
//     await expect(Message.findById(message._id)).resolves.toBeNull();
//   });

//   test('should report error when message does not exists', async () => {
//     const agent = await request(app)
//       .delete('/messages/asdfghj')
//       .expect(httpStatus.NOT_FOUND);

//     expect(agent.body.code).toBe(404);
//     expect(agent.body.message).toBe('Object not found.');
//   });
// });
