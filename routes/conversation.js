const express = require('express');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const APIError = require('../utils/APIError');
const authorize = require('../middlewares/auth');

const Conversation = require('../models/conversation.model');

const router = express.Router();

/**
 * Load document when API with id route parameter is hit
 */
router.param('id', async (req, res, next, id) => {
  try {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const conversation = await Conversation.findById(id);
      if (conversation) {
        req.conversation = conversation;
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
 * @api {get} /conversations List Conversations
 * @apiDescription Get a list of quiz
 * @apiName ListConversations
 * @apiGroup Conversation
 */
router.get('/', authorize(), async (req, res, next) => {
  try {
    const conversation = await Conversation.find()
      // .limit(2000)
      .populate('people')
      .populate('schedule');
    return res.json(conversation);
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {post} /conversations Create Conversation
 * @apiDescription Create a new convaersaiton
 * @apiName CreateConversation
 * @apiGroup Conversation
 */
router.post('/', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const conversation = await Conversation.create(object);
    return res.status(httpStatus.CREATED).json(conversation);
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', authorize(), async (req, res, next) => {
  try {
    const conversation = await req.conversation
      .populate('people')
      .populate('schedule')
      .execPopulate();
    return res.json(conversation);
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {put} /conversations/:id Update Conversation
 * @apiDescription Update some fields of a conversation document
 * @apiName UpdateConversation
 * @apiGroup Conversation
 */
router.put('/:id', authorize(), async (req, res, next) => {
  try {
    const object = req.body;
    const conversation = Object.assign(req.conversation, object);
    const savedConversation = await conversation.save();
    return res.json(savedConversation);
  } catch (error) {
    return next(error);
  }
});

/**
 * @api {delete} /conversations/:id Delete a schedule
 * @apiDescription Delete a schedule
 * @apiName DeleteConversation
 * @apiGroup Conversation
 */
router.delete('/:id', authorize(), async (req, res, next) => {
  try {
    const conversation = req.conversation;
    await conversation.remove();
    return res.status(httpStatus.NO_CONTENT).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
