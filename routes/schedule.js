const express = require('express');
const { query } = require('express-validator');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const authorize = require('../middlewares/auth');
const validator = require('../middlewares/validator');

const Schedule = require('../models/schedule.model');

const router = express.Router();

/**
 * Load document when API with id route parameter is hit
 */
router.param('id', async (req, res, next, id) => {
  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const schedule = await Schedule.findById(id);
      if (schedule) {
        req.schedule = schedule;
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
 * List Schedules
 * @api {get} /schedules
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
        const query = Schedule.find();

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
        countDoc = await Schedule.countDocuments(where);
      }

      return res.json({ results, count: countDoc });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * Create a new schedule
 * @api {post} /schedules
 */
router.post('/', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const schedule = await Schedule.create(object);
    return res.status(httpStatus.CREATED).json(schedule);
  } catch (error) {
    return next(error);
  }
});

/**
 * Get schedule infomation
 * @api {get} /schedules/:id
 */
router.get('/:id', authorize(), async (req, res, next) => {
  try {
    const schedule = req.schedule;
    return res.json(schedule);
  } catch (error) {
    return next(error);
  }
});

/**
 * Update schedule
 * @api {put} /schedules/:id
 */
router.put('/:id', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const schedule = Object.assign(req.schedule, object);
    const savedSchedule = await schedule.save();
    return res.json(savedSchedule);
  } catch (error) {
    return next(error);
  }
});

/**
 * Delete a schedule
 * @api {delete} /peoples/:id
 */
router.delete('/:id', authorize(), async (req, res, next) => {
  try {
    const schedule = req.schedule;
    await schedule.remove();
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
