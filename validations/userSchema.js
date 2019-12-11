exports.province = {
  properties: {
    user_id: {
      type: 'string'
    },
    first_name: {
      type: 'string'
    },
    last_name: {
      type: 'string'
    },
    last_clicked_button_name: {
      type: 'string'
    }
  },
  required: [ 'user_id', 'last_clicked_button_name' ],
};
