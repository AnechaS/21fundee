const express = require('express');
const { query } = require('express-validator');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const authorize = require('../middlewares/auth');
const validator = require('../middlewares/validator');

const Comment = require('../models/comment.model');

const router = express.Router();

/**
 * Load document when API with id route parameter is hit
 */
router.param('id', async (req, res, next, id) => {
  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const comment = await Comment.findById(id);
      if (comment) {
        req.comment = comment;
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
 * List comments
 * @api {get} /comments
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
        const query = Comment.find();

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
        countDoc = await Comment.countDocuments(where);
      }

      return res.json({ results, count: countDoc });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * Create comment
 * @api {post} /comments
 */
router.post('/', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const comment = await Comment.create(object);
    return res.status(httpStatus.CREATED).json(comment);
  } catch (error) {
    return next(error);
  }
});

/**
 * Get comment information
 * @api {post} /comments
 */
router.get('/:id', authorize(), async (req, res, next) => {
  try {
    const comment = req.comment;
    return res.json(comment);
  } catch (error) {
    return next(error);
  }
});

/**
 * Update a comment
 * @api {put} /comments/:id
 */
router.put('/:id', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const comment = Object.assign(req.comment, object);
    const savedReply = await comment.save();
    return res.json(savedReply);
  } catch (error) {
    return next(error);
  }
});

/**
 * Delete a comment
 * @api {delete} /comments/:id
 */
router.delete('/:id', authorize(), async (req, res, next) => {
  try {
    const comment = req.comment;
    await comment.remove();
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
