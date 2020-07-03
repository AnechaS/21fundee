const express = require('express');
const { query } = require('express-validator');
const httpStatus = require('http-status');
const People = require('../models/people.model');
const APIError = require('../utils/APIError');
const authorize = require('../middlewares/auth');
const validator = require('../middlewares/validator');

const router = express.Router();

/**
 * Load document when API with id route parameter is hit
 */
router.param('id', async (req, res, next, id) => {
  try {
    if (id.trim().length) {
      const people = await People.findById(id);
      if (people) {
        req.people = people;
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
 * List Peoples
 * @api {get} /peoples
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
      if (limit !== 0) {
        const query = People.find();

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
        countDoc = await People.countDocuments(where);
      }

      return res.json({ results, count: countDoc });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * Create a new people
 * @api {post} /peoples
 */
router.post('/', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const people = await People.create(object);
    return res.status(httpStatus.CREATED).json(people);
  } catch (error) {
    return next(error);
  }
});

/**
 * Get people information
 * @api {get} /peoples/:id
 */
router.get('/:id', authorize(), async (req, res, next) => {
  try {
    const people = req.people;
    return res.json(people);
  } catch (error) {
    return next(error);
  }
});

/**
 * Update people
 * @api {put} /peoples/:id
 */
router.put('/:id', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const people = Object.assign(req.people, object);
    const savedPeople = await people.save();
    return res.json(savedPeople);
  } catch (error) {
    return next(error);
  }
});

/**
 * Delete a people
 * @api {delete} /peoples/:id
 */
router.delete('/:id', authorize(), async (req, res, next) => {
  try {
    const people = req.people;
    await people.remove();
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
