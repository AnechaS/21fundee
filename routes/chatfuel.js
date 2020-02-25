const express = require('express');
const { body } = require('express-validator');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const removeReqBodyWithNull = require('../middlewares/removeReqBodyWithNull');
const validator = require('../middlewares/validator');
const ipChatfuel = require('../middlewares/ipChatfuel');
const APIError = require('../utils/APIError');

const People = require('../models/people.model');
const Message = require('../models/message.model');
const Schedule = require('../models/schedule.model');
const Question = require('../models/question.model');

const router = express.Router();

/**
 * @api {post} /chatfuel/people Uploading Peoples Data
 * @apiDescription Update is exists or create a new people
 * @apiName UploadingPeopleData
 * @apiGroup Chatfuel
 * 
 * @apiPermission IP Chatfuel
 */
router.post('/people',
  ipChatfuel,
  removeReqBodyWithNull,
  validator([  body('uid', 'Is required').isLength({ min: 1 }) ]),
  async (req, res, next) => {
    try {
      const { uid, ...o } = req.body;
      const people = await People.findByIdAndUpdate(uid, o, {
        upsert: true,
        new: true
        // overwrite: true
      });
  
      return res.status(httpStatus.CREATED).json(people);
    } catch (error) {
      return next(error);
    }
  });

/**
 * @api {post} /chatfuel/message Uploading Message Data
 * @apiDescription Update is exists or create a new message
 * @apiName UploadingMessageData
 * @apiGroup Chatfuel
 * 
 * @apiPermission IP Chatfuel
 */
router.post('/message',
  ipChatfuel,
  removeReqBodyWithNull,
  validator([
    body('people', 'Is required')
      .isLength({ min: 1 })
      .bail()
      .custom(value => People.findById(value).then(result => {
        if (!result) {
          return Promise.reject('Invalid value');
        }
      })),
    body('schedule', 'Is required')
      .isLength({ min: 1 })
      .bail()
      .custom(value => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Invalid value')
      .bail()
      .custom(value => Schedule.findById(value).then(result => {
        if (!result) {
          return Promise.reject('Invalid value');
        }
      })),
    body('quiz.answer').if(body('quiz').exists()).isInt({ max: 10 }),
    body('quiz.question')
      .if(body('quiz').exists())
      .notEmpty({ min: 1 })
      .bail()
      .custom(value => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Invalid value'),
  ]),
  async (req, res, next) => {
    try {
      const object = req.body;
      if (typeof req.body.quiz !== 'undefined') {
        // get question with id
        const question = await Question.findById(req.body.quiz.question);
        // if question not exists then throw
        if (!question) {
          throw new APIError({
            message: 'Validation Error',
            status: httpStatus.BAD_REQUEST,
            errors: [{
              field: 'quiz.question',
              location: 'body',
              message: 'Invalid value',
            }],
          });
        }

        object.quiz = {
          question: question._id,
          answer: req.body.quiz.answer,
          isCorrect: question.correct === req.body.quiz.answer,
        };
      }

      const message = await Message.create(object);
      return res
        .status(httpStatus.CREATED)
        .json(message);
    } catch (error) {
      return next(error);
    }
  });

module.exports = router;