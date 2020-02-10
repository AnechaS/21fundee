const express = require('express');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const Message = require('../models/message');
const APIError = require('../utils/APIError');

const router = express.Router();

/**
 * @api {get} /messages List Messages
 * @apiDescription Get a list of messages
 * @apiName ListMessages
 * @apiGroup Message
 */
router.get('/', async (req, res, next) => {
  try {
    const message = await Message.find()
      .populate('people')
      .populate('schedule');
    return res.json(message);
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {post} /messages Create Message
 * @apiDescription Create a new message
 * @apiName CreateMessage
 * @apiGroup Message
 * 
 * @apiPermission IP Chatfuel
 */
router.post('/', async (req, res, next) => {
  try {
    // create a new people
    const message = await Message.create(req.body);
    return res
      .status(httpStatus.CREATED)
      .json(message);
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {put} /messages/:id Update Message
 * @apiDescription Update some fields of a message document
 * @apiName UpdateMessage
 * @apiGroup Message
 */
router.put('/:id', async(req, res, next) => {
  try {
    const id = req.params.id;
    if (mongoose.Types.ObjectId.isValid(id)) {
      const message = await Message.findByIdAndUpdate(
        id, 
        { $set: req.body }, 
        { new: true }
      );
      if (message) {
        return res.json(message); 
      }
    }

    // object id is not exists
    throw new APIError({
      message: 'Object not found.',
      status: httpStatus.NOT_FOUND,
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {delete} /messages/:id Delete a schedule
 * @apiDescription Delete a schedule
 * @apiName DeleteMessage
 * @apiGroup Message
 */
router.delete('/:id', async(req, res, next) => {
  try {
    const id = req.params.id;
    if (mongoose.Types.ObjectId.isValid(id)) {
      const message = await Message.findByIdAndRemove(id);
      if (message) {
        return res.status(httpStatus.NO_CONTENT).end();
      }
    }
    
    // object id is not exists
    throw new APIError({
      message: 'Object not found.',
      status: httpStatus.NOT_FOUND,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;