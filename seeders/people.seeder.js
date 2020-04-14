const { Seeder } = require('mongoose-data-seed');
const faker = require('faker');
const People = require('../models/people.model');

class PeopleSeeder extends Seeder {
  async shouldRun() {
    const count = await People.countDocuments().exec();

    return count === 0;
  }

  async run() {
    const data = Array.from({ length: 100 }, () => ({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      gender: faker.random.arrayElement(['male', 'female']),
      profilePicUrl: faker.image.image(),
      province: 'สงขลา',
      district: faker.random.arrayElement([
        'เทพา',
        'เมือง',
        'หาดใหญ่',
        'จะนะ',
        'สะเดา',
        'อำเภออื่นๆ'
      ]),
      dentalId: faker.random.arrayElement([
        'x',
        faker.helpers.replaceSymbolWithNumber('###-####-###')
      ]),
      childName: faker.name.firstName(),
      childBirthday: faker.random.arrayElement([
        'ก่อน 2560',
        '2560',
        '2561',
        '2562'
      ]),
      botId: 'asdfqwer'
    }));
    return People.create(data);
  }
}

module.exports = PeopleSeeder;
