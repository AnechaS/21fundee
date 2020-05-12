const express = require('express');
const { body } = require('express-validator');
const httpStatus = require('http-status');
const APIError = require('../utils/APIError');
const removeReqBodyWithNull = require('../middlewares/removeReqBodyWithNull');
const validator = require('../middlewares/validator');

const People = require('../models/people.model');
const Conversation = require('../models/conversation.model');
const Schedule = require('../models/schedule.model');
const Question = require('../models/question.model');
const Quiz = require('../models/quiz.model');

const router = express.Router();

/**
 * @api {post} /chatfuel/people Uploading Peoples Data
 * @apiDescription Update is exists or create a new people
 * @apiName UploadingPeopleData
 * @apiGroup Chatfuel
 *
 * @apiPermission IP Chatfuel
 */
router.post(
  '/people',
  removeReqBodyWithNull,
  validator([
    body('id', 'Is required').exists(),
    body('botId', 'Is required').exists()
  ]),
  async (req, res, next) => {
    try {
      const { id, ...o } = req.body;
      const people = await People.findByIdAndUpdate(id, o, {
        upsert: true,
        new: true
        // overwrite: true
      });

      return res.status(httpStatus.CREATED).json(people);
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * @api {post} /chatfuel/conversation Uploading Conversation Data
 * @apiDescription Update is exists or create a new conversation
 * @apiName UploadingMessageData
 * @apiGroup Chatfuel
 *
 * @apiPermission IP Chatfuel
 */
router.post(
  '/replies',
  removeReqBodyWithNull,
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
    body('conversation')
      .exists()
      .withMessage('Is required')
      .bail()
      .custom(value => value.constructor === Object)
      .bail()
      .custom(value => Object.keys(value).length),
    body('botId', 'Is required').exists(),
    body('blockId', 'Is required').exists(),
    body('quiz.answer')
      .if(body('quiz').exists())
      .isInt({ max: 10 })
      .toInt(),
    body('quiz.question')
      .if(body('quiz').exists())
      .notEmpty({ min: 1 })
      .bail()
      .isMongoId()
      .withMessage('Invalid value')
  ]),
  async (req, res, next) => {
    try {
      const { conversation, quiz, ...o } = req.body;

      const savedConversation = await Conversation.create({
        ...o,
        ...conversation
      });

      // check body has quiz
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
                conversation: 'Invalid value'
              }
            ]
          });
        }

        await Quiz.create({
          ...o,
          conversation: savedConversation._id,
          question: question._id,
          answer: quiz.answer,
          isCorrectAnswer: question.correctAnswers.includes(quiz.answer)
        });
      }

      return res.status(httpStatus.CREATED).json({ result: true });
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
