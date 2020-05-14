const express = require('express');
const { body } = require('express-validator');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
const removeReqBodyWithNull = require('../middlewares/removeReqBodyWithNull');
const checkApiPublicKey = require('../middlewares/checkApiPublicKey');
const validator = require('../middlewares/validator');
const omitWithNull = require('../utils/omitWithNull');

const People = require('../models/people.model');
const Reply = require('../models/reply.model');
const Schedule = require('../models/schedule.model');
const Question = require('../models/question.model');
const Quiz = require('../models/quiz.model');
const Progress = require('../models/progress.model');

const router = express.Router();

// tranform ref data for get id bot and block
const tranformRefParam = string => {
  const arr = string
    .split('=')
    .pop()
    .split('/');

  const result = {
    botId: arr[0],
    blockId: arr[1],
    element: arr[2]
  };

  return result;
};

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
    body('ref', 'Is required')
      .exists()
      .bail()
      .notEmpty()
      .bail()
      .matches(/(\w{1,})?=\w{1,}\/\w{1,}\/\w{1,}$/)
      .withMessage('Invalid value')
  ]),
  async (req, res) => {
    try {
      const { id, ref, ...o } = req.body;

      const { botId } = tranformRefParam(ref);

      /* const people =  */ await People.findByIdAndUpdate(
        id,
        { ...o, botId },
        {
          upsert: true,
          new: true
          // overwrite: true
        }
      );

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
      .notEmpty()
      .bail()
      .matches(/(\w{1,})?=\w{1,}\/\w{1,}\/\w{1,}$/)
      .withMessage('Invalid value'),
    body('type')
      .if(value => value)
      .bail()
      .isInt({ min: 1, max: 4 })
      .toInt(),
    body('quiz.answer')
      .if(body('quiz').exists())
      .notEmpty()
      .withMessage('Is required')
      .bail()
      .isInt()
      .toInt(),
    body('quiz.question')
      .if(body('quiz').exists())
      .notEmpty()
      .withMessage('Is required')
      .bail()
      .isMongoId()
      .withMessage('Invalid value'),
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
        source,
        type,
        ref,
        quiz,
        progress
      } = req.body;

      const { botId, blockId } = tranformRefParam(ref);

      const promise = [];

      // check body request for save to model reply
      if (typeof text !== 'undefined' || typeof source !== 'undefined') {
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
            type,
            botId,
            blockId,
            ...omitWithNull({
              text,
              source
            })
          },
          {
            upsert: true,
            new: true
          }
        );

        promise.push(saveReply);
      }

      // check body request for save to model quiz
      if (typeof quiz === 'object' && quiz.question && quiz.answer) {
        const saveQuiz = Question.findById(quiz.question).then(result => {
          // check question is exists
          if (!result) {
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

          return Quiz.findOneAndUpdate(
            {
              people,
              schedule,
              blockId,
              question: result._id
            },
            {
              people,
              schedule,
              question: result._id.toString(),
              answer: quiz.answer,
              isCorrectAnswer: result.correctAnswers.includes(quiz.answer),
              botId,
              blockId,
              ...omitWithNull({
                answerText: quiz.answerText || text
              })
            },
            {
              upsert: true,
              new: true
            }
          );
        });

        promise.push(saveQuiz);
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
