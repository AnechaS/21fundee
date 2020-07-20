const express = require('express');
const { query } = require('express-validator');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const authorize = require('../middlewares/auth');
const validator = require('../middlewares/validator');

const Question = require('../models/question.model');

const router = express.Router();

/**
 * Load document when API with id route parameter is hit
 */
router.param('id', async (req, res, next, id) => {
  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const question = await Question.findById(id);
      if (question) {
        req.question = question;
        return next();
      }
    }

    // object id is not exists
    throw new APIError({
      message: 'Object not found.',
      status: httpStatus.NOT_FOUND
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * List question
 * @api {get} /question
 */
router.get(
  '/',
  authorize(),
  validator([
    query('where')
      .if(value => value)
      .isJSON()
      .customSanitizer(value => {
        return JSON.parse(value);
      }),
    query('limit')
      .if(value => value)
      .isInt()
      .toInt(),
    query('skip')
      .if(value => value)
      .isInt()
      .toInt(),
    query('count')
      .if(value => value)
      .isIn(['0', '1'])
      .toInt()
  ]),
  async (req, res, next) => {
    try {
      const { where, sort, limit = 100, skip, select, count } = req.query;

      let results = [];
      if (!(limit === 0 && count)) {
        const query = Question.find();

        if (where) {
          query.where(where);
        }

        if (sort) {
          query.sort(sort);
        }

        if (select) {
          query.select(select);
        }

        if (skip) {
          query.skip(skip);
        }

        results = await query.limit(limit);
      }

      let countDoc;
      if (count) {
        countDoc = await Question.countDocuments(where);
      }

      return res.json({ results, count: countDoc });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * Create a new question
 * @api {post} /question
 */
router.post('/', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const question = await Question.create(object);
    return res.status(httpStatus.CREATED).json(question);
  } catch (error) {
    return next(error);
  }
});

/**
 * Get question infomation
 * @api {get} /question/:id
 */
router.get('/:id', authorize(), async (req, res, next) => {
  try {
    const question = await req.question;
    return res.json(question);
  } catch (error) {
    return next(error);
  }
});

/**
 * Update question
 * @api {put} /question/:id
 */
router.put('/:id', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const question = Object.assign(req.question, object);
    const savedQuestion = await question.save();
    return res.json(savedQuestion);
  } catch (error) {
    return next(error);
  }
});

/**
 * Delete a question
 * @api {delete} /question/:id
 */
router.delete('/:id', authorize(), async (req, res, next) => {
  try {
    const question = req.question;
    await question.remove();
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
