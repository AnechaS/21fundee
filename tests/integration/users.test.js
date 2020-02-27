const request = require('supertest');
const mongoose = require('mongoose');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const { some, omitBy, isNil } = require('lodash');

const User = require('../../models/user.model');

const app = require('../../app');

/**
 * root level hooks
 */

async function format(user) {
  const formated = user;

  // delete password
  delete formated.password;

  // get users from database
  const dbUser = (await User.findOne({ email: user.email })).transform();

  // remove null and undefined properties
  return omitBy(dbUser, isNil);
}

let adminAccessToken;
// let userAccessToken;
let dbUsers;
// let user;
// let admin;

const password = '123456';
let passwordHashed;

beforeEach(async () => {
  passwordHashed = await bcrypt.hash(password, 1);

  dbUsers = {
    branStark: {
      email: 'branstark@gmail.com',
      password: passwordHashed,
      name: 'Bran Stark',
      role: 'admin',
    },
    jonSnow: {
      email: 'jonsnow@gmail.com',
      password: passwordHashed,
      name: 'Jon Snow',
    },
  };

  // user = {
  //   email: 'sousa.dfs@gmail.com',
  //   password,
  //   name: 'Daniel Sousa',
  // };

  // admin = {
  //   email: 'sousa.dfs@gmail.com',
  //   password,
  //   name: 'Daniel Sousa',
  //   role: 'admin',
  // };

  await User.deleteMany({});
  await User.insertMany([dbUsers.branStark, dbUsers.jonSnow]);
  dbUsers.branStark.password = password;
  dbUsers.jonSnow.password = password;
  adminAccessToken = (await User.findAndGenerateToken(dbUsers.branStark)).accessToken;
  // userAccessToken = (await User.findAndGenerateToken(dbUsers.jonSnow)).accessToken;
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('GET /users', () => {
  it('should get all users', () => {
    return request(app)
      .get('/users')
      .set('Authorization', `Bearer ${adminAccessToken}`)
      .expect(httpStatus.OK)
      .then(async (res) => {
        const bran = await format(dbUsers.branStark);
        const john = await format(dbUsers.jonSnow);
        // before comparing it is necessary to convert String to Date
        res.body[0].createdAt = new Date(res.body[0].createdAt);
        res.body[1].createdAt = new Date(res.body[1].createdAt);

        const includesBranStark = some(res.body, bran);
        const includesjonSnow = some(res.body, john);

        expect(res.body).toBeInstanceOf(Array);
        expect(res.body).toHaveLength(2);
        expect(includesBranStark).toBeDefined();
        expect(includesjonSnow).toBeDefined();
      });
  });

  // it('should get all users with pagination', () => {
  //   return request(app)
  //     .get('/v1/users')
  //     .set('Authorization', `Bearer ${adminAccessToken}`)
  //     .query({ page: 2, perPage: 1 })
  //     .expect(httpStatus.OK)
  //     .then(async (res) => {
  //       delete dbUsers.jonSnow.password;

  //       expect(res.body).to.be.an('array');
  //       expect(res.body[0]).to.be.an('object');
  //       expect(res.body).to.have.lengthOf(1);
  //       expect(res.body[0].name).to.be.equal('Jon Snow');
  //     });
  // });

  // it('should filter users', () => {
  //   return request(app)
  //     .get('/v1/users')
  //     .set('Authorization', `Bearer ${adminAccessToken}`)
  //     .query({ email: dbUsers.jonSnow.email })
  //     .expect(httpStatus.OK)
  //     .then(async (res) => {
  //       delete dbUsers.jonSnow.password;
  //       const john = await format(dbUsers.jonSnow);

  //       // before comparing it is necessary to convert String to Date
  //       res.body[0].createdAt = new Date(res.body[0].createdAt);

  //       const includesjonSnow = some(res.body, john);

  //       expect(res.body).to.be.an('array');
  //       expect(res.body).to.have.lengthOf(1);
  //       expect(includesjonSnow).to.be.true;
  //     });
  // });

  // it('should report error when pagination\'s parameters are not a number', () => {
  //   return request(app)
  //     .get('/v1/users')
  //     .set('Authorization', `Bearer ${adminAccessToken}`)
  //     .query({ page: '?', perPage: 'whaat' })
  //     .expect(httpStatus.BAD_REQUEST)
  //     .then((res) => {
  //       const { field } = res.body.errors[0];
  //       const { location } = res.body.errors[0];
  //       const { messages } = res.body.errors[0];
  //       expect(field).to.be.equal('page');
  //       expect(location).to.be.equal('query');
  //       expect(messages).to.include('"page" must be a number');
  //       return Promise.resolve(res);
  //     })
  //     .then((res) => {
  //       const { field } = res.body.errors[1];
  //       const { location } = res.body.errors[1];
  //       const { messages } = res.body.errors[1];
  //       expect(field).to.be.equal('perPage');
  //       expect(location).to.be.equal('query');
  //       expect(messages).to.include('"perPage" must be a number');
  //     });
  // });

  // it('should report error if logged user is not an admin', () => {
  //   return request(app)
  //     .get('/v1/users')
  //     .set('Authorization', `Bearer ${userAccessToken}`)
  //     .expect(httpStatus.FORBIDDEN)
  //     .then((res) => {
  //       expect(res.body.code).to.be.equal(httpStatus.FORBIDDEN);
  //       expect(res.body.message).to.be.equal('Forbidden');
  //     });
  // });
});