const express = require('express');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const authorize = require('../middlewares/auth');

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
 * List Progress
 * @api {get} /progresses
 */
router.get('/', authorize(), async (req, res, next) => {
  try {
    const progress = await Progress.find().limit(2000);
    return res.json(progress);
  } catch (error) {
    return next(error);
  }
});

/**
 * Create a new Progress
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
 * Get The Progress
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
 * Update some fields of a progress document
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
