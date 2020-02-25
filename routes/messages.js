const express = require('express');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const Message = require('../models/message.model');
const APIError = require('../utils/APIError');

const router = express.Router();

/**
 * Load document when API with id route parameter is hit
 */
router.param('id', async (req, res, next, id) => {
  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const message = await Message.findById(id);
      if (message) {
        req.message = message;
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
 */
router.post('/', async (req, res, next) => {
  try {
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
    const message = Object.assign(req.message, req.body);
    const savedMessage = await message.save();
    return res.json(savedMessage);
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
    const message = req.message;
    await message.remove();
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;