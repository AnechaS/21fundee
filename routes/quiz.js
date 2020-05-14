const express = require('express');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const authorize = require('../middlewares/auth');

const Quiz = require('../models/quiz.model');

const router = express.Router();

/**
 * Load document when API with id route parameter is hit
 */
router.param('id', async (req, res, next, id) => {
  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const quiz = await Quiz.findById(id);
      if (quiz) {
        req.quiz = quiz;
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
 * @api {get} /quizs List Quizs
 * @apiDescription Get a list of quizs
 * @apiName ListQuizs
 * @apiGroup Quiz
 */
router.get('/', authorize(), async (req, res, next) => {
  try {
    const quiz = await Quiz.find()
      .limit(2000)
      .populate('people')
      .populate('schedule')
      .populate('question');
    return res.json(quiz);
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {post} /quizs Create Quiz
 * @apiDescription Create a new quiz
 * @apiName CreateQuiz
 * @apiGroup Quiz
 */
router.post('/', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const quiz = await Quiz.create(object);
    return res.status(httpStatus.CREATED).json(quiz);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', authorize(), async (req, res, next) => {
  try {
    const quiz = await req.quiz
      .populate('people')
      .populate('schedule')
      .populate('question')
      .execPopulate();
    return res.json(quiz);
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {put} /quizs/:id Update Quiz
 * @apiDescription Update some fields of a quiz document
 * @apiName UpdateQuiz
 * @apiGroup Quiz
 */
router.put('/:id', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const quiz = Object.assign(req.quiz, object);
    const savedQuiz = await quiz.save();
    return res.json(savedQuiz);
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {delete} /quizs/:id Delete a schedule
 * @apiDescription Delete a schedule
 * @apiName DeleteQuiz
 * @apiGroup Quiz
 */
router.delete('/:id', authorize(), async (req, res, next) => {
  try {
    const quiz = req.quiz;
    await quiz.remove();
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
