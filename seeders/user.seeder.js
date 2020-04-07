const { Seeder } = require('mongoose-data-seed');
const User = require('../models/user.model');

class UserSeeder extends Seeder {
  async shouldRun() {
    const count = await User.countDocuments().exec();
    return count === 0;
  }

  async run() {
    const data = [
      {
        email: 'admin@email.com',
        password: '123456',
        name: 'admin',
        pic: '/media/users/300_25.jpg',
        role: 'admin'
      }
    ];
    return User.create(data);
  }
}

module.exports = UserSeeder;
