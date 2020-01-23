const fs = require('fs');

let parsed = {};
if (process.env.NODE_ENV === 'test') {
  parsed = {
    mongodb: 'mongodb://localhost:27001/jest',
    port: 27001
  };
} else {
  const configPath = './.config.json';
  parsed = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));
}


// TODO add env config
module.exports = parsed;
