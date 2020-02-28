const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const jwt = require('jwt-simple');
const httpStatus = require('http-status');
const appConfig = require('../config');
const APIError = require('../utils/APIError');

/**
* User Roles
*/
const roles = ['super-admin', 'admin'];

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 128
  },
  username: {
    type: String,
    maxlength: 128,
    index: true,
    trim: true,
  },
  role: {
    type: String,
    enum: roles,
    default: 'admin',
  },
  picture: {
    type: String,
    trim: true,
  },
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
UserSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();

    const rounds = appConfig.env === 'test' ? 1 : 10;

    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

/**
 * Methods
 */
UserSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'username', 'email', 'picture', 'role', 'createdAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
  token() {
    const playload = {
      exp: moment().add(appConfig.jwtExpirationInterval, 'minutes').unix(),
      iat: moment().unix(),
      sub: {
        id: this._id,
        role: this.role
      },
    };
    return jwt.encode(playload, appConfig.jwtSecret);
  },
  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  },
});

/**
 * Statics
 */
UserSchema.statics = {
  roles,

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateEmail(error) {
    if (error.name === 'MongoError' && error.code === 11000) {
      return new APIError({
        message: 'Validation Error',
        errors: [{
          field: 'email',
          location: 'body',
          message: 'already exists',
        }],
        status: httpStatus.CONFLICT,
        stack: error.stack,
      });
    }
    return error;
  },

  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findAndGenerateToken(options) {
    const { email, password } = options;
    if (!email) throw new APIError({ message: 'An email is required to generate a token' });

    const user = await this.findOne({ email }).exec();
    if (password) {
      if (user && await user.passwordMatches(password)) {
        return { user, accessToken: user.token() };
      }
    }

    throw new APIError({
      status: httpStatus.UNAUTHORIZED,
      message: 'Incorrect email or password'
    });
  },
};

module.exports = mongoose.model('User', UserSchema);