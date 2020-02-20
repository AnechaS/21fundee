const express = require('express');
const { body } = require('express-validator');
const httpStatus = require('http-status');
const People = require('../models/people');
const Message = require('../models/message');
const removeReqBodyWithNull = require('../middlewares/removeReqBodyWithNull');
const validator = require('../middlewares/validator');
const ipChatfuel = require('../middlewares/ipChatfuel');

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
  validator([  body('uid', 'Is required').exists() ]),
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
  async (req, res, next) => {
    try {
      const message = await Message.create(req.body);
      return res
        .status(httpStatus.CREATED)
        .json(message);
    } catch (error) {
      return next(error);
    }
  });

module.exports = router;