const { Seeder } = require('mongoose-data-seed');
const People = require('../models/people.model');

class PeopleSeeder extends Seeder {
  async shouldRun() {
    const count = await People.countDocuments().exec();

    return count === 0;
  }

  async run() {
    const data = [
      {
        firstName: 'Makus',
        lastName: 'Yui',
        gender: 'male',
        profilePicUrl: '/media/users/300_25.jpg',
        province: 'สงขลา',
        district: 'เทพา',
        dentalId: 'x',
        childName: 'Bee',
        childBirthday: '2560',
        botId: 'asdfqwer',
      }
    ];
    return People.create(data);
  }
}

module.exports = PeopleSeeder;
