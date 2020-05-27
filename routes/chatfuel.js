const express = require('express');
const { body } = require('express-validator');
const httpStatus = require('http-status');
const appConfig = require('../config');
const APIError = require('../utils/APIError');
const validator = require('../middlewares/validator');
const omitWithNull = require('../utils/omitWithNull');
const { REPLY_SUBMITTED_TYPES } = require('../utils/constants');
const logger = require('../utils/logger');
const cloudinary = require('../utils/cloudinary');
const isImageUrl = require('../utils/isImageUrl');

const People = require('../models/people.model');
const Reply = require('../models/reply.model');
const Schedule = require('../models/schedule.model');
const Question = require('../models/question.model');
const Quiz = require('../models/quiz.model');
const Progress = require('../models/progress.model');
const Comment = require('../models/comment.model');

const router = express.Router();

router.use((req, res, next) => {
  req.body = omitWithNull(req.body);

  const key = req.query.api_key || req.header('x-api-key');
  if (key && key === appConfig.apiPublicKey) {
    return next();
  }

  return next(
    new APIError({
      message: 'Forbidden',
      status: httpStatus.FORBIDDEN
    })
  );
});

/**
 * Create a new people
 * @api {POST} /chatfuel/people
 */
router.post(
  '/people',
  validator([body('id', 'Is required').exists()]),
  async (req, res) => {
    try {
      const { id, ...o } = req.body;
      /* const people =  */ await People.findByIdAndUpdate(id, o, {
        upsert: true,
        new: true
        // overwrite: true
      });

      return res.status(httpStatus.CREATED).json({ result: true });
    } catch (error) {
      logger.error('Error create people: ', error);
      return res.status(500).json({
        result: false,
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
  validator([
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
  async (req, res, next) => {
    try {
      const {
        people,
        schedule,
        text,
        image,
        submittedType,
        quiz,
        progress,
        blockId
      } = req.body;

      let saveReply;
      // let saveQuiz;
      // let saveProgress;

      const objectReply = omitWithNull({
        text,
        image,
        submittedType
      });

      // check body request for save to model reply
      if (Object.keys(objectReply).length) {
        saveReply = await Reply.findOneAndUpdate(
          {
            people,
            schedule,
            blockId
          },
          {
            people,
            schedule,
            blockId,
            ...objectReply
          },
          {
            upsert: true,
            new: true
          }
        );
      }

      // check body request has quiz
      if (typeof quiz === 'object' && quiz.question && quiz.answer) {
        const question = await Question.findById(quiz.question);
        // check question is exists
        if (!question) {
          return next(
            new APIError({
              message: 'Validation Error',
              status: httpStatus.BAD_REQUEST,
              errors: [
                {
                  field: 'quiz.question',
                  location: 'body',
                  message: 'Invalid value'
                }
              ]
            })
          );
        }

        /* saveQuiz = */ await Quiz.findOneAndUpdate(
          {
            people,
            question: question._id
          },
          {
            people,
            schedule,
            reply: saveReply._id,
            question: question._id.toString(),
            answer: quiz.answer,
            isCorrect: question.correctAnswers.includes(quiz.answer),
            ...omitWithNull({
              answerText: quiz.answerText || text
            })
          },
          {
            upsert: true,
            new: true
          }
        );
      }

      // check body request for save to model progress
      if (typeof progress === 'object' && progress.status) {
        /* saveProgress = */ await Progress.findOneAndUpdate(
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
      }

      return res.status(httpStatus.CREATED).json({ result: true });
    } catch (error) {
      logger.error('Error create reply: ', error);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        result: false,
        message: error.message
      });
    }
  }
);

/**
 * Create a new comment
 * @api {POST} /chatfuel/comment
 */
router.post(
  '/comment',
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
    body('question')
      .exists()
      .withMessage('Is required')
      .bail()
      .isMongoId()
      .bail()
      .custom(value =>
        Question.findOne({ _id: value, type: 3 }).then(result => {
          if (!result) {
            return Promise.reject('Invalid value');
          }
        })
      ),
    body('answer')
      .exists()
      .withMessage('Is required')
  ]),
  async (req, res) => {
    try {
      const { people, question, answer } = req.body;

      await Comment.findOneAndUpdate(
        { people, question },
        { people, question, answer },
        {
          upsert: true,
          new: true
        }
      );

      return res.status(httpStatus.CREATED).json({ result: true });
    } catch (error) {
      logger.error('Error create comment: ', error);
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        result: false,
        message: error.message
      });
    }
  }
);

/**
 * Generate image certificate
 * @api {POST} /chatfuel/certificate
 */
router.post(
  '/certificate',
  validator([
    body('image', 'Is required').exists(),
    body('name', 'Is required').exists()
  ]),
  async (req, res, next) => {
    try {
      const { image, name } = req.body;
      if (!isImageUrl(image)) {
        throw new Error('Invalid parame image');
      }

      const upload = await cloudinary.upload(image);

      const url = cloudinary.image(upload.public_id, name);
      return res.json({
        result: true,
        set_attributes: {
          request_certificate_success: '1'
        },
        messages: [
          {
            attachment: {
              type: 'image',
              payload: { url }
            }
          }
        ]
      });
    } catch (error) {
      logger.error('Error generate certificate: ', error);
      return res.json({
        result: false,
        set_attributes: {
          request_certificate_success: '0'
        }
      });
    }
  }
);

module.exports = router;
