const fs = require('fs');
const path = require('path');

let parsed;
const env = process.env.NODE_ENV || 'development';

switch (env) {
  case 'test': {
    parsed = {
      mongoURI: 'mongodb://localhost:27001/jest',
      port: 5561,
      apiPublicKey: 'abcd'
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
exports.port = parsed.port || 3000;

exports.logsFolder = parsed.logsFolder;
exports.logLevel = parsed.logLevel;
exports.maxLogFiles = parsed.maxLogFiles || '14d';
exports.jsonLogs = parsed.jsonLogs || true;

exports.mongoURI = parsed.mongoURI;

exports.apiKey = parsed.apiKey;
exports.apiPublicKey = parsed.apiPublicKey;