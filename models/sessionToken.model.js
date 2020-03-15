const mongoose = require('mongoose');
const crypto = require('crypto');
const moment = require('moment');

const RefreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date
  }
});

RefreshTokenSchema.statics = {
  /**
   * Generate a refresh token object and saves it into the database
   *
   * @param {User} user
   * @returns {RefreshToken}
   */
  generate(user) {
    const userId = user._id;
    const token = `r:${userId}.${crypto.randomBytes(40).toString('hex')}`;
    const expiresAt = moment().add(30, 'days').toDate();
    const tokenObject = new RefreshToken({
      token, user, expiresAt,
    });
    tokenObject.save();
    return tokenObject;
  },
};

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);
module.exports = RefreshToken;