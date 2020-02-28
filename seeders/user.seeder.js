const { Seeder } = require('mongoose-data-seed');
const User = require('../models/user.model');

const data = [
  {
    email: 'administration@email.com',
    password: '123123',
    username: 'administration',
    role: 'super-admin'
  },
];

class UserSeeder extends Seeder {
  async shouldRun() {
    const count = await User.countDocuments().exec();

    return count === 0;
  }

  async run() {
    return User.create(data);
  }
}

module.exports = UserSeeder;