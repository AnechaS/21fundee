const express = require('express');
const { query } = require('express-validator');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const authorize = require('../middlewares/auth');
const validator = require('../middlewares/validator');

const Progress = require('../models/progress.model');

const router = express.Router();

/**
 * Load document when API with id route parameter is hit
 */
router.param('id', async (req, res, next, id) => {
  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const progress = await Progress.findById(id);
      if (progress) {
        req.progress = progress;
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
 * List progresses
 * @api {get} /progresses
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
        const query = Progress.find();

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
        countDoc = await Progress.countDocuments(where);
      }

      return res.json({ results, count: countDoc });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * Create a new progress
 * @api {post} /progresses
 */
router.post('/', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const progress = await Progress.create(object);
    return res.status(httpStatus.CREATED).json(progress);
  } catch (error) {
    return next(error);
  }
});

/**
 * Get progress information
 * @api {get} /progresses/:id
 */
router.get('/:id', authorize(), async (req, res, next) => {
  try {
    const progress = await req.progress;
    return res.json(progress);
  } catch (error) {
    return next(error);
  }
});

/**
 * Update progress
 * @api {put} /progresses/:id
 */
router.put('/:id', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const progress = Object.assign(req.progress, object);
    const savedProgress = await progress.save();
    return res.json(savedProgress);
  } catch (error) {
    return next(error);
  }
});

/**
 * Delete a progress
 * @api {delete} /progresses/:id
 */
router.delete('/:id', authorize(), async (req, res, next) => {
  try {
    const progress = req.progress;
    await progress.remove();
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
