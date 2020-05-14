const express = require('express');
const { body } = require('express-validator');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
const removeReqBodyWithNull = require('../middlewares/removeReqBodyWithNull');
const checkApiPublicKey = require('../middlewares/checkApiPublicKey');
const validator = require('../middlewares/validator');

const People = require('../models/people.model');
const Reply = require('../models/reply.model');
const Schedule = require('../models/schedule.model');
const Question = require('../models/question.model');
const Quiz = require('../models/quiz.model');
const Progress = require('../models/progress.model');

const router = express.Router();

/**
 * Create a new people
 * @api {POST} /chatfuel/people
 */
router.post(
  '/people',
  removeReqBodyWithNull,
  checkApiPublicKey,
  validator([
    body('id', 'Is required').exists(),
    body('botId', 'Is required').exists()
  ]),
  async (req, res) => {
    try {
      const { id, ...o } = req.body;
      /* const people =  */ await People.findByIdAndUpdate(id, o, {
        upsert: true,
        new: true
        // overwrite: true
      });

      return res.status(httpStatus.CREATED).json({ created: true });
    } catch (error) {
      return res.status(500).json({
        created: false,
        message: error.message
      });
    }
  }
);

/**
 * Save data received from chatfuel
 * @api {POST} /chatfuel/reply
 */
router.post(
  '/reply',
  removeReqBodyWithNull,
  checkApiPublicKey,
  validator([
    body('people')
      .exists()
      .withMessage('Is required')
      .bail()
      .custom(value =>
        People.findById(value).then(result => {
          if (!result) {
            return Promise.reject('Invalid value');
          }
        })
      ),
    body('schedule')
      .exists()
      .withMessage('Is required')
      .bail()
      .isMongoId()
      .bail()
      .custom(value =>
        Schedule.findById(value).then(result => {
          if (!result) {
            return Promise.reject('Invalid value');
          }
        })
      ),
    body('ref', 'Is required')
      .exists()
      .bail()
      .notEmpty(),
    body('quiz.answer')
      .if(body('quiz').exists())
      .isInt({ max: 10 })
      .toInt(),
    body('quiz.question')
      .if(body('quiz').exists())
      .notEmpty()
      .bail()
      .isMongoId()
      .withMessage('Invalid value'),
    body('status')
      .if(value => value)
      .isIn(['started', 'complete'])
  ]),
  async (req, res) => {
    try {
      const {
        people,
        schedule,
        text,
        source,
        type,
        ref,
        quiz,
        status
      } = req.body;

      const promise = [];

      // tranform ref data for get id bot and block
      const arrRef = ref
        .split('=')
        .pop()
        .split('/');
      const botId = arrRef[0];
      const blockId = arrRef[1];

      if (typeof quiz !== 'undefined') {
        const question = await Question.findById(quiz.question);
        // check question is exists
        if (!question) {
          throw new APIError({
            message: 'Validation Error',
            status: httpStatus.BAD_REQUEST,
            errors: [
              {
                field: 'quiz.question',
                location: 'body',
                message: 'Invalid value'
              }
            ]
          });
        }

        // save quiz
        const saveQuiz = Quiz.create({
          people,
          schedule,
          question: question._id,
          answer: quiz.answer,
          isCorrectAnswer: question.correctAnswers.includes(quiz.answer),
          botId,
          blockId
        });

        promise.push(saveQuiz);
      }

      if (typeof text !== 'undefined' || typeof source !== 'undefined') {
        // save reply
        const saveReply = Reply.create({
          people,
          schedule,
          text,
          source,
          type,
          botId,
          blockId
        });

        promise.push(saveReply);
      }

      if (typeof status !== 'undefined') {
        // save people progress
        const progress = Progress.create({
          people,
          schedule,
          status
        });

        promise.push(progress);
      }

      await Promise.all(promise);

      return res.status(httpStatus.CREATED).json({ created: true });
    } catch (error) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        created: false,
        message: error.message
      });
    }
  }
);

module.exports = router;
