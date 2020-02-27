const fs = require('fs');
const path = require('path');

let parsed;
const env = process.env.NODE_ENV || 'development';

switch (env) {
  case 'test': {
    parsed = {
      mongodb: 'mongodb://localhost:27001/jest',
      port: 5561,
      jwtExpirationInterval: 0.15,
      jwtSecret: 'asdfgh'
    };
    break;
  }

  case 'production': {
    const configPath = path.resolve('./config/production.json');
    parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
    break;
  }

  default: {
    const configPath = path.resolve('./config/development.json');
    parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
    break;
  }
}

exports.env = env;
exports.port = parsed.port;
exports.mongodb = parsed.mongodb;
exports.jwtExpirationInterval = parsed.jwtExpirationInterval;
exports.jwtSecret = parsed.jwtSecret;