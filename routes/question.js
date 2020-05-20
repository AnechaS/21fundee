const express = require('express');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const authorize = require('../middlewares/auth');

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
router.get('/', authorize(), async (req, res, next) => {
  try {
    const question = await Question.find().limit(2000);
    return res.json(question);
  } catch (error) {
    return next(error);
  }
});

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
