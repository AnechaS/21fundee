const mongoose = require('mongoose');
const httpStatus = require('http-status');
const request = require('supertest');

const app = require('../../app');
const Schedule = require('../../models/schedule');

mongoose.Promise = global.Promise;

let schedule;

afterAll(async () => {
  await mongoose.disconnect();
});

describe('POST /schedules', () => {
  test('should create a new schedule', async () => {
    const payload = { name: 'Day 2' };
    const agent = await request(app)
      .post('/schedules')
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.CREATED);

    schedule = agent.body;
    expect(agent.body.name).toBe(payload.name);
  });
});

describe('GET /schedules', () => {
  test('should get all schedule', async () => {
    const agent = await request(app)
      .get('/schedules')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);

    expect(agent.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: schedule._id,
          name: schedule.name
        })
      ])
    );
  });
});

describe('PUT /schedules', () => {
  test('should update the schedule ', async () => {
    const payload = { name: 'Day 3' };
    const agent = await request(app)
      .put(`/schedules/${schedule._id}`)
      .send(payload)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);

    expect(agent.body.name).toBe(payload.name);
  });

  test('should report error when schedules does not exists', async () => {
    const agent = await request(app)
      .put('/schedules/asdfghj')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(httpStatus.NOT_FOUND);   

    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});

describe('DELETE /schedules', () => {
  test('should delete the schedule', async () => {
    const agent = await request(app)
      .delete(`/schedules/${schedule._id}`)
      .expect(httpStatus.NO_CONTENT);

    expect(agent.body).toEqual({});
    await expect(Schedule.findById(schedule._id)).resolves.toBeNull();
  });

  test('should report error when schedules does not exists', async () => {
    const agent = await request(app)
      .delete('/schedules/5e412c6d163c750001096478')
      .expect(httpStatus.NOT_FOUND);

    expect(agent.body.code).toBe(404);
    expect(agent.body.message).toBe('Object not found.');
  });
});
