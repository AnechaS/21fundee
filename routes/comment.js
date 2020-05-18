const express = require('express');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const authorize = require('../middlewares/auth');

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
router.get('/', authorize(), async (req, res, next) => {
  try {
    const comment = await Comment.find().limit(2000);
    return res.json(comment);
  } catch (error) {
    return next(error);
  }
});

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
 * Get a comment
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
