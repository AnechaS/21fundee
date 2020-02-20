const express = require('express');
const { body } = require('express-validator');
const httpStatus = require('http-status');
const removeReqBodyWithNull = require('../middlewares/removeReqBodyWithNull');
const validator = require('../middlewares/validator');
const ipChatfuel = require('../middlewares/ipChatfuel');
const APIError = require('../utils/APIError');

const People = require('../models/people');
const Message = require('../models/message');
const Question = require('../models/question');
const Quiz = require('../models/quiz');

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
    body('people', 'Is required').isLength({ min: 1 }),
  ]),
  async (req, res, next) => {
    try {
      // validate people req 
      const people = await People.findById(req.body.people);
      if (!people) {
        throw new APIError({
          message: 'People not found.',
          status: httpStatus.BAD_REQUEST
        });
      }

      const message = await Message.create(req.body);
      return res
        .status(httpStatus.CREATED)
        .json(message);
    } catch (error) {
      return next(error);
    }
  });

/**
 * @api {post} /chatfuel/quiz Create Quiz
 * @apiDescription Create a new quiz
 * @apiName CreateQuiz
 * @apiGroup Chatfuel
 * 
 * @apiPermission IP Chatfuel
 */
router.post('/quiz',
  ipChatfuel,
  removeReqBodyWithNull,
  validator([
    body('question', 'Is required').isLength({ min: 1 }),
    body('people', 'Is required').isLength({ min: 1 }),
  ]),
  async (req, res, next) => {
    try {
      // validate people req 
      const people = await People.findById(req.body.people);
      if (!people) {
        throw new APIError({
          message: 'People not found.',
          status: httpStatus.BAD_REQUEST
        });
      }

      // get question with id
      const question = await Question.findById(req.body.question);
      if (!question) {
        throw new APIError({
          message: 'Question not found.',
          status: httpStatus.BAD_REQUEST
        });
      }

      const quiz = await Quiz.create({
        question,
        people: req.body.people,
        answer: req.body.answer,
        isCorrect: question.correct === req.body.answer,
        botId: req.body.botId,
        blockId: req.body.blockId
      });

      return res.status(httpStatus.CREATED).json(quiz);
    } catch (error) {
      return next(error);
    }
  });

module.exports = router;