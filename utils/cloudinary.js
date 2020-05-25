const fetch = require('node-fetch');
const queryString = require('querystring');

/**
 * Upload image to cloudinaru
 * @example upload('image.jpg')
 * @param {String} source
 * @return {Promise} Response upload to cloudinary
 */
exports.upload = async function(source) {
  const qs = queryString.stringify({
    file: source,
    upload_preset: 'ufbglfuq'
  });
  const url = `https://api.cloudinary.com/v1_1/x21fundee/image/upload?${qs}`;
  return fetch(url, {
    method: 'POST'
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    return response.json();
  });
};

/**
 * Get image
 * @example image('image.jpg')
 * @param {String} source
 * @param {String} text
 * @return {String} Url image
 */
exports.image = function(source) {
  const transformations = 'c_thumb,g_face:auto,h_700,w_700/l_Frames:frame-1,y_160/l_text:Fonts:Itim-Regular.ttf_70:NAME,y_400,co_rgb:4E2A10';
  const url = `http://res.cloudinary.com/x21fundee/image/upload/${transformations}/${source}`;
  return url;
};

