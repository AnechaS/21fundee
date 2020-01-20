const mongoose = require('mongoose');
const mockingoose = require('mockingoose').default;
const request = require('supertest');

const app = require('../../app');
const People = require('../../models/people');
const MockCollectionPeople = require('../MockCollections/people.json');

beforeAll(() => {
  mongoose.Promise = global.Promise;
  mockingoose.resetAll();
});
  
afterAll(() => {
  mongoose.disconnect();
});

describe('GET /people', () => {
  test('should province a create people when request is ok', async () => {
    mockingoose(People).toReturn(MockCollectionPeople);
    const agent = await request(app)
      .get('/people')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(agent.body).toEqual(MockCollectionPeople);
  });
});

describe('POST /people', () => {
  test('should create a new people when request is ok', async () => {
    const bodyRequest = {
      messengerUserId: 'asdf',
      firstName: 'b',
      lastName: 'a',
      province: 'สงขลา'
    };

    const agent = await request(app)
      .post('/people')
      .send(bodyRequest)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(agent.body).toMatchObject(expect.objectContaining(bodyRequest));
  });

  test('should create a new people body request value null  when request is ok', async () => {
    const bodyRequest = {
      messengerUserId: 'asdf',
      firstName: 'null',
      lastName: 'null',
      province: 'สงขลา',
      gender: 'null',
      profilePicUrl: 'null',
      locale: 'null',
      source: 'null' 
    };

    const agent = await request(app)
      .post('/people')
      .send(bodyRequest)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(agent.body).toEqual(expect.objectContaining({
      messengerUserId: 'asdf',
      province: 'สงขลา',
    }));
  });

  test('should update district the people when request is ok', async () => {
    mockingoose(People).toReturn(MockCollectionPeople[0], 'findOne');

    const bodyRequest = {
      messengerUserId: 'abcde',
      firstName: 'b',
      lastName: 'a',
      district: 'เทพา'
    };

    const agent = await request(app)
      .post('/people')
      .send(bodyRequest)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(agent.body).toMatchObject(expect.objectContaining({
      ...MockCollectionPeople[0],
      ...bodyRequest
    }));
  });
});

// describe('POST /people/province', () => {
//   test('should province a create people when request is ok', async () => {
//     const testData = {
//       userId: 'lsdpqio23',
//       firstName: '21fundee',
//       lastName: 'tester',
//       province: 'สงขลา'
//     };

//     mockingoose(People).toReturn(testData);

//     const agent = await request(app)
//       .post('/users/province')
//       .send({
//         'user_id': testData.userId,
//         'first_name': testData.firstName,
//         'last_name': testData.lastName,
//         'gender': '{{gender}}',
//         'avatar': '{{profile pic url}}',
//         'timezone': '{{timezone}}',
//         'locale': '{{locale}}',
//         'source': '{{source}}',
//         'last_seen': '{{last seen}}',
//         'signed_up': '{{signed up}}',
//         'sessions': '{{sessions}}',
//         'last_visited_block_name': '{{last visited block name}}',
//         'last_visited_block_id': '{{last visited block id}}',
//         'last_user_freeform_input': testData.province
//       })
//       .set('Accept', 'application/json')
//       .expect('Content-Type', /json/)
//       .expect(200);
    
//     expect(agent.body).toEqual(expect.objectContaining(testData));
//   });
// });

// describe('POST /people/district', () => {
//   test('should district a create people when request is ok', async () => {
//     const testData = {
//       userId: 'lsdpqio23',
//       firstName: '21fundee',
//       lastName: 'tester',
//       district: 'เทพา'
//     };

//     mockingoose(People).toReturn(testData);

//     const agent = await request(app)
//       .post('/users/district')
//       .send({
//         'user_id': testData.userId,
//         'first_name': testData.firstName,
//         'last_name': testData.lastName,
//         'gender': '{{gender}}',
//         'avatar': '{{profile pic url}}',
//         'timezone': '{{timezone}}',
//         'locale': '{{locale}}',
//         'source': '{{source}}',
//         'last_seen': '{{last seen}}',
//         'signed_up': '{{signed up}}',
//         'sessions': '{{sessions}}',
//         'last_visited_block_name': '{{last visited block name}}',
//         'last_visited_block_id': '{{last visited block id}}',
//         'last_user_freeform_input': testData.district
//       })
//       .set('Accept', 'application/json')
//       .expect('Content-Type', /json/)
//       .expect(200);
    
//     expect(agent.body).toEqual(expect.objectContaining(testData));
//   });
// });

// describe('POST /people/child', () => {
//   test('should child a create people when request is ok', async () => {
//     const testData = {
//       userId: 'lsdpqio23',
//       firstName: '21fundee',
//       lastName: 'tester',
//       dentalPersonnelId: 'x',
//       childName: 'B',
//       childBirthday: '2562'
//     };

//     mockingoose(People).toReturn(testData);

//     const agent = await request(app)
//       .post('/users/child')
//       .send({
//         'user_id': testData.userId,
//         'first_name': testData.firstName,
//         'last_name': testData.lastName,
//         'gender': '{{gender}}',
//         'avatar': '{{profile pic url}}',
//         'timezone': '{{timezone}}',
//         'locale': '{{locale}}',
//         'source': '{{source}}',
//         'last_seen': '{{last seen}}',
//         'signed_up': '{{signed up}}',
//         'sessions': '{{sessions}}',
//         'last_visited_block_name': '{{last visited block name}}',
//         'last_visited_block_id': '{{last visited block id}}',
//         'last_user_freeform_input': testData.childBirthday,
//         'child_name': testData.childName,
//         'dental_personnel_id': testData.dentalPersonnelId
//       })
//       .set('Accept', 'application/json')
//       .expect('Content-Type', /json/)
//       .expect(200);
    
//     expect(agent.body).toEqual(expect.objectContaining(testData));
//   });
// });