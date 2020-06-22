/* eslint-disable no-unused-vars, no-undef */
const mongoose = require('mongoose');
const request = require('supertest');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const faker = require('faker');
const moment = require('moment');
const _ = require('lodash');
const app = require('../../app');

const User = require('../../models/user.model');
const SessionToken = require('../../models/sessionToken.model');
const People = require('../../models/people.model');
const Schedule = require('../../models/schedule.model');
const Reply = require('../../models/reply.model');
const Progress = require('../../models/progress.model');

mongoose.Promise = global.Promise;

let sessionToken;
let dbPeoples = [];
let dbSchedules = [];
let dbProgresses = [];

const birthday = ['ก่อน 2560', '2560', '2561', '2562'];
const gender = ['male', 'female'];
const province = ['สงขลา'];
const address = {
  st: {
    p: province[0],
    d: 'เทพา'
  },
  sm: {
    p: province[0],
    d: 'เมือง'
  },
  sh: {
    p: province[0],
    d: 'หาดใหญ่'
  },
  sot: {
    p: province[0],
    d: 'อำเภออื่นๆ'
  }
};

beforeEach(async () => {
  await User.deleteMany({});
  await SessionToken.deleteMany({});
  await Reply.deleteMany({});
  await Schedule.deleteMany({});
  await People.deleteMany({});
  await Progress.deleteMany({});

  const passwordHashed = await bcrypt.hash('1234', 1);
  const savedUser = await User.create({
    email: 'jonsnow@gmail.com',
    password: passwordHashed,
    username: 'Jon Snow',
    role: 'admin'
  });
  sessionToken = SessionToken.generate(savedUser).token;

  const mockDataPeoples = [
    {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      gender: gender[0],
      profilePicUrl: faker.image.image(),
      province: address.st.p,
      district: address.st.d,
      dentalId: faker.helpers.replaceSymbolWithNumber('######'),
      childName: faker.name.firstName(),
      childBirthday: birthday[0],
      createdAt: moment.utc('2020-04-04')
    },
    {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      gender: gender[0],
      profilePicUrl: faker.image.image(),
      province: address.sm.p,
      district: address.sm.d,
      dentalId: faker.helpers.replaceSymbolWithNumber('######'),
      childName: faker.name.firstName(),
      childBirthday: birthday[2],
      createdAt: moment.utc('2020-04-03')
    },
    {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      gender: gender[1],
      profilePicUrl: faker.image.image(),
      province: address.sh.p,
      district: address.sh.d,
      dentalId: 'x',
      childName: faker.name.firstName(),
      childBirthday: birthday[1],
      createdAt: moment.utc('2020-04-04')
    },
    {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      gender: gender[1],
      profilePicUrl: faker.image.image(),
      province: address.sh.p,
      district: address.sh.d,
      dentalId: 'x',
      childName: faker.name.firstName(),
      childBirthday: birthday[1],
      createdAt: moment.utc('2020-04-02')
    },
    {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      gender: gender[1],
      profilePicUrl: faker.image.image(),
      province: address.sot.p,
      district: address.sot.d,
      dentalId: 'x',
      childName: faker.name.firstName(),
      childBirthday: birthday[1],
      createdAt: moment.utc('2020-04-03')
    },
    {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      gender: gender[1],
      profilePicUrl: faker.image.image(),
      province: address.sot.p,
      district: address.sot.d,
      dentalId: 'x',
      childName: faker.name.firstName(),
      childBirthday: birthday[1],
      createdAt: moment.utc('2020-04-05')
    }
  ];

  const savedPeoples = await People.insertMany(mockDataPeoples);
  dbPeoples = JSON.parse(JSON.stringify(savedPeoples));

  const mockDataSchedules = Array.from({ length: 22 }, (_, i) => ({
    name: `Day ${i + 1}`
  }));
  const savedSchedules = await Schedule.insertMany(mockDataSchedules);
  dbSchedules = JSON.parse(JSON.stringify(savedSchedules));

  const savedReplys = await Reply.insertMany([
    ...dbSchedules.map((o, i) => ({
      people: dbPeoples[0]._id,
      schedule: o._id,
      text: `hello${i + 1}`,
      blockId: (i + 1).toString()
    })),
    ...dbSchedules.map((o, i) => ({
      people: dbPeoples[1]._id,
      schedule: o._id,
      text: `hello${i + 1}`,
      blockId: (i + 1).toString()
    })),
    ...dbSchedules
      .slice()
      .splice(0, 15)
      .map((o, i) => ({
        people: dbPeoples[2]._id,
        schedule: o._id,
        text: `hello${i + 1}`,
        blockId: (i + 1).toString()
      })),
    ...dbSchedules
      .slice()
      .splice(0, 10)
      .map((o, i) => ({
        people: dbPeoples[3]._id,
        schedule: o._id,
        text: `hello${i + 1}`,
        blockId: (i + 1).toString()
      })),
    ...dbSchedules.map((o, i) => ({
      people: dbPeoples[5]._id,
      schedule: o._id,
      text: `hello${i + 1}`,
      blockId: (i + 1).toString()
    }))
  ]);
  dbReplys = JSON.parse(JSON.stringify(savedReplys));

  const savedProgresses = await Progress.insertMany([
    ...dbSchedules.map(o => ({
      people: dbPeoples[0]._id,
      schedule: o._id,
      status: 2
    })),
    ...dbSchedules.map(o => ({
      people: dbPeoples[1]._id,
      schedule: o._id,
      status: 2
    })),
    ...dbSchedules
      .slice()
      .splice(0, 15)
      .map(o => ({
        people: dbPeoples[2]._id,
        schedule: o._id,
        status: 2
      })),
    ...dbSchedules
      .slice()
      .splice(0, 10)
      .map(o => ({
        people: dbPeoples[3]._id,
        schedule: o._id,
        status: 2
      })),
    { people: dbPeoples[3]._id, schedule: dbSchedules[10]._id, status: 1 },
    ...dbSchedules
      .slice()
      .splice(0, 15)
      .map(o => ({
        people: dbPeoples[5]._id,
        schedule: o._id,
        status: 2
      }))
  ]);
  dbProgresses = JSON.parse(JSON.stringify(savedProgresses));
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('GET /dashboards', () => {
  test('should get widgets', async () => {
    const agent = await request(app)
      .get('/dashboards/1')
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);

    const { widgets } = agent.body;
    const [
      widget1,
      widget2,
      widget3,
      widget4,
      widget5,
      widget6,
      widget7,
      widget8,
      widget9
    ] = widgets;

    expect(widget1).toEqual({ value: 5 });
    expect(widget2).toEqual({ value: 2 });
    expect(widget3).toEqual({
      value: 2,
      percentage: (2 / 5) * 100
    });

    expect(widget4).toEqual({
      value: 3,
      percentage: (3 / 5) * 100
    });

    const widget5DataNotNull = widget5.data.filter(o => o.y);
    expect(widget5DataNotNull).toHaveLength(3);
    expect(widget5DataNotNull).toEqual([
      { y: 1, t: moment.utc('2020-04-02').valueOf() },
      { y: 2, t: moment.utc('2020-04-03').valueOf() },
      { y: 2, t: moment.utc('2020-04-04').valueOf() }
    ]);

    expect(widget6).toEqual({
      data: [
        {
          province: province[0],
          peoplesCount: 5,
          peoplesWithDIdCount: 2,
          peoplesGeneralCount: 3,
          percentage: 100
        }
      ],
      total: 1,
      maxPeoples: { name: province[0], value: 5 },
      maxPeoplesWithDId: { name: province[0], value: 2 },
      maxPeoplesGeneral: { name: province[0], value: 3 }
    });

    expect(widget7).toEqual({
      data: expect.arrayContaining([
        {
          province: address.sh.p,
          district: address.sh.d,
          peoplesCount: 2,
          peoplesWithDIdCount: 0,
          peoplesGeneralCount: 2,
          percentage: (2 / 5) * 100
        },
        {
          province: address.st.p,
          district: address.st.d,
          peoplesCount: 1,
          peoplesWithDIdCount: 1,
          peoplesGeneralCount: 0,
          percentage: (1 / 5) * 100
        },
        {
          province: address.sot.p,
          district: address.sot.d,
          peoplesCount: 1,
          peoplesWithDIdCount: 0,
          peoplesGeneralCount: 1,
          percentage: (1 / 5) * 100
        },
        {
          province: address.sm.p,
          district: address.sm.d,
          peoplesCount: 1,
          peoplesWithDIdCount: 1,
          peoplesGeneralCount: 0,
          percentage: (1 / 5) * 100
        }
      ]),
      total: 4,
      maxPeoples: { name: address.sh.d, value: 2 },
      maxPeoplesWithDId: { name: address.sm.d, value: 1 },
      maxPeoplesGeneral: { name: address.sh.d, value: 2 }
    });

    const progresses = await Progress.find({
      status: 2,
      people: {
        $in: dbPeoples
          .slice()
          .splice(0, 4)
          .map(v => v._id)
      }
    });

    expect(widget8.data).toHaveLength(22);
    expect(_.sum(widget8.data.map(o => o.count))).toBe(progresses.length);

    expect(widget8.data).toEqual([
      ...dbSchedules
        .slice()
        .splice(0, 10)
        .map(o => ({
          x: o.name,
          y: Number(((4 / 5) * 100).toFixed(2)),
          _id: o._id,
          count: 4
        })),

      ...dbSchedules
        .slice()
        .splice(10, 5)
        .map(o => ({
          x: o.name,
          y: Number(((3 / 5) * 100).toFixed(2)),
          _id: o._id,
          count: 3
        })),

      ...dbSchedules
        .slice()
        .splice(15)
        .map(o => ({
          x: o.name,
          y: Number(((2 / 5) * 100).toFixed(2)),
          _id: o._id,
          count: 2
        }))
    ]);

    expect(widget9.data).toEqual(
      expect.arrayContaining(dbPeoples.splice(0, 5))
    );
  });

  test('should get widgets with date end', async () => {
    const agent = await request(app)
      .get('/dashboards/1')
      .query({
        dateEnd: '2020-04-03'
      })
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);

    const { widgets } = agent.body;
    const [
      widget1,
      widget2,
      widget3,
      widget4,
      widget5,
      widget6,
      widget7,
      widget8,
      widget9
    ] = widgets;

    const peoples = dbPeoples.filter(o =>
      moment.utc('2020-04-03').isSameOrAfter(o.createdAt)
    );
    const countPeople = peoples.length;
    const countPeopleWithDid = 1;
    const countPeopleGeneral = countPeople - countPeopleWithDid;

    expect(widget1).toEqual({ value: countPeople });
    expect(widget2).toEqual({ value: 2 });
    expect(widget3).toEqual({
      value: countPeopleWithDid,
      percentage: Number(((countPeopleWithDid / countPeople) * 100).toFixed(2))
    });

    expect(widget4).toEqual({
      value: countPeopleGeneral,
      percentage: Number(((countPeopleGeneral / countPeople) * 100).toFixed(2))
    });

    const widget5DataNotNull = widget5.data.filter(o => o.y);
    expect(widget5DataNotNull).toHaveLength(2);
    expect(widget5DataNotNull).toEqual([
      { y: 1, t: moment.utc('2020-04-02').valueOf() },
      { y: 2, t: moment.utc('2020-04-03').valueOf() }
    ]);

    expect(widget6.data).toEqual([
      {
        province: province[0],
        peoplesCount: countPeople,
        peoplesWithDIdCount: countPeopleWithDid,
        peoplesGeneralCount: countPeopleGeneral,
        percentage: 100
      }
    ]);

    expect(widget6.total).toBe(1);
    expect(widget6.maxPeoples).toEqual({
      name: province[0],
      value: countPeople
    });
    expect(widget6.maxPeoplesWithDId).toEqual({
      name: province[0],
      value: countPeopleWithDid
    });
    expect(widget6.maxPeoplesGeneral).toEqual({
      name: province[0],
      value: countPeopleGeneral
    });

    expect(widget7.data).toEqual(
      expect.arrayContaining([
        {
          province: address.sh.p,
          district: address.sh.d,
          peoplesCount: 1,
          peoplesWithDIdCount: 0,
          peoplesGeneralCount: 1,
          percentage: Number(((1 / countPeople) * 100).toFixed(2))
        },
        {
          province: address.sot.p,
          district: address.sot.d,
          peoplesCount: 1,
          peoplesWithDIdCount: 0,
          peoplesGeneralCount: 1,
          percentage: Number(((1 / countPeople) * 100).toFixed(2))
        },
        {
          province: address.sm.p,
          district: address.sm.d,
          peoplesCount: 1,
          peoplesWithDIdCount: 1,
          peoplesGeneralCount: 0,
          percentage: Number(((1 / countPeople) * 100).toFixed(2))
        }
      ])
    );
    expect(widget7.total).toBe(3);
    expect(widget7.maxPeoples).toEqual({
      name: address.sh.d,
      value: 1
    });
    expect(widget7.maxPeoplesWithDId).toEqual({
      name: address.sm.d,
      value: 1
    });
    expect(widget7.maxPeoplesGeneral).toEqual({
      name: address.sh.d,
      value: 1
    });

    const progresses = await Progress.find({
      status: 2,
      people: {
        $in: peoples.map(o => o._id)
      }
    });

    expect(widget8.data).toHaveLength(22);
    expect(_.sum(widget8.data.map(o => o.count))).toBe(progresses.length);
    expect(widget8.data).toEqual([
      ...dbSchedules
        .slice()
        .splice(0, 10)
        .map(o => ({
          x: o.name,
          y: Number(((2 / countPeople) * 100).toFixed(2)),
          _id: o._id,
          count: 2
        })),

      ...dbSchedules
        .slice()
        .splice(10)
        .map(o => ({
          x: o.name,
          y: Number(((1 / countPeople) * 100).toFixed(2)),
          _id: o._id,
          count: 1
        }))
    ]);

    expect(widget9.data).toEqual(expect.arrayContaining(peoples));
  });

  test('should get widgets with date start', async () => {
    const agent = await request(app)
      .get('/dashboards/1')
      .query({ dateStart: '2020-04-03' })
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);

    const { widgets } = agent.body;
    const [
      widget1,
      widget2,
      widget3,
      widget4,
      widget5,
      widget6,
      widget7,
      widget8,
      widget9
    ] = widgets;

    const peoples = dbPeoples.filter(
      o =>
        moment.utc('2020-04-03').isSameOrBefore(o.createdAt) &&
        moment.utc('2020-04-04').isSameOrAfter(o.createdAt)
    );
    const countPeople = peoples.length;
    const countPeopleWithDid = 2;
    const countPeopleGeneral = countPeople - countPeopleWithDid;

    expect(widget1).toEqual({ value: countPeople });
    expect(widget2).toEqual({ value: 2 });
    expect(widget3).toEqual({
      value: countPeopleWithDid,
      percentage: Number(((countPeopleWithDid / countPeople) * 100).toFixed(2))
    });

    expect(widget4).toEqual({
      value: countPeopleGeneral,
      percentage: Number(((countPeopleGeneral / countPeople) * 100).toFixed(2))
    });

    const widget5DataNotNull = widget5.data.filter(o => o.y);
    expect(widget5DataNotNull).toHaveLength(2);
    expect(widget5DataNotNull).toEqual([
      { y: 2, t: moment.utc('2020-04-03').valueOf() },
      { y: 2, t: moment.utc('2020-04-04').valueOf() }
    ]);

    expect(widget6.data).toEqual([
      {
        province: province[0],
        peoplesCount: countPeople,
        peoplesWithDIdCount: countPeopleWithDid,
        peoplesGeneralCount: countPeopleGeneral,
        percentage: 100
      }
    ]);

    expect(widget6.total).toBe(1);
    expect(widget6.maxPeoples).toEqual({
      name: province[0],
      value: countPeople
    });
    expect(widget6.maxPeoplesWithDId).toEqual({
      name: province[0],
      value: countPeopleWithDid
    });
    expect(widget6.maxPeoplesGeneral).toEqual({
      name: province[0],
      value: countPeopleGeneral
    });

    expect(widget7.data).toEqual(
      expect.arrayContaining([
        {
          province: address.sh.p,
          district: address.sh.d,
          peoplesCount: 1,
          peoplesWithDIdCount: 0,
          peoplesGeneralCount: 1,
          percentage: Number(((1 / countPeople) * 100).toFixed(2))
        },
        {
          province: address.st.p,
          district: address.st.d,
          peoplesCount: 1,
          peoplesWithDIdCount: 1,
          peoplesGeneralCount: 0,
          percentage: Number(((1 / countPeople) * 100).toFixed(2))
        },
        {
          province: address.sot.p,
          district: address.sot.d,
          peoplesCount: 1,
          peoplesWithDIdCount: 0,
          peoplesGeneralCount: 1,
          percentage: Number(((1 / countPeople) * 100).toFixed(2))
        },
        {
          province: address.sm.p,
          district: address.sm.d,
          peoplesCount: 1,
          peoplesWithDIdCount: 1,
          peoplesGeneralCount: 0,
          percentage: Number(((1 / countPeople) * 100).toFixed(2))
        }
      ])
    );
    expect(widget7.total).toBe(4);
    expect(widget7.maxPeoples).toEqual({
      name: address.sh.d,
      value: 1
    });
    expect(widget7.maxPeoplesWithDId).toEqual({
      name: address.sm.d,
      value: 1
    });
    expect(widget7.maxPeoplesGeneral).toEqual({
      name: address.sh.d,
      value: 1
    });

    const progresses = await Progress.find({
      status: 2,
      people: {
        $in: peoples.map(o => o._id)
      }
    });

    expect(widget8.data).toHaveLength(22);
    expect(_.sum(widget8.data.map(o => o.count))).toBe(progresses.length);
    expect(widget8.data).toEqual([
      ...dbSchedules
        .slice()
        .splice(0, 15)
        .map(o => ({
          x: o.name,
          y: Number(((3 / countPeople) * 100).toFixed(2)),
          _id: o._id,
          count: 3
        })),
      ...dbSchedules
        .slice()
        .splice(15)
        .map(o => ({
          x: o.name,
          y: Number(((2 / countPeople) * 100).toFixed(2)),
          _id: o._id,
          count: 2
        }))
    ]);

    expect(widget9.data).toEqual(expect.arrayContaining(peoples));
  });

  test('should get widgets when query start and end date', async () => {
    const agent = await request(app)
      .get('/dashboards/1')
      .query({ dateStart: '2020-04-03', dateEnd: '2020-04-03' })
      .set('Accept', 'application/json')
      .set('Authorization', sessionToken)
      .expect('Content-Type', /json/)
      .expect(httpStatus.OK);

    const { widgets } = agent.body;
    const [
      widget1,
      widget2,
      widget3,
      widget4,
      widget5,
      widget6,
      widget7,
      widget8,
      widget9
    ] = widgets;

    const peoples = dbPeoples.filter(o =>
      moment.utc('2020-04-03').isSame(o.createdAt)
    );

    const countPeople = peoples.length;
    const countPeopleWithDid = 1;
    const countPeopleGeneral = countPeople - countPeopleWithDid;

    expect(widget1).toEqual({ value: countPeople });
    expect(widget2).toEqual({ value: countPeople });
    expect(widget3).toEqual({
      value: countPeopleWithDid,
      percentage: Number(((countPeopleWithDid / countPeople) * 100).toFixed(2))
    });

    expect(widget4).toEqual({
      value: countPeopleGeneral,
      percentage: Number(((countPeopleGeneral / countPeople) * 100).toFixed(2))
    });

    const widget5DataNotNull = widget5.data.filter(o => o.y);
    expect(widget5DataNotNull).toHaveLength(1);
    expect(widget5DataNotNull).toEqual([
      { y: 2, t: moment.utc('2020-04-03').valueOf() }
    ]);

    expect(widget6.data).toEqual([
      {
        province: province[0],
        peoplesCount: countPeople,
        peoplesWithDIdCount: countPeopleWithDid,
        peoplesGeneralCount: countPeopleGeneral,
        percentage: 100
      }
    ]);

    expect(widget6.total).toBe(1);
    expect(widget6.maxPeoples).toEqual({
      name: province[0],
      value: countPeople
    });
    expect(widget6.maxPeoplesWithDId).toEqual({
      name: province[0],
      value: countPeopleWithDid
    });
    expect(widget6.maxPeoplesGeneral).toEqual({
      name: province[0],
      value: countPeopleGeneral
    });

    expect(widget7.data).toEqual(
      expect.arrayContaining([
        {
          province: address.sot.p,
          district: address.sot.d,
          peoplesCount: 1,
          peoplesWithDIdCount: 0,
          peoplesGeneralCount: 1,
          percentage: Number(((1 / countPeople) * 100).toFixed(2))
        },
        {
          province: address.sm.p,
          district: address.sm.d,
          peoplesCount: 1,
          peoplesWithDIdCount: 1,
          peoplesGeneralCount: 0,
          percentage: Number(((1 / countPeople) * 100).toFixed(2))
        }
      ])
    );
    expect(widget7.total).toBe(2);
    expect(widget7.maxPeoples).toEqual({
      name: address.sot.d,
      value: 1
    });
    expect(widget7.maxPeoplesWithDId).toEqual({
      name: address.sm.d,
      value: 1
    });
    expect(widget7.maxPeoplesGeneral).toEqual({
      name: address.sot.d,
      value: 1
    });

    const progresses = await Progress.find({
      status: 2,
      people: {
        $in: peoples.map(o => o._id)
      }
    });

    expect(widget8.data).toHaveLength(22);
    expect(_.sum(widget8.data.map(o => o.count))).toBe(progresses.length);
    expect(widget8.data).toEqual([
      ...dbSchedules.map(o => ({
        x: o.name,
        y: Number(((1 / countPeople) * 100).toFixed(2)),
        _id: o._id,
        count: 1
      }))
    ]);

    expect(widget9.data).toEqual(expect.arrayContaining(peoples));
  });
});
