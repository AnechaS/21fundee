const mongoose = require('mongoose');
const mockingoose = require('mockingoose').default;
const request = require('supertest');

const app = require('../app');
const User = require('../models/user');

beforeAll(() => {
  mongoose.Promise = global.Promise;
  // mockingoose.resetAll();
});
  
afterAll(() => {
  mongoose.disconnect();
});

describe('POST /user/province', () => {
  test('should province a create user when request is ok', async () => {
    const testData = {
      userId: 'lsdpqio23',
      firstName: '21fundee',
      lastName: 'tester',
      province: 'สงขลา'
    };

    mockingoose(User).toReturn(testData);

    const agent = await request(app)
      .post('/users/province')
      .send({
        'user_id': testData.userId,
        'first_name': testData.firstName,
        'last_name': testData.lastName,
        'gender': '{{gender}}',
        'avatar': '{{profile pic url}}',
        'timezone': '{{timezone}}',
        'locale': '{{locale}}',
        'source': '{{source}}',
        'last_seen': '{{last seen}}',
        'signed_up': '{{signed up}}',
        'sessions': '{{sessions}}',
        'last_visited_block_name': '{{last visited block name}}',
        'last_visited_block_id': '{{last visited block id}}',
        'last_clicked_button_name': testData.province
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(agent.body).toEqual(expect.objectContaining(testData));
  });
});

describe('POST /user/district', () => {
  test('should district a create user when request is ok', async () => {
    const testData = {
      userId: 'lsdpqio23',
      firstName: '21fundee',
      lastName: 'tester',
      district: 'เทพา'
    };

    mockingoose(User).toReturn(testData);

    const agent = await request(app)
      .post('/users/district')
      .send({
        'user_id': testData.userId,
        'first_name': testData.firstName,
        'last_name': testData.lastName,
        'gender': '{{gender}}',
        'avatar': '{{profile pic url}}',
        'timezone': '{{timezone}}',
        'locale': '{{locale}}',
        'source': '{{source}}',
        'last_seen': '{{last seen}}',
        'signed_up': '{{signed up}}',
        'sessions': '{{sessions}}',
        'last_visited_block_name': '{{last visited block name}}',
        'last_visited_block_id': '{{last visited block id}}',
        'last_clicked_button_name': testData.district
      })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(agent.body).toEqual(expect.objectContaining(testData));
  });
});