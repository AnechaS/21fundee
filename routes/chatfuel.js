const express = require('express');
const { body } = require('express-validator');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
const removeReqBodyWithNull = require('../middlewares/removeReqBodyWithNull');
const checkApiPublicKey = require('../middlewares/checkApiPublicKey');
const validator = require('../middlewares/validator');
const omitWithNull = require('../utils/omitWithNull');
const { REPLY_SUBMITTED_TYPES } = require('../utils/constants');

const People = require('../models/people.model');
const Reply = require('../models/reply.model');
const Schedule = require('../models/schedule.model');
const Question = require('../models/question.model');
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
    body('botId')
      .exists()
      .withMessage('Is required')
      .bail()
      .isLength({ max: 24, min: 24 })
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
    body('botId')
      .exists()
      .withMessage('Is required')
      .bail()
      .isLength({ max: 24, min: 24 }),
    body('blockId')
      .exists()
      .withMessage('Is required')
      .bail()
      .isLength({ max: 24, min: 24 }),
    body('submittedType')
      .if(value => value)
      .bail()
      .isIn(REPLY_SUBMITTED_TYPES),
    body('quiz.question')
      .if(body('quiz').exists())
      .notEmpty()
      .withMessage('Is required')
      .bail()
      .isMongoId()
      .withMessage('Invalid value'),
    body('quiz.answer')
      .if(body('quiz').exists())
      .notEmpty()
      .withMessage('Is required')
      .bail()
      .isInt()
      .toInt(),
    body('progress.status')
      .if(body('progress').exists())
      .notEmpty()
      .withMessage('Is required')
      .bail()
      .isInt({ min: 1, max: 2 })
      .toInt()
  ]),
  async (req, res) => {
    try {
      const {
        people,
        schedule,
        text,
        image,
        submittedType,
        quiz,
        progress,
        botId,
        blockId
      } = req.body;

      const promise = [];

      const objectReply = omitWithNull({
        text,
        image,
        quiz
      });

      // check body request for save to model reply
      if (Object.keys(objectReply).length) {
        if (submittedType) {
          objectReply.submittedType = submittedType;
        }

        // check body request has quiz
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

          objectReply.quiz.isCorrect = question.correctAnswers.includes(
            quiz.answer
          );
        }

        // save reply
        const saveReply = Reply.findOneAndUpdate(
          {
            people,
            schedule,
            blockId
          },
          {
            people,
            schedule,
            botId,
            blockId,
            ...objectReply
          },
          {
            upsert: true,
            new: true
          }
        );

        promise.push(saveReply);
      }

      // check body request for save to model progress
      if (typeof progress === 'object' && progress.status) {
        // save people progress
        const saveProgress = Progress.findOneAndUpdate(
          { people, schedule },
          {
            people,
            schedule,
            ...progress
          },
          {
            upsert: true,
            new: true
          }
        );

        promise.push(saveProgress);
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
