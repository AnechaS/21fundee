const fs = require('fs');

const configPath = './.config.json';
const parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

// TODO add env config
exports.mongodb = process.env.MONGODB_URL || parsed.mongodb;
exports.port = process.env.PORT || parsed.port;