const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';

let parsed;

switch (env) {
  case 'test': {
    parsed = {
      mongodb: 'mongodb://localhost:27001/jest',
      port: 5561
    };
    break;
  }

  case 'development': {
    const configPath = path.resolve('./config/development.json');
    parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
    break;
  }

  default: {
    const configPath = path.resolve('./config/production.json');
    parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
    break;
  }
}

parsed.env = env;

module.exports = parsed;
