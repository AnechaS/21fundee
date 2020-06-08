const fetch = require('node-fetch');
const _ = require('lodash');
const appConfig = require('../config');

const HOST = 'https://dashboard.chatfuel.com';
const BOT_ID = appConfig.chatfuelBotId;
const API_TOKEN = appConfig.chatfuelAPIToken;

/**
 * Fetch user facebook by id
 * @param {String} id messenger user id
 * @return {Promise}
 */
exports.getUser = async function(id) {
  if (!id) {
    return;
  }

  const body = {
    parameters: [
      {
        name: 'messenger user id',
        values: [id],
        type: 'system'
      }
    ]
  };

  const resp = await fetch(`${HOST}/api/bots/${BOT_ID}/users`, {
    method: 'POST',
    headers: {
      'content-type': ' application/json;charset=UTF-8',
      authorization: `Bearer ${API_TOKEN}`
    },
    body
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    return response.json();
  });

  if (!resp.success) {
    throw new Error('Request failure');
  }

  if (resp.result.count) {
    const fieldSelects = [
      'messenger user id',
      'first name',
      'last name',
      'gender',
      'profile pic url',
      'region',
      'province',
      'district',
      'name',
      'year'
    ];

    let user = resp.result.users[0];
    user = user.reduce((result, o) => {
      if (fieldSelects.includes(o.name)) {
        const key = _.camelCase(o.name);
        let value = o.values[0];
        if (key === 'year') {
          value = value.replace('b4', 'ก่อน');
        }
        result[key] = value;
      }

      return result;
    }, {});

    return user;
  }
};
