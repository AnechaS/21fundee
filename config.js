// const fs = require('fs');

// TODO add json config app
// const configPath = './.config.json';
// const parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));

// exports.mongodb = process.env.MONGODB_URL || parsed.mongodb;
// exports.port = process.env.PORT || parsed.port;

exports.mongodb = process.env.MONGODB_URL;
exports.port = process.env.PORT || 3000;