const Ajv = require('ajv');

const userSchema = require('./userSchema');

const ajv = new Ajv();

ajv.addSchema(userSchema.province, '/userSchema/province');

const validateJson = (schema, json) => {
  return ajv.validate(json, schema);
};

module.exports = validateJson;