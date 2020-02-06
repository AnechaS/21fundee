const express = require('express');
const httpStatus = require('http-status');
const Message = require('../models/message');
const router = express.Router();

/**
 * @api {get} /messages List Messages
 * @apiDescription Get a list of messages
 * @apiName ListMessages
 * @apiGroup Message
 */
router.get('/', async (req, res, next) => {
  try {
    const message = await Message.find();
    return res.json(message);
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {post} /peoples Create Message
 * @apiDescription Create a new message
 * @apiName CreateMessage
 * @apiGroup Message
 * 
 * @apiPermission IP Chatfuel
 */
router.post('/', async (req, res, next) => {
  try {
    // find the people
    // ...
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
    // ...
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
    await Message.deleteOne({ _id: req.params.id });
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;