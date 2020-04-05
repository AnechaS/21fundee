const { Seeder } = require('mongoose-data-seed');
const User = require('../models/user.model');

const data = [
  {
    email: 'administration@email.com',
    password: '123123',
    name: 'root',
    pic: '/media/users/300_25.jpg',
    role: 'admin'
  }
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
