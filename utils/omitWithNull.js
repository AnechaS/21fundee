const _ = require('lodash');

module.exports = function(object) {
  const result =_.omitBy(object, (value) => {
    return _.isUndefined(value) || _.isNaN(value) || _.isNull(value) || value === '' || value === 'null';
  });
  return result;
};